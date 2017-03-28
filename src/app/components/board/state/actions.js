import * as types from './action-types';
import { distanceToSeconds } from '../utils/distance';

export function addPlayerMarker(x, y) {
  return {
    type: types.ADD_PLAYER_MARKER,
    data: {x, y}
  };
}

export function updatePlayerMarker(data) {
  return {
    type: types.UPDATE_PLAYER_MARKER,
    data: data
  };
}

export function addPathNode(coords, markerId) {
  const duration = distanceToSeconds(coords);
  
  return {
    type: types.ADD_PATH_NODE,
    data: { coords, duration, markerId }
  };
}
