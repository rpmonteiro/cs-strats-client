import * as types from './action-types';


export function addMarker(coords) {
  return {
    type: types.ADD_MARKER,
    data: coords
  };
}


export function addPath(markerId) {
  return {
    type: types.ADD_PATH,
    data: markerId
  };
}


export function setPreviewLine(markerId) {
  return {
    type: types.SET_PREVIEW_LINE,
    data: markerId
  };
}


export function updateMarker(data) {
  return {
    type: types.UPDATE_MARKER,
    data: data
  };
}


export function updatePreviewLine({x, y}) {
  return {
    type: types.UPDATE_PREVIEW_LINE,
    data: { x, y }
  };
}


export function updatePath(data) {
  return {
    type: types.UPDATE_PATH,
    data: data
  };
}


export function removePath(data) {
  return {
    type: types.REMOVE_PATH,
    data: data
  };
}


export function resetPreviewLine() {
  return {
    type: types.RESET_PREVIEW_LINE
  };
}

export function removeMarker(markerId) {
  return {
    type: types.REMOVE_MARKER,
    data: markerId
  };
}
