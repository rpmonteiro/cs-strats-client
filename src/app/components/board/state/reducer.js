import { fromJS, Map, List } from 'immutable';
import * as types            from './action-types';
import { coordsToSecs }      from '../utils/distance';

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
      if (state.get('markers').size >= 10) {
        return state;
      }

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

      const duration      = coordsToSecs(coords);
      const roundTime     = state.get('roundTime');
      const roundDuration = state.get('roundDuration');
      const prevTime      = marker.get('time');
      const newTime       = parseFloat((prevTime - duration).toFixed(0));

      if (newTime < 0) {
        return state;
      }


      const mostForwardMarker = newTime < roundTime;
      const pathTime = parseFloat((roundDuration - newTime).toFixed(0));

      let newRoundTime = roundTime;
      if (mostForwardMarker) {
        newRoundTime = newTime;
      }

      const path     = coords.set('time', pathTime);
      const newPaths = marker.get('paths').push(path);

      return state.withMutations(newState => {
        newState.set('roundTime', newRoundTime);
        newState.setIn(['markers', markerId, 'time'], newTime);
        newState.setIn(['markers', markerId, 'paths'], newPaths);
      });
    }


  case types.ADD_INT_PATH: {
    const { x, y, pathIdx, markerId } = action.data;
    const pKey     = ['markers', markerId, 'paths'];
    const paths    = state.getIn(pKey);
    const prevPath = paths.get(pathIdx);

    let newPath = Map({
      x1: x,
      x2: prevPath.get('x2'),
      y1: y,
      y2: prevPath.get('y2')
    });

    const duration = coordsToSecs(newPath);
    const newPrevPath = prevPath.merge(Map({
      time: prevPath.get('time') - duration,
      x2: x,
      y2: y
    }));

    newPath = newPath.set('time', prevPath.get('time'));
    const newPaths = paths.splice(pathIdx, 1, newPrevPath, newPath);

    return state.withMutations(newState => {
      newState.setIn(pKey, newPaths);
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


  case types.REMOVE_MARKER: {
    const markerId          = action.data.toString();
    const roundTime         = state.get('roundTime');
    const roundDuration     = state.get('roundDuration');
    const markers           = state.get('markers');
    const marker            = markers.get(markerId);
    const markerTime        = marker.get('time');
    const mostForwardMarker = roundTime === markerTime;

    let newRoundTime = roundTime;
    if (mostForwardMarker && markers.size > 1) {
      let min = roundDuration;
      markers.map(m => {
        if (m.get('id') === parseInt(markerId)) {
          return;
        }
        const time = m.get('time');
        if (time < min) {
          min = time;
        }
      });

      newRoundTime = min;
    } else if (markers.size === 1) {
      newRoundTime = roundDuration;
    }

    return state.withMutations(newState => {
      newState.set('roundTime', newRoundTime);
      newState.deleteIn(['markers', markerId]);
    });
  }


  case types.REMOVE_PATH: {
    const { pathIdx, markerId } = action.data;
    const markerK   = ['markers', markerId];
    const pathsK    = ['markers', markerId, 'paths'];
    const marker    = state.getIn(markerK);
    const markers   = state.get('markers');
    const roundTime = state.get('roundTime');
    const roundDuration = state.get('roundDuration');

    let newPaths = state.getIn(pathsK).splice(pathIdx, 1);
    if (newPaths.size === 0) {
      return state.withMutations(newState => {
        newState.setIn(pathsK, List());
        newState.setIn([...markerK, 'time'], roundDuration);
      });
    }

    const prevPath = pathIdx > 0
    ? newPaths.get(pathIdx - 1)
    : Map({
      time: 0,
      x2: state.getIn([...markerK, 'x']),
      y2: state.getIn([...markerK, 'y'])
    });

    const pathToDel = state.getIn([...pathsK, pathIdx]);

    const nextPath = pathIdx <= newPaths.size
      ? newPaths.get(pathIdx)
      : false;

    let newPath, newMarkerTime, durationDiff = 0;
    if (nextPath) {
      newPath = Map({
        x1: prevPath.get('x2'),
        x2: nextPath && nextPath.get('x2'),
        y1: prevPath.get('y2'),
        y2: nextPath && nextPath.get('y2')
      });

      const newPathDuration = coordsToSecs(newPath);
      durationDiff = newPathDuration - pathToDel.get('time');

      const newPathTime = prevPath.get('time') + newPathDuration;
      newPath = newPath.set('time', newPathTime);
      newPaths = newPaths.withMutations(np => {
        np.set(pathIdx, newPath);
        np.map((p, idx) => {
          if (idx > pathIdx) {
            np.setIn([idx, 'time'], p.get('time') + durationDiff);
          }
        });
      });

      const timePassed = newPaths.reduce((a, b) => {
        return a + b.get('time');
      }, 0);

      newMarkerTime = roundDuration - timePassed;
    } else {
      const timeDiff = pathToDel.get('time') - prevPath.get('time');
      newMarkerTime = marker.get('time') + timeDiff;
    }


    let newRoundTime = roundTime - durationDiff;
    const markerTime = marker.get('time');
    const mostFwM = markerTime === roundTime;
    if (mostFwM) {
      const markerTimes = markers.map(m => {
        if (m.get('id') !== parseInt(markerId)) {
          return m.get('time');
        }
      }).toArray().filter(Boolean);

      const nextMostFwMTime = Math.min(...markerTimes);

      if (nextMostFwMTime < newRoundTime) {
        newRoundTime = nextMostFwMTime;
      }
    }

    // console.log('newPaths', newPaths.toJS());
    return state.withMutations(newState => {
      newState.setIn(pathsK, newPaths);
      newState.setIn([...markerK, 'time'], newMarkerTime);
      newState.set('roundTime', newRoundTime);
    });

  }


  default:
    return state;
  }
}
