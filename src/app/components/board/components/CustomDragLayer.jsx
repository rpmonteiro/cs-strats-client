import React, { PureComponent, PropTypes } from 'react';
import { DragLayer }                   from 'react-dnd';
import ItemTypes                       from '../ItemTypes';
import PlayerMarkerPreview             from './PlayerMarkerPreview';


function getItemStyles(props) {
  const { initialOffset, currentOffset } = props;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

@DragLayer(monitor => ({
  item:          monitor.getItem(),
  itemType:      monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging:    monitor.isDragging()
}))
export default class CustomDragLayer extends PureComponent {
  
  static propTypes = {
    item: PropTypes.object,
    itemType: PropTypes.string,
    initialOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    isDragging: PropTypes.bool.isRequired
  };

  renderItem(type, item) {
    switch (type) {
    case ItemTypes.PLAYER:
      return (<PlayerMarkerPreview title={'Nox'} />);
    default:
      return null;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div className="drag-preview-layer">
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    );
  }
}
