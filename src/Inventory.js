import React, { Component } from 'react';
import Item from './Item.js';

class Inventory extends Component {

    renderItem(item) {
        return <Item id={item.Id} type={item.Type} description={item.Description} />;
    }
    
    renderItems(items) {
        if (!items || !items.length) {
            return null;
        }

        return (<ul>
                    {items.map(item => <li key={`${item.Id}-${item.Type}`}>{this.renderItem(item)}</li>)}
                </ul>);
    }

    render() {
        const items = this.props.contents.filter(item => item.Type === "Item");
        const puzzles = this.props.contents.filter(item => item.Type === "Puzzle");
        return (
            <div id="inventory">
                <div id="item-inventory">{this.renderItems(items)}</div>
                <div id="puzzle-inventory">{this.renderItems(puzzles)}</div>
            </div>);
    }
}

export default Inventory;
