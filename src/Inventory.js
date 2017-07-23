import React, { Component } from 'react';

class Inventory extends Component {

    constructor(props) {
        super(props);

        this.state = {
            groupBy: 'None',
            collapsedGroups: new Set()
        };
    }

    groupBy(event, groupName) {
        event.stopPropagation();
        this.setState({ groupBy: groupName });
    }

    renderSelector() {
        return (
            <div>
                <span onClick={(e) => this.groupBy(e, "None")}>None</span>
                &nbsp;/&nbsp;
                <span onClick={(e) => this.groupBy(e, "Arc")}>Arc</span>
                &nbsp;/&nbsp;
                <span onClick={(e) => this.groupBy(e, "Solved")}>Solved</span>
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

    toggleCollapsed(event, groupName) {
        event.stopPropagation();
        this.setState(oldState => {
            const groups = oldState.collapsedGroups;
            if (groups.has(groupName)) {
                groups.delete(groupName);
            } else {
                groups.add(groupName);
            }

            return { collapsedGroups: groups };
        });
    }

    renderUngroupedPuzzles(puzzles) {
        const orderedPuzzles = this.orderForTwoColumnUL(puzzles);

        return (<ul className="puzzleList">
                  {orderedPuzzles.map(p => this.renderPuzzle(p))}
                </ul>);
    }

    renderGroupedList(groupName, contents) {
        const collapsed = this.state.collapsedGroups.has(groupName);
        const state = collapsed ? "closed" : "opened";

        let displayName = groupName;
        if (groupName === "true") {
            displayName = "Solved";
        } else if (groupName === "false") {
            displayName = "Unsolved";
        }

        return (<li className={`groupHeader ${state}`}
                    key={`${groupName}-${contents.length}-${state}`}
                    onClick={e => this.toggleCollapsed(e, groupName)}>
                      {displayName}
                      {collapsed || this.renderUngroupedPuzzles(contents)}
                </li>);
    }

    renderPuzzlesByGroup(puzzles, groupType, groupName) {
        const byGroup = puzzles.reduce((groups, puzzle) => {
            const g = puzzle[groupType];
            groups[g] = groups[g] || [];
            groups[g].push(puzzle);
            return groups;
        }, {});

        return Object.keys(byGroup).sort().map(
            a => this.renderGroupedList(a, byGroup[a]));
    }

    renderList() {
        const puzzles = this.props.contents;

        switch (this.state.groupBy) {
            case "None": return this.renderUngroupedPuzzles(puzzles);
            case "Arc": return this.renderPuzzlesByGroup(puzzles, "Arc");
            case "Solved": return this.renderPuzzlesByGroup(puzzles, "Solved");
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
