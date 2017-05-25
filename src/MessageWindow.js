import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Topic from './Topic.js';

class MessageWindow extends Component {
    constructor(props) {
        super(props);

        var initialMessages = this.props.initialState;
        this.state = { messages: initialMessages };
    }

    addMessage(msg) {
        this.setState(
            prev => ({ messages: prev.messages.concat(msg) }));
    }

    componentDidMount() {
        PubSub.subscribe(
            Topic.Message,
            (_, data) => this.addMessage(data));

        PubSub.subscribe(
            Topic.PickedUpItem,
            (_, data) => this.addMessage(`You picked up ${data.props.description}`));
    }

    // FIXME unsub
    // componentWillUnmount() {
    
    renderMessages() {
        // FIXME: make key
        return this.state.messages
            .slice(-5)
            .reverse()
            .map(m => (<div>{m}</div>));
    }

    render() {
        return (<div id="messages">{this.renderMessages()}</div>);
    }
        
}

export default MessageWindow;
