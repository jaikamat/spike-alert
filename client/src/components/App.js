import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import CardList from './CardList';

class App extends React.Component {
    state = { cards: [] };

    onSearchSubmit = async arg => {
        const response = await axios.get('http://localhost:1337/search', {
            params: { name: arg }
        });
        this.setState({ cards: response.data });
    };

    render() {
        let cards;

        if (this.state.cards.length > 0) {
            console.log('got here');
            cards = <CardList cards={this.state.cards} />;
        }

        return (
            <div className="ui container" style={{ marginTop: '10px' }}>
                <SearchBar userSearch={this.onSearchSubmit} />
                <div>{cards}</div>
            </div>
        );
    }
}

export default App;
