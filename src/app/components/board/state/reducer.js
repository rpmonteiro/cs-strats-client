import { fromJS } from 'immutable';
import * as types from './action-types';

const initialState = fromJS({
  players: {}
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.ADD_PLAYER_MARKER:
    {
      const id = state.get('players').size + 1;
      action.data.id = id;
      return state.setIn(['players', id], action.data);
    }
    
  
  case types.UPDATE_PLAYER_MARKER:
    return state.setIn(['players', action.data.id], action.data);
  
  
  default:
    return state;
  }
}
