'use strict';

import { fromJS }   from 'immutable';
import expect       from 'expect';
import * as actions from '../state/actions';
import reducer      from '../state/reducer';


describe('Timeline reducer', () => {

  it('should update the caret pos', () => {
    const initialState = reducer();
    expect(initialState.get('caretPos')).toEqual(0);
    expect(initialState.get('caretTime')).toEqual(0);
    
    const actionData = { pos: 30, time: 45 };
    const state = reducer(initialState, actions.updateCaret(actionData));
    
    expect(state.get('caretPos')).toEqual(actionData.pos);
    expect(state.get('caretTime')).toEqual(actionData.time);
  });

});
