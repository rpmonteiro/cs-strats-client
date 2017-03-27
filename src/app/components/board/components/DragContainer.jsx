
import React, { Component, PropTypes } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemTypes                       from '../utils/ItemTypes';
import PlayerMarker                    from './PlayerMarker';
import { line, square }                from '../utils/svgShapes';

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
    justDropped: false,
    activeMarkerId: '',
    activeLine: ''
  }
  
  
  componentWillMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }
  
  
  justDropped = () => {
    this.setState({justDropped: true});
  }
  
  
  clickHandler = (e) => {
    if (this.state.justDropped || !e.target.classList.contains('drag-container')) {
      this.setState({justDropped: false});
      return;
    }
    
    const { x: eventX, y: eventY } = this.getXYCoords(e);
    
    const x = eventX - 10;
    const y = eventY - 10;
    
    this.props.dispatch(addPlayerMarker(x, y));
  }
  
  
  getXYCoords = (e) => {
    return {
      x: e.clientX - e.target.parentNode.offsetLeft,
      y: e.clientY - e.target.parentNode.offsetTop
    };
  }
  
  
  markerHandler = (e) => {
    const id = e.target.dataset.id;
    const { activeMarkerId } = this.state;
    
    if (activeMarkerId !== '') {
      this.setState({activeMarkerId: ''});
    } else {
      const elTransform = window.getComputedStyle(e.target, null).getPropertyValue('transform');
      let values = elTransform.split('(')[1];
      values = values.split(')')[0];
      values = values.split(',');
      
      const x = values[4];
      const y = values[5];
      
      const newLine = line();
      newLine.setAttribute('x1', x);
      newLine.setAttribute('x2', x);
      newLine.setAttribute('y1', y);
      newLine.setAttribute('y2', y);
      this.refs.svg.appendChild(newLine);
      
      this.setState({
        activeMarkerId: parseInt(id),
        activeLine: newLine
      });
    }
  }
  
  
  moveHandler = (e) => {
    const { activeLine } = this.state;
    
    if (activeLine) {
      const { x, y } = this.getXYCoords(e);
      
      activeLine.setAttribute('x2', x);
      activeLine.setAttribute('y2', y);
    }
  }
  
  
  keydownHandler = (e) => {
    const key = e.which || e.keycode;
    console.log('onKeyDown');
    if (key === 27) { // escape
      console.log('escape key pressed');
      this.resetSelections();
    }
  }
  
  
  resetSelections = () => {
    const { activeLine } = this.state;
    
    activeLine.parentNode.removeChild(activeLine);
    this.setState({
      activeMarkerId: '',
      activeLine: ''
    });
  }
  
  
  drawPath = () => {
    const { activeLine } = this.state;
    if (!activeLine) {
      return;
    }
    
    const lineX = activeLine.getAttribute('x2');
    const lineY = activeLine.getAttribute('y2');
    
    const square = square();
    square.setAttribute('x', lineX - 5);
    square.setAttribute('y', lineY - 5);
    this.refs.svg.appendChild(square);
    
    const line = line();
    line.setAttribute('x1', lineX);
    line.setAttribute('y1', lineY);
    this.refs.svg.appendChild(line);
    this.setState({activeLine: line});
  }
  
  
  
  render() {
    const { connectDropTarget, players } = this.props;
    const { activeMarkerId } = this.state;

    const playerMarkers = players.map(p => {
      const id = p.id;
      let className = 'player-marker';
      if (activeMarkerId === id) {
        className += ' active';
      }
      
      return (
        <PlayerMarker
          clickHandler={this.markerHandler}
          className={className}
          key={`p-${id}`}
          id={id}
          x={p.x}
          y={p.y}
        />
      );
    });

    return connectDropTarget(
      <div
        className="drag-container"
        onClick={this.clickHandler}
        onMouseMove={this.moveHandler}
      >
        <svg className="paths" ref="svg"></svg>
        {playerMarkers}
      </div>
    );
  }
}
