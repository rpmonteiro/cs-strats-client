'use strict';
/* eslint "react/prop-types": 0 */

import React        from 'react';
import { Provider } from 'react-redux';
import AppRouter    from './components/AppRouter';

export default function AppContainer({store, history}) {
  // wrap in the Redux Provider so that the store is added to the context for the child components
  return (
    <Provider store={store}>
      <AppRouter store={store} history={history} />
    </Provider>
  );
}
