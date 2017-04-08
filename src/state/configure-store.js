'use strict';

import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware }                      from 'react-router-redux';
import thunk                                     from 'redux-thunk';
import rootReducer                               from './reducer';


export default function configureStore(initialState, history) {
  const reduxRouterMiddleware = routerMiddleware(history);
  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, reduxRouterMiddleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );
  
  if (module.hot) {
    module.hot.accept('./reducer', () => {
      const nextRootReducer = require('./reducer');
      store.replaceReducer(nextRootReducer);
    });
  }
  
  return store;
}
