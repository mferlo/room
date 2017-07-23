import React, { Component } from 'react';

class Inventory extends Component {

    constructor(props) {
        super(props);

        this.state = { groupBy: 'none' };
    }

    renderPuzzle(puzzle) {
        return (<li className="puzzleItem" key={`Puzzle-${puzzle.Id}`}>
                  <div className="puzzle">
                    Name: {puzzle.Id} <br />
                    Arc: {puzzle.Arc} <br />
                    Solved: {puzzle.Solved ? "Yes" : "No"}
                  </div>
                </li>);
    }


    renderUngroupedPuzzles(puzzles) {
        const orderedPuzzles = this.orderForTwoColumnUL(puzzles);

        return (<ul className="puzzleList">
                  {orderedPuzzles.map(p => this.renderPuzzle(p))}
                </ul>);
    }

    renderList() {
        const puzzles = this.props.contents;

        switch (this.state.groupBy) {
            case "none": return this.renderUngroupedPuzzles(puzzles);
            default: alert(this.state.groupBy);
        }
    }

    render() {
        return (<div id="puzzle-inventory">
                {this.renderList()}
                </div>);
    }

    orderForTwoColumnUL(items) {
        // CSS columns go down then right. We want to go right then down.
        // Rather than fight it, just re-order so the CSS does what we want:
        const evens = items.filter((_, i) => i % 2 === 0);
        const odds = items.filter((_, i) => i % 2 === 1);
        return evens.concat(odds);
    }
}

export default Inventory;
