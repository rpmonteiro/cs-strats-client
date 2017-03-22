'use strict';

import './app.css';

import React                    from 'react';
import Perf                     from 'react-addons-perf';
import ReactDOM                 from 'react-dom';
import { AppContainer }         from 'react-hot-loader';
import { hashHistory }          from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore           from './state/configure-store';
import MainContainer            from './components/main/MainContainer';

window.addEventListener('unhandledrejection', event => {
  // Prevent error output on the console
  event.preventDefault();
  console.warn('Unhandled promise rejection: ' + event.reason);
});


const state = window.__INITIAL_STATE__ || {};
const store = configureStore(state, hashHistory);
syncHistoryWithStore(hashHistory, store);


const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component store={store} history={hashHistory} />
    </AppContainer>,
    document.getElementById('root')
  );
};

render(MainContainer);


if (module.hot) {
  window.Perf = Perf;
  module.hot.accept(() => {
    render(MainContainer);
  });
}

console.info(
  ' Launching...\n %cCS•STRATS%c',
  'font-size: 18px; font-weight: 400; font-family: HelveticaNeue, Arial, sans-serif;',
  '');
