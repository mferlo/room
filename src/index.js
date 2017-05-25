import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import pubsub from 'pubsub-js';
import './index.css';

// Consider continuing to make base classes. Item seems like a good start; we might want
// "Container" and maybe even "Thing" (Items go in inventory and can be used; Things are
// static in the room). Remember that css can do a lot of the heavy lifting...
// Or: KISS/YAGNI. Unclear.

// Make everything be the same datatype (see PickUp and Consume for the awkwardness here).

const Topics = {
    PickedUpItem: 'picked-up-item',
    ConsumedItem: 'consumed-item',
    Message: 'message',
    GameState: 'game-state'
};

class Item extends Component {
    constructor(props) {
        super(props);

        this.state = { pickedUp: false };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        if (!this.state.pickedUp) {
            this.setState(_ => ({pickedUp: true}));
            pubsub.publish(Topics.PickedUpItem, this);
        } else {
            // Alternately: "activate" the item so it may interact with
            // something in the room. I kind of like the auto-usage, though:
            // makes the room easier, and given that we can emit messages,
            // it's simple enough to say what just happened.
            pubsub.publish(Topics.Message, `${this.props.description}. ${this.props.hint}`);
        }

        event.stopPropagation();
    }

    render() {
        return (<div className={this.props.type} onClick={this.handleClick}>
                  {this.props.description}
                </div>);
    }
}

class Door extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.initialState.open,
            locked: this.props.initialState.locked,
            canUnlock: false
        };

        // FIXME: annoying, but maybe goes away in the big "Thing" refactor
        this.UnlockedBy = this.props.initialState.unlockedBy;
        
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const unlocker = this.UnlockedBy.Description;
        if (!this.state.locked) {
            pubsub.publish(Topics.Message, "You open the door");
            this.setState(_ => ({open: true}));
            pubsub.publish(Topics.Message, "You have escaped the room");
            pubsub.publish(Topics.Message, "A WINNER IS YOU");
        } else if (this.state.canUnlock) {
            pubsub.publish(Topics.Message, `You unlock the door using ${unlocker}`);
            this.setState(_ => ({locked: false}));
        } else {
            pubsub.publish(Topics.Message, `It's locked. ${unlocker} will unlock it.`);
        }
    }

    makeUnlockableIfKey(item) {
        if (this.UnlockedBy.Id === item.props.id) {
            this.setState(_ => ({canUnlock: true}));
        }
    }

    componentDidMount() {
        // FIXME: unclear if this approach will work or is fundamentally broken.
        pubsub.subscribe(
            Topics.PickedUpItem,
            (_, item) => this.makeUnlockableIfKey(item));
    }

    // FIXME unsub
    
    render() {
        if (this.state.open) {
            return (<img src="https://morbotron.com/gif/S07E11/35869/41916.gif?b64lines="
                         alt="But what fresh horrors await us on the other side?"/>);
        } else {
            return (<div id="door" onClick={this.handleClick}>
                    {this.state.locked ? 'A locked' : this.state.open ? 'An open' : 'A closed'} door
                    </div>);
        }
    }
}

class Drawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            contents: props.initialState.contents
        };
        
        this.handleClick = this.handleClick.bind(this);
        this.pickedUpItem = this.pickedUpItem.bind(this);
    }

    handleClick() {
        pubsub.publish(
            Topics.Message,
            `You ${this.state.open ? "close" : "open"} the drawer`);
        
        this.setState(prev => ({ open: !prev.open}));
    }

    pickedUpItem(item) {
        this.setState(prev => ({open: prev.open, contents: prev.contents.filter(c => c.Id !== item.props.id)}));
    }

    componentDidMount() {
        this.token = pubsub.subscribe(Topics.PickedUpItem, (_, item) => this.pickedUpItem(item));
    }

    componentWillUnmount() {
        pubsub.unsubscribe(this.token);
    }

    renderDrawer() {
        if (this.state.open) {
            return "An open drawer";
        } else {
            return "A closed drawer";
        }
    }

    renderContents() {
        if (this.state.contents) {
            return this.state.contents.map(
                item => (<div key={item.Id}>
                           <Item id={item.Id} type={item.Type} description={item.Description} hint={item.Hint} />
                         </div>)
        );
        } else {
            return <div>(empty)</div>;
        }
        

    }
    
    render() {
        var contents = <span><hr />{this.renderContents()}</span>;
        
        return (<div className="drawer" onClick={this.handleClick}>
                {this.renderDrawer()}
                {this.state.open ? contents : null}
                </div>);
    }
}

class Room extends Component {
    render() {
        return (
            <div id="room">
                <span>Room</span>
                <Drawer className="drawer" initialState={this.props.initialState.drawer} />
                <Door className="door" initialState={this.props.initialState.door} />
            </div>
        );
    }
}

class Inventory extends Component {

    constructor(props) {
        super(props);
        this.state = { items: [] };

        this.consumeItem = this.consumeItem.bind(this);
    }

    consumeItem(id) {
        var item = this.items.find(i => i.Id === id);
        if (item) {
            this.setState(prev => ({ items: prev.items.filter(i => i !== item)}));
            pubsub.publish(Topics.Message, `${item.Description} disappears.`);
        }

    }

    componentDidMount() {
        pubsub.subscribe(
            Topics.PickedUpItem,
            (_, item) => this.setState(prev => ({ items: prev.items.concat(item)})));

        pubsub.subscribe(
            Topics.ConsumeItem,
            (_, id) => this.consumeItem(id));
    }

    // FIXME unsub
    // componentWillUnmount() {

    renderInventory() {
        return this.state.items.map(item => <li key={item.props.id}>{item.render()}</li>);
    }

    render() {
        return (<div id="inventory">
                  Inventory
                  <br />
                  <ul>
                    {this.renderInventory()}
                  </ul>
                </div>);
    }
}

class MessageWindow extends Component {
    constructor(props) {
        super(props);

        var initialMessages = this.props.initialState;
        this.state = { messages: initialMessages };
    }

    addMessage(msg) {
        this.setState(
            prev => ({ messages: prev.messages.concat(msg) }));
    }

    componentDidMount() {
        pubsub.subscribe(
            Topics.Message,
            (_, data) => this.addMessage(data));

        pubsub.subscribe(
            Topics.PickedUpItem,
            (_, data) => this.addMessage(`You picked up ${data.props.description}`));
    }

    // FIXME unsub
    // componentWillUnmount() {
    
    renderMessages() {
        // FIXME: make key
        return this.state.messages
            .slice(-5)
            .reverse()
            .map(m => (<div>{m}</div>));
    }

    render() {
        return (<div id="messages">{this.renderMessages()}</div>);
    }
        
}

class App extends Component {
    initialState() {
        // FIXME: Get this from the DB

        var key = { Id: 42, Type: 'Key', Description: 'An ordinary key', Hint: 'Maybe this unlocks something...' };
        var redHerring = { Id: 123, Type: 'Fluff', Description: 'A Red Herring', Hint: 'Something smells fishy about this whole thing.' };
        
        return {
            room: {
                drawer: { contents: [ key, redHerring ] },
                door: { open: false, locked: true, unlockedBy: key }
            },
            inventory: [],
            messages: ["Welcome to the Twilight Zone"]
        };
    }

    render() {
        const state = this.initialState();

        return (<div id="app">
                  <Room initialState={state.room}/>
                  <br />
                  <Inventory />
                  <MessageWindow initialState={state.messages} />
                </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
