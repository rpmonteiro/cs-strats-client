import React, { PropTypes, PureComponent } from 'react';
import { connect }                         from 'react-redux';
import src                                 from 'images/de_inferno.jpg';
import { addPlayerMarker }                 from './state/actions';
import { DragDropContext }                 from 'react-dnd';
import MouseBackend                        from 'react-dnd-mouse-backend';
import CustomDragLayer                     from './components/CustomDragLayer';
import DragContainer                       from './components/DragContainer';



@DragDropContext(MouseBackend)
export class Board extends PureComponent {
  
  static propTypes = {
    dispatch: PropTypes.func,
    players:  PropTypes.object
  }

  state = {
    
  }

  render() {
    const { players, dispatch } = this.props;
    
    return (
      <div className="board">
        <DragContainer dispatch={dispatch} players={players} />
        <CustomDragLayer />
        {/* <svg className="paths" ref="svg"></svg> */}
        <img ref="map" src={src}></img>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    players: state.board.get('players')
  };
};

export default connect(mapStateToProps)(Board);
