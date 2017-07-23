import React, { Component } from 'react';

class Inventory extends Component {

    constructor(props) {
        super(props);

        this.state = {
            groupBy: 'All',
            collapsedGroups: new Set(),
            filteredTypes: new Set()
        };
    }

    groupBy(event, groupName) {
        event.stopPropagation();
        this.setState({ groupBy: groupName });
    }

    renderSelector(groupType, selected) {
        return (<span onClick={(e) => this.groupBy(e, groupType)}
                      key={groupType}
                      className={`groupType ${selected ? 'selected' : ''}`}>
                    {groupType}
                </span>);
    }

    renderSelectors() {
        const selected = this.state.groupBy;
        return (
            <div>
                {["All", "Arc", "Solved"].map(
                    groupType => this.renderSelector(groupType, groupType === selected))}
            </div>
        );
    }

    renderPuzzle(puzzle) {
        let arcText;
        switch (puzzle.Arc) {
            case 'foo': arcText = '#'; break;
            case 'bar': arcText = '>'; break;
            case 'baz': arcText = '@'; break;
            default: arcText = `Unknown arc ${puzzle.Arc}`; break;
        }

        const solvedDisplay = puzzle.Solved
              ? <span className="status solved">☑</span>
              : <span className="status unsolved">☐</span>

        return (<li className="puzzleItem" key={`Puzzle-${puzzle.Id}`}>
                  <div className="puzzle" style={{backgroundColor: puzzle.Display}}>
                    {solvedDisplay} {arcText} {puzzle.Id}
                  </div>
                </li>);
    }

    toggle(event, groupName, toggleType) {
        event.stopPropagation();
        this.setState(oldState => {
            const groups = oldState[toggleType];
            if (groups.has(groupName)) {
                groups.delete(groupName);
            } else {
                groups.add(groupName);
            }

            return { [toggleType]: groups };
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
                    onClick={e => this.toggle(e, groupName, 'collapsedGroups')}>
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
            case "All": return this.renderUngroupedPuzzles(puzzles);
            case "Arc": return this.renderPuzzlesByGroup(puzzles, "Arc");
            case "Solved": return this.renderPuzzlesByGroup(puzzles, "Solved");
            default : alert(this.state.groupBy);
        }
    }

    render() {
        return (<div id="puzzle-inventory">
                {this.renderSelectors()}
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
