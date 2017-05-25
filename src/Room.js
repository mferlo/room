import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Topic from './Topic.js';

// Consider continuing to make base classes. Item seems like a good start; we might want
// "Container" and maybe even "Thing" (Items go in inventory and can be used; Things are
// static in the room). Remember that css can do a lot of the heavy lifting...
// Or: KISS/YAGNI. Unclear.

// Make everything be the same datatype (see Inventory PickUp and Consume for the awkwardness here).

class Item extends Component {
    constructor(props) {
        super(props);

        this.state = { pickedUp: false };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        if (!this.state.pickedUp) {
            this.setState(_ => ({pickedUp: true}));
            PubSub.publish(Topic.PickedUpItem, this);
        } else {
            // Alternately: "activate" the item so it may interact with
            // something in the room. I kind of like the auto-usage, though:
            // makes the room easier, and given that we can emit messages,
            // it's simple enough to say what just happened.
            PubSub.publish(Topic.Message, `${this.props.description}. ${this.props.hint}`);
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
            PubSub.publish(Topic.Message, "You open the door");
            this.setState(_ => ({open: true}));
            PubSub.publish(Topic.Message, "You have escaped the room");
            PubSub.publish(Topic.Message, "A WINNER IS YOU");
        } else if (this.state.canUnlock) {
            PubSub.publish(Topic.Message, `You unlock the door using ${unlocker}`);
            this.setState(_ => ({locked: false}));
        } else {
            PubSub.publish(Topic.Message, `It's locked. ${unlocker} will unlock it.`);
        }
    }

    makeUnlockableIfKey(item) {
        if (this.UnlockedBy.Id === item.props.id) {
            this.setState(_ => ({canUnlock: true}));
        }
    }

    componentDidMount() {
        // FIXME: unclear if this approach will work or is fundamentally broken.
        PubSub.subscribe(
            Topic.PickedUpItem,
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
        PubSub.publish(
            Topic.Message,
            `You ${this.state.open ? "close" : "open"} the drawer`);
        
        this.setState(prev => ({ open: !prev.open}));
    }

    pickedUpItem(item) {
        this.setState(prev => ({open: prev.open, contents: prev.contents.filter(c => c.Id !== item.props.id)}));
    }

    componentDidMount() {
        this.token = PubSub.subscribe(Topic.PickedUpItem, (_, item) => this.pickedUpItem(item));
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token);
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

export default Room;
