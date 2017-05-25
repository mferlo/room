import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Room from './Room.js';
import Inventory from './Inventory.js';
import MessageWindow from './MessageWindow.js';
import './index.css';

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
