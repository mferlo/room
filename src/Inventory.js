import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Topic from './Topic';

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
            PubSub.publish(Topic.Message, `${item.Description} disappears.`);
        }

    }

    componentDidMount() {
        PubSub.subscribe(
            Topic.PickedUpItem,
            (_, item) => this.setState(prev => ({ items: prev.items.concat(item)})));

        PubSub.subscribe(
            Topic.ConsumeItem,
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

export default Inventory;
