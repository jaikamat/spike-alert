import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import CardList from './CardList';

class Search extends React.Component {
    state = { cards: [], autocomplete: [] };

    onSearchSubmit = async arg => {
        const response = await axios.get('http://localhost:1337/search', {
            params: { name: arg }
        });
        this.setState({ cards: response.data });
    };

    componentDidMount() {
        axios.get('http://localhost:1337/search/autocomplete').then(res => {
            this.setState({ autocomplete: res.data });
        });
    }

    render() {
        let cards;

        if (this.state.cards.length > 0) {
            cards = <CardList cards={this.state.cards} />;
        }

        return (
            <div className="ui container" style={{ marginTop: '10px' }}>
                <SearchBar
                    userSearch={this.onSearchSubmit}
                    autocomplete={this.state.autocomplete}
                />
                {cards}
            </div>
        );
    }
}

export default Search;
