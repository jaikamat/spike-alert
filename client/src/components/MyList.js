import React from 'react';
import axios from 'axios';

const storage = window.localStorage;

class MyList extends React.Component {
    state = { list: [] };

    componentDidMount() {
        axios
            .get(`http://localhost:1337/user/${storage.getItem('userId')}/list/`, {
                withCredentials: true
            })
            .then(res => {
                this.setState({ list: res.data });
            })
            .catch(err => console.log(err));
    }

    render() {
        return <div>HERE IS MUH LIST</div>;
    }
}

export default MyList;
