import React from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import 'antd/dist/antd.css';

import Game from './Game';
import Room from './Room';

export default function App () {
  return (
    <Router>

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
    </Router>
  );
}
