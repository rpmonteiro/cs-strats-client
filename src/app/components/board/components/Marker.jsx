import React, { Component, PropTypes } from 'react';
// import { updateMarker }                from '../state/actions';

const MARKER_WIDTH = 20;

function getStyles(props) {
  const { x, y } = props;

  return {
    left: x - MARKER_WIDTH / 2 + 'px',
    top: y - MARKER_WIDTH / 2 + 'px'
    // opacity: isDragging ? 0 : 1,
    // height: isDragging ? 0 : '',
  };
}

export default class Marker extends Component {
  
  static propTypes = {
    clickHandler: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  
  render() {
    const { className, id, clickHandler } = this.props;

    return (
      <div className={className}
        onClick={clickHandler}
        style={getStyles(this.props)}
        data-id={id}>
      </div>
    );
  }
}
