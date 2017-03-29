import { fromJS } from 'immutable';
import * as types from './action-types';

const initialState = fromJS({
  roundDuration: 87,
  players: {
    1: {
      id: 1,
      x: 300,
      y: 300,
      time: 87,
      paths: {
        2: {
          x1: 300,
          x2: 350,
          y1: 300,
          y2: 350
        },
        5: {
          x1: 350,
          x2: 450,
          y1: 350,
          y2: 600
        }
      }
    }
  },
  roundTime: 87
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.ADD_PLAYER_MARKER:
    {
      const { x, y } = action.data;
      const roundDuration = state.get('roundDuration');
      const id = state.get('players').size + 1;
      const playerObj = {
        id: id,
        x: x,
        y: y,
        time: roundDuration,
        paths: {}
      };
      return state.setIn(['players', id], fromJS(playerObj));
    }
    
  
  case types.UPDATE_PLAYER_MARKER:
    return state.setIn(['players', action.data.id], action.data);
    
  
  case types.ADD_PATH_NODE:
    {
      const players = state.get('players');
      const { coords, markerId, duration } = action.data;

      const roundTime     = state.get('roundTime');
      const roundDuration = state.get('roundDuration');
      const player        = players.get(markerId);
      const playerTime    = (player.get('time') || roundDuration) - duration;
      
      const mostForwardPlayer = players.find(p => p.get('time') < playerTime);
      const pathTime = Math.round(roundDuration - playerTime + duration);
      
      let newRoundTime = roundTime;
      if (mostForwardPlayer && mostForwardPlayer !== player) {
        newRoundTime = roundTime - duration;
      }
      
      return state.withMutations(newState => {
        newState.set('roundTime', newRoundTime);
        newState.setIn(['players', markerId, 'time'], playerTime);
        newState.setIn(['players', markerId, 'paths', pathTime], coords);
      });
    }
  
  
  default:
    return state;
  }
}

// players: {
//   0: {
//     0: {
//       x: 'x',
//       y: 'y'
//     },
//     5: {
//       x: 'x',
//       y: 'y'
//     }
//   }
// }
