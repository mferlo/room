import React, { Component } from 'react';

class Inventory extends Component {

    constructor(props) {
        super(props);

        this.state = { groupBy: 'None' };
    }

    groupBy(g) {
        this.setState({ groupBy: g });
    }

    renderSelector() {
        return (
            <div>
                <span onClick={() => this.groupBy("None")}>None</span>
                <span onClick={() => this.groupBy("Arc")}>Arc</span>
            </div>
        );
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

    renderPuzzlesByArc(puzzles) {
        const byArc = puzzles.reduce((groups, puzzle) => {
            const arc = puzzle.Arc;
            groups[arc] = groups[arc] || [];
            groups[arc].push(puzzle);
            return groups;
        }, {});

        const arcs = Object.keys(byArc).sort();

        return arcs.map(
            a => (<li className="groupHeader opened">{a}
                  {this.renderUngroupedPuzzles(byArc[a])}
                  </li>));
    }

    renderList() {
        const puzzles = this.props.contents;

        switch (this.state.groupBy) {
            case "None": return this.renderUngroupedPuzzles(puzzles);
            case "Arc": return this.renderPuzzlesByArc(puzzles);
            default : alert(this.state.groupBy);
        }
    }

    render() {
        return (<div id="puzzle-inventory">
                {this.renderSelector()}
                <br />
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
