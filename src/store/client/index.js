import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {Router, Route, match, browserHistory, IndexRoute} from 'react-router'
import {syncHistoryWithStore, routerReducer, routerMiddleware, push} from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import reducers from '../shared/reducers'
import createRoutes from '../shared/routes'

const initialState = window.__REDUX_STATE__

const routerMiddlewareConst = routerMiddleware(browserHistory);
const store = createStore(reducers, initialState, applyMiddleware(thunkMiddleware, routerMiddlewareConst));
const history = syncHistoryWithStore(browserHistory, store)
const routes = createRoutes(store)
//history.listen(location => { dispatch(routeLocationDidUpdate(location)) });

const {pathname, search, hash} = window.location
const location = `${pathname}${search}${hash}`

const content = document.getElementById('content');
match({
  history,
  routes
}, (error, location, renderProps) => {
  ReactDOM.render(
    <Provider store={store}><Router {...renderProps}/></Provider>, content)
})
