'use strict';

import { fromJS }   from 'immutable';
import expect       from 'expect';
import * as actions from '../state/actions';
import reducer      from '../state/reducer';


describe('Board reducer', () => {
  
  it('should return the initial state', () => {
    const initialState = reducer();
    expect(initialState.get('roundDuration')).toEqual(87);
    expect(initialState.get('players').size).toEqual(1);
    expect(initialState.get('roundTime')).toEqual(80);
    expect(initialState.get('previewLine')).toEqual(false);
  });
  
});
