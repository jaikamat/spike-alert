import React from 'react';
import { Form } from 'semantic-ui-react';

class SearchBar extends React.Component {
    state = { term: '' };

    onFormSubmit = event => {
        event.preventDefault();
        this.props.userSearch(this.state.term);
    };

    render() {
        return (
            <div className="ui segment">
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
            </div>
        );
    }
}

export default SearchBar;
