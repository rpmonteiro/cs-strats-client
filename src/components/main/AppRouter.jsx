'use strict';

import React, { PropTypes, Component } from 'react';
import { Router, Route }               from 'react-router';

import MainView from './MainView';

// import { autoLoginUser, logoutUser } from 'le/views/user/state/actions-login';


export default class AppRouter extends Component {
  
  static propTypes = {
    history: PropTypes.object.isRequired,
    store:   PropTypes.object.isRequired
  };
  
  
  requiresAuth = (nextState, replace) => {
    const { store } = this.props;
    const state = store.getState();
    
    if (!state.user.get('loggedIn')) {
      replace('/login');
      // store.dispatch(autoLoginUser(nextState.location.pathname));
    }
  }
  
  
  requiresNoAuth = (nextState, replace) => {
    const { store } = this.props;
    const state = store.getState();
    
    if (state.user.get('loggedIn')) {
      replace('/home');
    }
  }
  
  
  logout = (nextState, replace) => {
    // const { store } = this.props;
    // store.dispatch(logoutUser());
    replace('/');
  }
  
  
  render() {
    const { history } = this.props;
    // console.log('App router state:', this.props.store.getState());
    
    return (
      <Router history={history}>
        <Route path="/" component={MainView} onEnter={this.requiresNoAuth} />
        {/* <Route path="/login" component={LoginView} onEnter={this.requiresNoAuth} />
          <Route path="/logout" component={LoginView} onEnter={this.logout} />
          <Route component={App} onEnter={this.requiresAuth}>
          <Route path="*" component={AppView}/>
        </Route> */}
      </Router>
    );
  }
}
