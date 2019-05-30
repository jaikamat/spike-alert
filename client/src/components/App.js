import React from 'react';
import SearchBar from './SearchBar';
import axios from 'axios';

class App extends React.Component {
    onSearchSubmit = async arg => {
        const response = await axios.get('http://localhost:1337/search', {
            params: { name: arg }
        });
        console.log(response);
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
