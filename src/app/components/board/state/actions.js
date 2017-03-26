import * as types from './action-types';

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
