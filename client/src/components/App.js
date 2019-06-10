import React from 'react';
import Home from './Home';
import Search from './Search';
import { Route, Link } from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <div>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/search">Search</Link>
                    </li>
                </ul>

                <Route exact path="/" component={Home} />
                <Route path="/search" component={Search} />
                <Route />
            </div>
        );
    }
}

export default App;
