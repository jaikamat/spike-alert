import React from 'react';
import axios from 'axios';
import { Form, Button, Segment, Container } from 'semantic-ui-react';

const initialState = { email: '', password: '', password2: '' };

class Signup extends React.Component {
    state = initialState;

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = () => {
        axios
            .post('http://localhost:1337/auth/signup', { ...this.state })
            .then(res => console.log(res))
            .catch(err => console.log(err.response.data));
    };

    render() {
        return (
            <Container>
                <Segment>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Field>
                            <label>Email</label>
                            <input placeholder="Email" name="email" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <input
                                placeholder="Password"
                                name="password"
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Re-enter password</label>
                            <input
                                placeholder="Re-enter password"
                                name="password2"
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Button type="submit">Submit</Button>
                    </Form>
                </Segment>
            </Container>
        );
    }
}

export default Signup;
