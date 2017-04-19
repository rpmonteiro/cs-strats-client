import { combineReducers } from 'redux';
import { routerReducer }   from 'react-router-redux';
import BoardReducer        from 'components/board/state/reducer';
import TimelineReducer     from 'components/timeline/state/reducer';


export default combineReducers({
  routing:  routerReducer,
  board:    BoardReducer,
  timeline: TimelineReducer
});
