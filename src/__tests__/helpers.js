'use strict';

import React from 'react';
import { shallow, mount } from 'enzyme';

// testing guides:
// http://redux.js.org/docs/recipes/WritingTests.html
// http://airbnb.io/enzyme/docs/api/shallow.html
// https://semaphoreci.com/community/tutorials/getting-started-with-tdd-in-react
export function shallowComp(comp, opts = {}) {
  const props = Object.assign({}, opts);
  const el = React.createElement(comp, props);
  const output = shallow(el);
  return { props, output };
}

export function mountComp(comp, opts = {}) {
  const props = Object.assign({}, opts);
  const el = React.createElement(comp, props);
  const output = mount(el);
  return { props, output };
}
