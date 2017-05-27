import React, { Component } from 'react';

class Message extends Component {
    render() {
        const id = this.props.messageId;
        return (<div id={"message-" + id} className="message">{id} {this.props.message}</div>);
    }
}

class MessageWindow extends Component {
    renderMessage(message) {
        return (<Message key={message.key} messageId={message.key} message={message.msg} />);
    }

    render() {
        return (<div id="messages">{this.props.messages.slice(-5).map(m => this.renderMessage(m))}</div>);
    }
}

export default MessageWindow;
