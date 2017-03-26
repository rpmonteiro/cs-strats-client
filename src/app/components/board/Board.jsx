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
  
  
  clickHandler = (e) => {
    e.persist();
    const { offsetTop, offsetLeft } = this.refs.board;
    const markerX = e.clientX - offsetLeft - 10;
    const markerY = e.clientY - offsetTop - 10;
    this.props.dispatch(addPlayerMarker(markerX, markerY));
  }


  render() {
    const { players, dispatch } = this.props;
    
    return (
      <div
        className="board"
        onClick={this.clickHandler}
        ref="board"
      >
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
