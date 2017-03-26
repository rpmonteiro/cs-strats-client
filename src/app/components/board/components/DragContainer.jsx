
import React, { Component, PropTypes } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemTypes                       from '../ItemTypes';
import PlayerMarker                    from './PlayerMarker';

import {
  updatePlayerMarker,
  addPlayerMarker
} from '../state/actions';


const dropSource = {
  drop(props, monitor, component) {
    const { x: initialX, y: initialY, id } = monitor.getItem();
    const { x: xOffset, y: yOffset } = monitor.getDifferenceFromInitialOffset();

    const x = initialX + xOffset;
    const y = initialY + yOffset;
    
    component.justDropped();
    props.dispatch(updatePlayerMarker({x, y, id}));
  }
};

@DropTarget(ItemTypes.PLAYER, dropSource, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Container extends Component {
  
  static propTypes = {
    players:           PropTypes.object.isRequired,
    dispatch:          PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  }
  
  state = {
    justDropped: false
  }
  
  justDropped = () => {
    this.setState({justDropped: true});
  }
  
  clickHandler = (e) => {
    if (this.state.justDropped || !e.target.classList.contains('drag-container')) {
      this.setState({justDropped: false});
      return;
    }
    
    const offsetY = e.target.parentNode.offsetTop;
    const offsetX = e.target.parentNode.offsetLeft;
    
    const x = e.clientX - offsetX - 10;
    const y = e.clientY - offsetY - 10;
    
    this.props.dispatch(addPlayerMarker(x, y));
  }
  
  
  render() {
    const { connectDropTarget, players, dispatch } = this.props;

    const playerMarkers = players.map(p => {
      return (
        <PlayerMarker
          key={`p-${p.id}`}
          id={p.id}
          x={p.x}
          y={p.y}
          dispatch={dispatch}
        />
      );
    });

    return connectDropTarget(
      <div className="drag-container" onClick={this.clickHandler}>
        {playerMarkers}
      </div>
    );
  }
}
