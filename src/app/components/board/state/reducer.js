import { fromJS, Map }  from 'immutable';
import * as types       from './action-types';
import { coordsToSecs } from '../utils/distance';

const initialState = fromJS({
  roundDuration: 87,
  markers: {},
  roundTime: 87,
  previewLine: false
});


export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  
  case types.ADD_MARKER:
    {
      const { x, y } = action.data;
      const roundDuration = state.get('roundDuration');
      const id = state.get('markers').size + 1;
      const markerObj = {
        id: id,
        x: x,
        y: y,
        time: roundDuration,
        paths: []
      };
      return state.setIn(['markers', id.toString()], fromJS(markerObj));
    }
    
  
  case types.UPDATE_MARKER:
    {
      const { x, y, id } = action.data;
      const _id = id.toString();
      const markers = state.get('markers');
      
      let marker = markers.get(_id);
      const adjPath = marker.getIn(['paths', 0]);
      
      if (!adjPath) {
        return state.withMutations(newState => {
          newState.setIn(['markers', _id, 'x'], x);
          newState.setIn(['markers', _id, 'y'], y);
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
      const mostForwardMarker = state.get('markers').find(p => p.get('time') < newMarkerTime);
      let newRoundTime = currRoundTime;
      if (!mostForwardMarker) {
        newRoundTime = newMarkerTime;
      }
      console.log('newRoundTime', newRoundTime);
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
        newState.setIn(['markers', _id], marker);
        newState.set('roundTime', newRoundTime);
      });
    }
    
  // TODO: REFACTOR some pieces of code used multiple times like the get last marker's coords
  case types.ADD_PATH:
    {
      const markerId = action.data.toString();
      const markers  = state.get('markers');
      const marker   = markers.get(markerId);
      
      const prevNodeCoords = marker.get('paths').last()
      || Map({x2: marker.get('x'), y2: marker.get('y')});
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
      const prevMarkerTime = marker.get('time');
      const markerTime     = parseFloat((prevMarkerTime - duration).toFixed(0));
      
      const mostForwardMarker = markers.find(p => p.get('time') < markerTime);
      const pathTime = parseFloat((roundDuration - markerTime).toFixed(0));
      
      let newRoundTime = roundTime;
      if (!mostForwardMarker) {
        newRoundTime = parseFloat((roundTime - duration).toFixed(0));
      }
      
      const path     = coords.set('time', pathTime);
      const newPaths = marker.get('paths').push(path);

      return state.withMutations(newState => {
        newState.set('roundTime', newRoundTime);
        newState.setIn(['markers', markerId, 'time'], markerTime);
        newState.setIn(['markers', markerId, 'paths'], newPaths);
      });
    }
    
    
  case types.UPDATE_PATH:
    {
      const { markerId, pathIdx, x, y } = action.data;

      const markers   = state.get('markers');
      const marker    = markers.get(markerId);
      const paths     = marker.get('paths');
      const path      = paths.get(pathIdx);

      const firstPath = pathIdx === 0;
      const lastPath  = pathIdx === paths.size - 1;
      let prevPath = firstPath ? '' : paths.get(pathIdx - 1);
      let nextPath = lastPath ? '' : paths.get(pathIdx + 1);
      
      let x1, y1, x2, y2;
      if (firstPath) {
        x1 = marker.get('x');
        y1 = marker.get('y');
        x2 = x,
        y2 = y;
      } else if (lastPath) {
        x1 = path.get('x1');
        y1 = path.get('y1');
        x2 = x;
        y2 = y;
      } else {
        x1 = prevPath.get('x2');
        y1 = prevPath.get('y2');
        x2 = x;
        y2 = y;
      }

      const coords = Map({ x1, y1, x2, y2});
      let newPath  = path.merge(coords);
      const prevPathTime    = (prevPath && prevPath.get('time')) || 0;
      const newPathDuration = coordsToSecs(coords);
      const newPathTime     = prevPathTime + newPathDuration;
      
      newPath = newPath.set('time', newPathTime);
      
      prevPath = prevPath && prevPath.merge(Map({
        x2: x,
        y2: y
      }));

      const newNextPathTime = newPathTime + newPathDuration;
      nextPath = nextPath && nextPath.merge(Map({
        time: newNextPathTime,
        x1: x,
        y1: y
      }));
      
      const prevDuration  = path.get('time') - prevPathTime;
      const durationDiff  = prevDuration - newPathDuration;
      const markerTime    = marker.get('time');
      const newMarkerTime = markerTime + durationDiff;
      const roundTime     = state.get('roundTime');
      let newRoundTime    = roundTime;
      
      const mostForwardMarker = markers.find(p => {
        return (p.get('id') !== parseInt(markerId)) && (p.get('time') < newMarkerTime);
      });

      if (!mostForwardMarker) {
        newRoundTime = parseFloat((roundTime + durationDiff).toFixed(0));
      }

      const key = ['markers', markerId, 'paths'];
      return state.withMutations(newState => {
        newState.set('roundTime', newRoundTime);
        newState.setIn(['markers', markerId, 'time'], newMarkerTime);
        newState.setIn([...key, pathIdx], newPath);
        nextPath && newState.setIn([...key, pathIdx + 1], nextPath);
      });
    }


  case types.SET_PREVIEW_LINE:
    {
      const markerId = action.data;
      const marker   = state.getIn(['markers', markerId.toString()]);
      const paths    = marker.get('paths');
      const coords   = paths.last() || Map({x2: marker.get('x'), y2: marker.get('y')});

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
    {
      // TODO: if deleted marker was the most forward one, reset the roundTime!!
      return state.deleteIn(['markers', action.data.toString()]);
    }
  
  
  default:
    return state;
  }
}
