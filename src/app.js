import React from 'react';
import ReactDOM from "react-dom";
import { Router, Route, Link, browserHistory } from 'react-router';
import App from "../views/Components/App.js";
import Main from "../views/Components/Main.js";

let node = document.getElementById('app');

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path='/' component={App}>
            <IndexRoute component={Main}/>
        </Route>
    </Router>, 
    node
);