import React, { Component, PropTypes } from 'react';
import { DragSource }                  from 'react-dnd';
import ItemTypes                       from '../ItemTypes';
import { getEmptyImage }               from 'react-dnd-html5-backend';
import ReactDOM                        from 'react-dom';
import { updatePlayerMarker }          from '../state/actions';


const markerSource = {
  beginDrag(props) {
    const { id, x, y } = props;
    return {id, x, y};
  }
};


function getStyles(props) {
  const { x, y, isDragging } = props;
  const transform = `translate3d(${x}px, ${y}px, 0)`;

  return {
    transform,
    position: 'absolute',
    WebkitTransform: transform,
    opacity: isDragging ? 0 : 1,
    height: isDragging ? 0 : '',
  };
}


@DragSource(ItemTypes.PLAYER, markerSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
export default class PlayerMarker extends Component {
  
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }

  render() {
    const { connectDragSource } = this.props;

    let className = 'player-marker';
    // active ? className += ' active' : '';

    return connectDragSource(
      <div ref={node => (this.node = node)} style={getStyles(this.props)}
        className={className}>
      </div>
    );
  }
}
