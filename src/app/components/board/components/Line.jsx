import React, { PropTypes, PureComponent } from 'react';


export default class Line extends PureComponent {

  static propTypes = {
    x1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
    idx: PropTypes.number.isRequired,
    isLast: PropTypes.bool.isRequired,
    markerId: PropTypes.number.isRequired,
    lineDownHandler: PropTypes.func.isRequired,
    nodeDownHandler: PropTypes.func.isRequired,
    nodeClickHandler: PropTypes.func.isRequired,
    lineClickHandler: PropTypes.func.isRequired
  }

  squareWidth = 10;

  render() {
    const { x1, x2, y1, y2, markerId, idx, nodeClickHandler, nodeDownHandler, lineClickHandler, lineDownHandler, isLast } = this.props;

    return (
      <svg className="path">
        <line
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          stroke="red"
          strokeWidth={3}
          onClick={lineClickHandler}
          onMouseDown={lineDownHandler}
          data-pathIdx={idx}
          data-markerId={markerId}
          className="path-line"
        />
        <rect
          onClick={nodeClickHandler}
          onMouseDown={nodeDownHandler}
          data-markerId={markerId}
          data-pathIdx={idx}
          data-isLast={isLast}
          className="path-node"
          fill="yellow"
          width="10"
          height="10"
          x={x2 - this.squareWidth / 2}
          y={y2 - this.squareWidth / 2}
        />
      </svg>
    );
  }
}
