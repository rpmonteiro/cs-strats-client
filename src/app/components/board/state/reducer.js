import { fromJS, Map }       from 'immutable';
import * as types            from './action-types';
import { distanceToSeconds } from '../utils/distance';

const initialState = fromJS({
  roundDuration: 87,
  players: {
    1: {
      id: 1,
      x: 300,
      y: 300,
      time: 80,
      paths: [
        {
          time: 2,
          x1: 300,
          x2: 350,
          y1: 300,
          y2: 350
        },
        {
          time: 5,
          x1: 350,
          x2: 450,
          y1: 350,
          y2: 600
        }
      ]
    }
  },
  roundTime: 80,
  previewLine: false
});


export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.ADD_MARKER:
    {
      const { x, y } = action.data;
      const roundDuration = state.get('roundDuration');
      const id = state.get('players').size + 1;
      const playerObj = {
        id: id,
        x: x,
        y: y,
        time: roundDuration,
        paths: []
      };
      return state.setIn(['players', id.toString()], fromJS(playerObj));
    }
    
  
  case types.UPDATE_MARKER:
    return state.setIn(['players', action.data.id], action.data);
    
  // TODO: REFACTOR some pieces of code used multiple times like the get last player's coords
  case types.ADD_NODE:
    {
      const markerId = action.data.toString();
      const players  = state.get('players');
      const player   = players.get(markerId);
      
      const prevNodeCoords = player.get('paths').last()
      || Map({x2: player.get('x'), y2: player.get('y')});
      const previewCoords = state.get('previewLine');
      
      const coords = Map({
        x1: prevNodeCoords.get('x2'),
        x2: previewCoords.get('x2'),
        y1: prevNodeCoords.get('y2'),
        y2: previewCoords.get('y2')
      });
      
      const duration       = distanceToSeconds(coords);
      const roundTime      = state.get('roundTime');
      const roundDuration  = state.get('roundDuration');
      const prevPlayerTime = player.get('time');
      const playerTime     = parseFloat((prevPlayerTime - duration).toFixed(0));
      
      const mostForwardPlayer = players.find(p => p.get('time') < playerTime);
      const pathTime = parseFloat((roundDuration - playerTime).toFixed(0));
      
      let newRoundTime = roundTime;
      if (!mostForwardPlayer) {
        newRoundTime = parseFloat((roundTime - duration).toFixed(0));
      }
      
      const path     = coords.set('time', pathTime);
      const newPaths = player.get('paths').push(path);
      
      return state.withMutations(newState => {
        newState.set('roundTime', newRoundTime);
        newState.setIn(['players', markerId, 'time'], playerTime);
        newState.setIn(['players', markerId, 'paths'], newPaths);
      });
    }


  case types.SET_PREVIEW_LINE:
    {
      const markerId = action.data;
      const player   = state.getIn(['players', markerId.toString()]);
      const paths    = player.get('paths');
      const coords   = paths.last() || Map({x2: player.get('x'), y2: player.get('y')});

      const x = coords.get('x2');
      const y = coords.get('y2');
    
      const line = Map({ x1: x, x2: x, y1: y, y2: y });
      return state.set('previewLine', line);
    }
    

  case types.UPDATE_PREVIEW_LINE:
    {
      const { x, y } = action.data;
      return state.withMutations(newState => {
        newState.setIn(['previewLine', 'x2'], x);
        newState.setIn(['previewLine', 'y2'], y);
      });
    }
    
  case types.RESET_PREVIEW_LINE:
    return state.set('previewLine', false);
  
  
  default:
    return state;
  }
}
