import { fromJS } from 'immutable';
import * as types from './action-types';


const initialState = fromJS({
  caretPos: 0
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.UPDATE_CARET:
    return state.set('caretPos', action.data);
  
  default:
    return state;
  }
}
