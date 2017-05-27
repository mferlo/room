import React, { Component } from 'react';

class Item extends Component {
    render() {
        return (<div id={this.props.id} className={this.props.type}>
                  {this.props.description}
                </div>);
    }
}

export default Item;
