import React, { PropTypes, PureComponent } from 'react';


export default class Line extends PureComponent {

  static propTypes = {
    x1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
    markerId: PropTypes.number.isRequired,
    clickHandler: PropTypes.func.isRequired,
    mouseDownHandler: PropTypes.func.isRequired
  }
  
  squareWidth = 10;
  
  state = {
    
  }
  
  componentWillMount() {
    
  }
  

  render() {
    const { x1, x2, y1, y2 } = this.props;
    
    return (
      <svg className="path">
        <line
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          stroke="red"
          strokeWidth={3}
        />
        <rect
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
