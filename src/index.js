import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// pub-sub: componentDidMount/componentWillUnmount is Component's hook
// does drawer need a container for nested onclick?

class Puzzle extends Component {
    render() {
        return <div>Puzzle #{this.props.id}</div>;
    }
}

class Key extends Component {
    render() {
        return <div>{this.props.description} Key</div>;
    }
}    

class Drawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            contents: props.initialContents,
            neverOpened: true
        };
        
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(prev => ({ open: !prev.open, neverOpened: false }));
    }

    renderDrawer() {
        if (this.state.neverOpened) {
            return "A mysterious drawer";
        } else if (!this.state.contents) {
            return `An empty ${this.state.open ? "open" : "closed"} drawer`;
        } else if (this.state.open) {
            return "An open drawer";
        } else {
            return "A closed drawer";
        }
    }

    renderContents() {
        if (!this.state.open) {
            return null;
        }
        if (!this.state.contents) {
            return "Empty!";
        }
        
        return (
            <div>
              <Puzzle id={this.state.contents} />
              <Key description="Bronze" />
            </div>
        );
    }
    
    render() {
        return (<div onClick={this.handleClick}>
                {this.renderDrawer()}
                {this.renderContents()}
                </div>);
    }
}

class Inventory extends Component {

    constructor(props) {
        super(props);
        this.state = { items: [ 'what\'s', 'all', 'this', 'then' ] };
    }

    addItem(item) {
        this.setState(prev => ({
            items: prev.items.concat(item)
        }));
    }

    renderInventory() {
        return this.state.items.map(item => <li key={item}>{item}</li>);
    }

    render() {
        return <div>Inventory<br /><ul>{this.renderInventory()}</ul></div>;
    }
}

class Room extends Component {

    initialState() {
        // FIXME: Get this from the DB
        return {
            drawer: { contents: 42 }
        };
    }

    render() {
        const s = this.initialState();
        
        return (
            <div id="room">
              <Drawer initialContents={s.drawer.contents} />
              <br />
              <br />
              <Inventory />
            </div>
        );
    }
}

ReactDOM.render(<Room />, document.getElementById('root'));
