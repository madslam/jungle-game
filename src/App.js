import React from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import 'antd/dist/antd.css';

import Game from './Game';
import Room from './Room';

export default function App () {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/rooms">room</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/rooms">
            <Room />
          </Route>
          <Route path="/game/:id">
            <Game />
          </Route>

        </Switch>
      </div>
    </Router>
  );
}
