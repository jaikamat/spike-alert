import React from 'react';
import axios from 'axios';

const storage = window.localStorage;

class Logout extends React.Component {
    logout = async () => {
        await axios.get('http://localhost:1337/auth/logout');
        storage.clear();
    };

    render() {
        return <button onClick={this.logout}>Click to log out</button>;
    }
}

export default Logout;
