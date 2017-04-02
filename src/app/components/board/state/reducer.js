import { fromJS, Map }  from 'immutable';
import * as types       from './action-types';
import { coordsToSecs } from '../utils/distance';

const initialState = fromJS({
  roundDuration: 87,
  players: {},
  roundTime: 87,
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
    {
      const { x, y, id } = action.data;
      const _id = id.toString();
      const markers = state.get('players');
      
      let marker = markers.get(_id);
      const adjPath = marker.getIn(['paths', 0]);
      
      if (!adjPath) {
        return state.withMutations(newState => {
          newState.setIn(['players', _id, 'x'], x);
          newState.setIn(['players', _id, 'y'], y);
        });
      }
      
      const newPath = Map({
        time: '',
        x1: x,
        x2: adjPath.get('x2'),
        y1: y,
        y2: adjPath.get('y2')
      });
      
      const prevDuration   = adjPath.get('time');
      const newDuration    = coordsToSecs(newPath);
      const durationDiff   = prevDuration - newDuration;
      const prevMarkerTime = marker.get('time');
      const newMarkerTime  = prevMarkerTime + durationDiff;
      
      const currRoundTime = state.get('roundTime');
      const mostForwardPlayer = state.get('players').find(p => p.get('time') < newMarkerTime);
      let newRoundTime = currRoundTime;
      if (!mostForwardPlayer) {
        newRoundTime = newMarkerTime;
      }
      
      const newPaths = marker.get('paths').map((p, idx) => {
        const currTime = p.get('time');
        const newTime = currTime - durationDiff;
        if (idx === 0) {
          return newPath.set('time', newTime);
        }
        
        return p.set('time', newTime);
      });
      

      marker = marker.withMutations(m => {
        m.set('x', x);
        m.set('y', y);
        m.set('time', newMarkerTime);
        m.setIn(['paths'], newPaths);
      });
      
      return state.withMutations(newState => {
        newState.setIn(['players', _id], marker);
        newState.set('roundTime', newRoundTime);
      });
      // return state.setIn(['players', action.data.id.toString()], action.data);
    }
    
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
      
      const duration       = coordsToSecs(coords);
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
  
  
  case types.REMOVE_MARKER:
    return state.deleteIn(['players', action.data.toString()]);
  
  
  default:
    return state;
  }
}
