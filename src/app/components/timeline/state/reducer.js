import { fromJS } from 'immutable';
import * as types from './action-types';


const initialState = fromJS({
  caretPos: 0,
  caretTime: 0
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.UPDATE_CARET: {
    const { pos, time } = action.data;
    return state.withMutations(newState => {
      newState.set('caretPos', pos);
      newState.set('caretTime', time);
    });
  }
  
  default:
    return state;
  }
}
