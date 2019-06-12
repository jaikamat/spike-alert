import React from 'react';
import { Form, Segment, Search } from 'semantic-ui-react';

class SearchBar extends React.Component {
    state = { term: '' };

    onFormSubmit = event => {
        event.preventDefault();
        this.props.userSearch(this.state.term);
    };

    render() {
        return (
            <Segment>
                <Form onSubmit={this.onFormSubmit}>
                    <Form.Field>
                        <label>Card Search</label>
                        <input
                            type="text"
                            placeholder="Enter a card name"
                            value={this.state.term}
                            onChange={e => this.setState({ term: e.target.value })}
                        />
                    </Form.Field>
                    <Form.Button>Search</Form.Button>
                </Form>
            </Segment>
        );
    }
}

export default SearchBar;
