import React from 'react';
import Home from './Home';
import Search from './Search';
import Login from './Login';
import { Route, Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

class App extends React.Component {
    state = { activeItem: 'Home' };

    handleClick = (e, el) => {
        this.setState({ activeItem: el.name });
    };

    render() {
        const activeItem = this.state.activeItem;

        return (
            <div>
                <Menu inverted fixed="top">
                    <Menu.Item
                        as={Link}
                        to="/"
                        name="Home"
                        // position="left"
                        onClick={this.handleClick}
                        active={'Home' === activeItem}
                    />
                    <Menu.Menu position="right">
                        <Menu.Item
                            as={Link}
                            to="/search"
                            name="Search"
                            // position="right"
                            onClick={this.handleClick}
                            active={'Search' === activeItem}
                        />
                        <Menu.Item
                            as={Link}
                            to="/login"
                            name="Login"
                            // position="right"
                            onClick={this.handleClick}
                            active={'Login' === activeItem}
                        />
                    </Menu.Menu>
                </Menu>
                <div style={{ marginTop: 50 }}>
                    <Route exact path="/" component={Home} />
                    <Route path="/search" component={Search} />
                    <Route path="/login" component={Login} />
                    <Route />
                </div>
            </div>
        );
    }
}

export default App;
