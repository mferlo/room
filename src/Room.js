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
            return this.props.contents.map(item =>
                (<div key={item.Id}>
                   <Item id={item.Id} type={item.Type} description={item.Description} hint={item.Hint} />
                 </div>));
        } else {
            return <div>(empty)</div>;
        }
    }
    render() {
        return (<div id="drawer" onClick={this.handleClick}>
                {this.renderDrawer()}
                {this.props.open ? <span><hr />{this.renderContents()}</span> : null}
                </div>);
    }
}

class ViewChange extends Component {
    render() {
        return (
            <span data-destination={this.props.destination}>
                {this.props.arrow}
            </span>);
    }
}

class Room extends Component {
    renderDrawer(objects) {
        if (objects.drawer) {
            return <Drawer className="drawer" open={objects.drawer.open} contents={objects.drawer.contents} />;
        }
    }
    
    renderDoor(objects) {
        if (objects.door) {
            return <Door className="door" open={objects.door.open} locked={objects.door.locked} />;
        }
    }

    renderLeftArrow(viewInfo) {
        if (viewInfo.leftGoesTo !== undefined) {
            return <ViewChange destination={viewInfo.leftGoesTo} className="left-arrow" arrow="[go left]" />
        }
    }

    renderRightArrow(viewInfo) {
        if (viewInfo.rightGoesTo !== undefined) {
            return <ViewChange destination={viewInfo.rightGoesTo} className="right-arrow" arrow="[go right]" />
        }
    }

    render() {
        return (
            <div id="room">
                <span>Room</span>
                {this.renderLeftArrow(this.props.objects.viewInfo)}
                {this.renderRightArrow(this.props.objects.viewInfo)}
                {this.renderDrawer(this.props.objects)}
                {this.renderDoor(this.props.objects)}
            </div>
        );
    }
}

export default Room;
