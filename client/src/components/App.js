import React from 'react';
import Home from './Home';
import Search from './Search';
import Login from './Login';
import Signup from './Signup';
import MyList from './MyList';
import Logout from './Logout';
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
                            to="/myList"
                            name="MyList"
                            // position="right"
                            onClick={this.handleClick}
                            active={'MyList' === activeItem}
                        />
                        <Menu.Item
                            as={Link}
                            to="/login"
                            name="Login"
                            // position="right"
                            onClick={this.handleClick}
                            active={'Login' === activeItem}
                        />
                        <Menu.Item
                            as={Link}
                            to="/signup"
                            name="Signup"
                            // position="right"
                            onClick={this.handleClick}
                            active={'Signup' === activeItem}
                        />
                        <Menu.Item
                            as={Link}
                            to="/logout"
                            name="Logout"
                            // position="right"
                            onClick={this.handleClick}
                            active={'Logout' === activeItem}
                        />
                    </Menu.Menu>
                </Menu>
                <div style={{ marginTop: 50 }}>
                    <Route exact path="/" component={Home} />
                    <Route path="/search" component={Search} />
                    <Route path="/login" component={Login} />
                    <Route path="/signup" component={Signup} />
                    <Route path="/myList" component={MyList} />
                    <Route path="/logout" component={Logout} />
                    <Route />
                </div>
            </div>
        );
    }
}

export default App;
