import React, { PropTypes, PureComponent } from 'react';
import { connect }                         from 'react-redux';
import { DragDropContext }                 from 'react-dnd';
import MouseBackend                        from 'react-dnd-mouse-backend';
import CustomDragLayer                     from './components/CustomDragLayer';
import DragContainer                       from './components/DragContainer';


@DragDropContext(MouseBackend)
export class Board extends PureComponent {
  
  static propTypes = {
    dispatch:    PropTypes.func.isRequired,
    players:     PropTypes.object.isRequired,
    previewLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
  }
  

  render() {
    const { players, dispatch, previewLine } = this.props;
    
    return (
      <div className="board">
        <DragContainer
          dispatch={dispatch}
          players={players}
          previewLine={previewLine}
        />
        <CustomDragLayer />
        <div className="map"></div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    players: state.board.get('players'),
    previewLine: state.board.get('previewLine')
  };
};

export default connect(mapStateToProps)(Board);
