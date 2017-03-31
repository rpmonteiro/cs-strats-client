import * as types from './action-types';


export function addMarker(x, y) {
  return {
    type: types.ADD_MARKER,
    data: {x, y}
  };
}


export function addNode(markerId) {
  return {
    type: types.ADD_NODE,
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


export function updateNode(data) {
  return {
    type: types.UPDATE_NODE,
    data: data
  };
}


export function removeNode(data) {
  return {
    type: types.REMOVE_NODE,
    data: data
  };
}


export function resetPreviewLine() {
  return {
    type: types.RESET_PREVIEW_LINE
  };
}
