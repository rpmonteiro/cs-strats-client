import * as types from './action-types';

export function updateCaret(data) {
  return {
    type: types.UPDATE_CARET,
    data: data
  };
}
