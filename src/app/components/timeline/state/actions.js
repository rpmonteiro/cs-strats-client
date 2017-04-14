import * as types from './action-types';

export function updateCaret(leftPos) {
  return {
    type: types.UPDATE_CARET,
    data: leftPos
  };
}
