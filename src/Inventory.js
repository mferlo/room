import React, { Component } from 'react';

class Inventory extends Component {

    static groupTypes() {
        return ["All", "Arc", "Solved"];
    }

    static filterTypes() {
        return [ '#', 'X', '@', '☐', '☑' ];
    }

    constructor(props) {
        super(props);

        this.state = {
            groupBy: 'All',
            search: '',
            collapsedGroups: new Set(),
            filteredTypes: new Set(Inventory.filterTypes())
        };
    }

    groupBy(event, groupName) {
        event.stopPropagation();
        this.setState({ groupBy: groupName });
    }

    renderSelector(groupType) {
        return (<span onClick={(e) => this.groupBy(e, groupType)}
                      key={groupType}
                      className={`groupType ${this.state.groupBy === groupType ? 'selected' : 'unselected'}`}>
                    {groupType}
                </span>);
    }

    renderSelectors() {
        return <div>Group By: {Inventory.groupTypes().map(g => this.renderSelector(g))}</div>;
    }

    renderFilter(filterType) {
        return (<span onClick={(e) => this.toggle(e, filterType, 'filteredTypes')}
                      key={filterType}
                      className={`filterType ${this.state.filteredTypes.has(filterType) ? 'selected' : 'unselected'}`}>
                  {filterType}
                </span>);
    }

    renderFilters() {
        return <div>Show: {Inventory.filterTypes().map(i => this.renderFilter(i))}</div>;
    }

    renderPuzzle(puzzle) {
        const solvedDisplay = puzzle.Solved
              ? <span className="status solved">☑</span>
              : <span className="status unsolved">☐</span>

        return (<li className="puzzleItem" key={`Puzzle-${puzzle.Title}`}>
                  <div className="puzzle">
                    {puzzle.Arc} <span style={{float: 'right'}}>{solvedDisplay}</span>
                    {puzzle.Title}
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

    isVisible(puzzle) {
        return `${puzzle.Title}`.includes(this.state.search)
            && this.state.filteredTypes.has(puzzle.Arc)
            && this.state.filteredTypes.has(puzzle.Solved ? '☑' : '☐');
    }

    renderUngroupedPuzzles(puzzles) {
        const orderedPuzzles = this.orderForTwoColumnUL(puzzles.filter(p => this.isVisible(p)));
        const className = `puzzleList ${orderedPuzzles.length === 1 ? 'singleItem' : ''}`;
        return (<ul className={className}>{orderedPuzzles.map(p => this.renderPuzzle(p))}</ul>);
    }

    renderGroupedList(groupName, contents) {
        const opened = !this.state.collapsedGroups.has(groupName);
        const state = opened ? "opened" : "closed";

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
                      {opened && this.renderUngroupedPuzzles(contents)}
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

    searchTextChanged(event) {
        event.stopPropagation();
        this.setState({ search: event.target.value });
    }

    renderSearchBox() {
        return <div>Title Search: <input type="text" onChange={e => this.searchTextChanged(e)} /></div>;
    }

    render() {
        return (<div id="puzzle-inventory">
                {this.renderSearchBox()}
                {this.renderSelectors()}
                {this.renderFilters()}
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
