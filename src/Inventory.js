import React, { Component } from 'react';
import Item from './Item.js';

class Inventory extends Component {

    renderListItem(item) {
        return (<li key={item.Id}>
                  <Item id={item.Id} type={item.Type} description={item.Description} />
                </li>);
    }
    
    render() {
        return (<div id="inventory">
                  Inventory
                  <br />
                  <ul>{this.props.items.map(item => this.renderListItem(item))}</ul>
                </div>);
    }
}

export default Inventory;
