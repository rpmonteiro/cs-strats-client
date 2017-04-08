import { combineReducers } from 'redux';
import { routerReducer }   from 'react-router-redux';
import BoardReducer        from 'components/board/state/reducer';


export default combineReducers({
  routing: routerReducer,
  board: BoardReducer
});
