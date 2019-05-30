import React from 'react';
import SearchBar from './SearchBar';

class App extends React.Component {
    onSearchSubmit = arg => {
        // Make GET request here
        console.log(`${arg} logged to console`);
    };

    render() {
        return (
            <div className="ui container" style={{ marginTop: '10px' }}>
                <SearchBar userSearch={this.onSearchSubmit} />
            </div>
        );
    }
}

export default App;
