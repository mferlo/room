import React, { Component } from 'react';
import Item from './Item.js';

class Door extends Component {
    render() {
        if (this.props.open) {
            return (<img src="https://morbotron.com/gif/S07E11/35869/41916.gif?b64lines="
                         alt="But what fresh horrors await us on the other side?"/>);
        } else {
            return (<div id="door">
                    {this.props.locked ? 'A locked' : this.props.open ? 'An open' : 'A closed'} door
                    </div>);
        }
    }
}

class Drawer extends Component {

    renderDrawer() {
        if (this.props.open) {
            return "An open drawer";
        } else {
            return "A closed drawer";
        }
    }

    renderContents() {
        if (this.props.contents) {
            return this.props.contents.map(
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
        
        return (<div id="drawer" onClick={this.handleClick}>
                {this.renderDrawer()}
                {this.props.open ? contents : null}
                </div>);
    }
}

class Room extends Component {

    renderDrawer(drawer) {
        return <Drawer className="drawer" open={drawer.open} contents={drawer.contents} />;
    }

    renderDoor(door) {
        return <Door className="door" open={door.open} locked={door.lock} />;
    }
    
    render() {
        return (
            <div id="room">
                <span>Room</span>
                {this.renderDrawer(this.props.objects.drawer)}
                {this.renderDoor(this.props.objects.door)}
            </div>
        );
    }
}

export default Room;
