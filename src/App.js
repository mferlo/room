import React, { Component } from 'react';
import Room from './Room.js';
import Inventory from './Inventory.js';
import MessageWindow from './MessageWindow.js';

class AppState {
    static getInitialState() {
        const key = { Id: 42, Type: 'Key', Description: 'An ordinary key', Hint: 'Maybe this unlocks something...' };
        const redHerring = { Id: 123, Type: 'Fluff', Description: 'A Red Herring', Hint: 'Something smells fishy about this whole thing.' };
        
        return {
            room: {
                drawer: { open: false, contents: [ key, redHerring ] },
                door: { open: false, locked: true, unlockedBy: key }
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
        const d = prev.room.drawer;
        const msg = `You ${d.open ? 'closed' : 'opened'} the drawer`;
        return {
            messages: this.appendMessage(prev, msg),
            room: { drawer: { ...d, open: !d.open }, door: { ...prev.room.door }}
        };
    }

    static clickDoor(prev) {
        const oldDoor = prev.room.door;
        const keyId = prev.room.door.unlockedBy.Id;
        const key = this.getItemFromInventory(prev, keyId);

        let newDoor = oldDoor;
        let newInventory = prev.inventory;
        let msg;

        if (oldDoor.locked) {
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
            room: { door: { ...newDoor }, drawer: { ...prev.room.drawer } },
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
            // For now, the only place it can be is here...
            item = prev.room.drawer.contents.filter(i => itemId === i.Id)[0]; //.Single()
            const rest = prev.room.drawer.contents.filter(i => itemId !== i.Id);

            return {
                room: {
                    door: { ...prev.room.door },
                    drawer: { ...prev.room.drawer, contents: rest }
                },
                inventory: this.appendItemToInventory(prev, item),
                messages: this.appendMessage(prev, `Picked up: ${item.Description}`)
            };
        }
    }

    static handleClick(id, prev) {
        if (id === 'drawer') {
            return this.clickDrawer(prev);
        } else if (id === 'door') {
            return this.clickDoor(prev);
        } else {
            const itemId = Number.parseInt(id, 10);
            if (itemId) {
                return this.clickItem(prev, itemId);
            } else {
                return {};
            }
        }
    }
}


class App extends Component {

    constructor(props) {
        super(props);

        this.state = AppState.getInitialState();
    }

    handleClick(event) {
        // This is almost certainly the wrong way to do it, but holy cow is it convenient.
        // Might be better for components to encode their state in the `data-` attributes.
        event.persist();
        this.setState(prev => AppState.handleClick(event.target.id, prev));
    }

    render() {
        return (<div id="app" onClick={event => this.handleClick(event)}>
                  <Room objects={this.state.room} />
                  <br />
                  <Inventory items={this.state.inventory} />
                  <MessageWindow messages={this.state.messages} />
                </div>);
    }
}

export default App;
