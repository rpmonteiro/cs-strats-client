
import React, { Component, PropTypes } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemTypes                       from '../ItemTypes';
import PlayerMarker                    from './PlayerMarker';
import { updatePlayerMarker }          from '../state/actions';


const dropSource = {
  drop(props, monitor) {
    const { x: initialX, y: initialY, id } = monitor.getItem();
    const { x: xOffset, y: yOffset } = monitor.getDifferenceFromInitialOffset();
    
    const x = initialX + xOffset;
    const y = initialY + yOffset;
    
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
      <div className="drag-container">
        {playerMarkers}
      </div>
    );
  }
}
