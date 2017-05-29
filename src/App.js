import React, { Component } from 'react';
import Room from './Room.js';
import Inventory from './Inventory.js';
import MessageWindow from './MessageWindow.js';

class AppState {
    static getInitialState() {
        const key = {
            Id: 1,
            Type: 'Item',
            Description: 'An ordinary key',
            Hint: 'Maybe this unlocks something...'
        };
        const redHerring = {
            Id: 2,
            Type: 'Item',
            Description: 'A Red Herring',
            Hint: 'Something smells fishy about this whole thing.'
        };
        const pole = {
            Id: 3,
            Type: 'Item',
            Description: 'A Ten-Foot Pole',
            Hint: 'You can do all sorts of useful stuff with this.'
        };
        const puzzle = {
            Id: 4,
            Type: 'Puzzle',
            Description: 'Very Mysterious Indeed', // FIXME: figure out how much in common
            Hint: '',
            POC_Answer: 'Hello', // will be web call & unknown to client
            Rewards: pole
        };
        
        return {
            roomView: 0,

            // This is gross and dumb, but it plays nicely with the setState merge logic.
            room0: {
                viewInfo: { rightGoesTo: 1 },
                drawer: { open: true, contents: [ puzzle ] },
                door: { open: false, locked: true, unlockedBy: key }
            },
            room1: {
                viewInfo: { leftGoesTo: 0 },
                drawer: { open: false, contents: [ key, redHerring ] },
                door: { open: false, locked: true, unlockedBy: { Id: -1 } }
            },

            inventory: [],

            // Explicitly indexing makes MessageWindow/Message super-simple.
            messages: [ { key: 0, msg: "Welcome to the Twilight Zone" } ]
        };
    }

    static appendMessage(prev, message) {
        return [...prev.messages, { key: prev.messages.length, msg: message }];
    }

    static getItemFromInventory(prev, itemId) {
        return prev.inventory.find(item => item.Id === itemId);
    }

    static appendItemToInventory(prev, item) {
        return [...prev.inventory, item];
    }

    static removeItemFromInventory(prev, item) {
        return prev.inventory.filter(i => item.Id !== i.Id);
    }

    static clickDrawer(prev) {
        const roomKey = this.currentRoomKey(prev);
        const room = prev[roomKey];

        const d = room.drawer;
        const msg = `You ${d.open ? 'closed' : 'opened'} the drawer`;
        return {
            messages: this.appendMessage(prev, msg),
            [roomKey]: { ...room, drawer: { ...d, open: !d.open } }
        };
    }

    static clickDoor(prev) {
        const roomKey = this.currentRoomKey(prev);
        const room = prev[roomKey];
        const oldDoor = room.door;

        let newDoor = oldDoor;
        let newInventory = prev.inventory;
        let msg;

        if (oldDoor.locked) {
            const keyId = room.door.unlockedBy.Id;
            const key = this.getItemFromInventory(prev, keyId);
            if (key) {
                msg = "You unlocked the door";
                newDoor.locked = false;
                newInventory = this.removeItemFromInventory(prev, key);
            } else {
                msg ="The door is locked";
            }
        } else {
            msg = `You ${oldDoor.open ? 'closed' : 'opened'} the unlocked door`;
            newDoor.open = !oldDoor.open;
        }            

        return {
            messages: this.appendMessage(prev, msg),
            [roomKey]: { ...room, door: { ...newDoor } },
            inventory: newInventory
        };
    }

    static clickItem(prev, itemId) {
        let item = this.getItemFromInventory(prev, itemId);
        if (item) {
            // Or "activate", unclear.
            return {
                messages: this.appendMessage(prev, `${item.Description} ${item.Hint}`)
            };
        } else {
            const roomKey = this.currentRoomKey(prev);
            const room = prev[roomKey];

            // For now, the only place it can be is in this drawer...
            item = room.drawer.contents.filter(i => itemId === i.Id)[0]; //.Single()
            const rest = room.drawer.contents.filter(i => itemId !== i.Id);

            return {
                [roomKey]: { ...room, drawer: { ...room.drawer, contents: rest } },
                inventory: this.appendItemToInventory(prev, item),
                messages: this.appendMessage(prev, `Picked up: ${item.Description}`)
            };
        }
    }

    static currentRoomKey(state) {
        return "room" + state.roomView
    }

    static handleClick(target, prev) {
        switch (target.dataset.type) {
        case 'drawer': return this.clickDrawer(prev);
        case 'door': return this.clickDoor(prev);
        case 'item': return this.clickItem(prev, Number.parseInt(target.dataset.id, 10));
        case 'viewchange': return { roomView: target.dataset.destination };
        default:
            console.log('Unknown target', target);
            return {};
        }
    }
}


class App extends Component {

    constructor(props) {
        super(props);

        this.state = AppState.getInitialState();
    }

    handleClick(event) {
        event.persist();
        this.setState(prev => AppState.handleClick(event.target, prev));
    }

    render() {
        const currentRoomKey = AppState.currentRoomKey(this.state);
        const room = this.state[currentRoomKey];
        return (<div id="app" onClick={event => this.handleClick(event)}>
                  <Room objects={room} />
                  <br />
                  <Inventory contents={this.state.inventory} />
                  <MessageWindow messages={this.state.messages} />
                </div>);
    }
}

export default App;
