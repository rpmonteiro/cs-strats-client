'use strict';

import 'babel-polyfill';
import expect    from 'expect';
import expectJSX from 'expect-jsx';
import { jsdom } from 'jsdom';

const noop = () => 1;
require.extensions['.svg'] = noop;
global.Node = {};

global.document  = jsdom('<!doctype html><html><body></body></html>');
global.window    = document.defaultView;
global.location  = { protocol: 'http' };
global.window.__testing__  = true;

global.alert = (msg) => msg;
global.window.performance = Date;
global.window.requestAnimationFrame = () => 0;
global.window.cancelAnimationFrame = () => false;

const exposedProperties = ['window', 'navigator', 'document'];
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = { userAgent: 'node.js' };

import StorageShim from 'node-storage-shim';
window.localStorage = new StorageShim();
expect.extend(expectJSX);
