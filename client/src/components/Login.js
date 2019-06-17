import React from 'react';
import axios from 'axios';
import { Form, Button, Segment, Container } from 'semantic-ui-react';

const initialState = { email: '', password: '' };

class Login extends React.Component {
    state = initialState;

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        this.setState({ [name]: value });
    };

    handleSubmit = () => {
        axios
            .post('http://localhost:1337/auth/login', {
                username: this.state.email,
                password: this.state.password
            })
            .then(res => {
                console.log(res);
                this.setState(initialState);
            })
            .catch(err => console.log(err.response.data));
    };

    render() {
        return (
            <Container>
                <Segment>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Field>
                            <label>Email</label>
                            <input
                                placeholder="Email"
                                name="email"
                                onChange={this.handleChange}
                                value={this.state.email}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <input
                                placeholder="Password"
                                name="password"
                                onChange={this.handleChange}
                                value={this.state.password}
                            />
                        </Form.Field>
                        <Button type="submit">Submit</Button>
                    </Form>
                </Segment>
            </Container>
        );
    }
}

export default Login;
