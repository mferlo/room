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

        const fakePuzzleInventoryForTesting = AppState.makeFakePuzzles();

        return {
            zoomedInOn: null,
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

            inventory: fakePuzzleInventoryForTesting,

            // Explicitly indexing makes MessageWindow/Message super-simple.
            messages: [ { key: 0, msg: "Welcome to the Twilight Zone" } ]
        };
    }

    static makeFakePuzzles() {
        const count = 25;
        const arcs = [ '#', 'X', '@' ];
        
        let puzzles = [];
        for (let i = 0; i < count; i++) {
            const id = 100 + i;
            const puzzle = {
                Id: id,
                Arc: arcs[i % arcs.length],
                Solved: i % 4 === 0
            }
            puzzles.push(puzzle);
        }

        return puzzles;
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

    static pickUpItem(prev, itemId) {
        console.log('pick up', prev, itemId);
        const roomKey = this.currentRoomKey(prev);
        const room = prev[roomKey];

        // FIXME: For now, the only place it can be is in this drawer...
        const item = room.drawer.contents.filter(i => itemId === i.Id)[0];
        const rest = room.drawer.contents.filter(i => itemId !== i.Id);

        return {
            [roomKey]: { ...room, drawer: { ...room.drawer, contents: rest } },
            inventory: this.appendItemToInventory(prev, item),
            messages: this.appendMessage(prev, `Picked up: ${item.Description}`)
        };
    }

    static activateItem(prev, item) {
        console.log('activate', prev, item);

        switch (item.Type) {
        case 'Item': return { messages: this.appendMessage(prev, `${item.Description} ${item.Hint}`) };
        case 'Puzzle': return { zoomedInOn: item.Id };
        default: console.log(item); return null;
        }
    }

    static clickItem(prev, itemId) {
        const item = this.getItemFromInventory(prev, itemId);
        if (item) {
            return this.activateItem(prev, item);
        } else {
            return this.pickUpItem(prev, itemId);
        }
    }

    static currentRoomKey(state) {
        return "room" + state.roomView;
    }

    static handleNormalClick(prev, target) {
        switch (target.dataset.type) {
        case 'Drawer': return this.clickDrawer(prev);
        case 'Door': return this.clickDoor(prev);
        case 'Item': // fall-through
        case 'Puzzle': return this.clickItem(prev, Number.parseInt(target.dataset.id, 10));

        case 'viewchange': return { roomView: target.dataset.destination };
        default:
            console.log('Unknown target', target);
            return {};
        }
    }

    static handleZoomedClick(prev, target) {
        const targetId = Number.parseInt(target.dataset.id, 10); // FIXME are these really strings?
        if (targetId === prev.zoomedInOn) {
            console.log("Clicked puzzle");
            return null;
        } else {
            console.log('Clicked not-puzzle: ', target);
            return { zoomedInOn: null };
        }
    }

    static handleClick(prev, target) {
        if (prev.zoomedInOn !== null) {
            return this.handleZoomedClick(prev, target);
        } else {
            return this.handleNormalClick(prev, target);
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
        this.setState(prev => AppState.handleClick(prev, event.target));
    }

    render() {
        const currentRoomKey = AppState.currentRoomKey(this.state);
        const room = this.state[currentRoomKey];

        return (<div id="app" onClick={event => this.handleClick(event)}>
                  <Room objects={room} />
                  <Inventory contents={this.state.inventory} />
                  <br />
                  <MessageWindow messages={this.state.messages} />
                </div>);
    }
}

export default App;
