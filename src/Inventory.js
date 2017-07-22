import React, { Component } from 'react';

class Inventory extends Component {
    renderPuzzle(puzzle) {
        return (<li className="puzzleItem" key={`Puzzle-${puzzle.Id}`}>
                  <div className="puzzle">
                    Name: {puzzle.Id} <br />
                    Arc: {puzzle.Arc} <br />
                    Solved: {puzzle.Solved ? "Yes" : "No"}
                  </div>
                </li>);
    }

    orderForDisplay(items) {
        // CSS columns go down then right. We want to go right then down.
        // Rather than fight it, just re-order so the CSS does what we want:
        const evens = items.filter((_, i) => i % 2 === 0);
        const odds = items.filter((_, i) => i % 2 === 1);
        return evens.concat(odds);
    }

    renderPuzzles(puzzles) {
        const sortedPuzzles = this.orderForDisplay(puzzles);
        
        return (<ul className="flat">
                {sortedPuzzles.map(p => this.renderPuzzle(p))}
                </ul>);
    }

    render() {
        const puzzles = this.props.contents.filter(item => item.Type === "Puzzle");

        return <div id="puzzle-inventory">{this.renderPuzzles(puzzles)}</div>
    }
}

export default Inventory;
