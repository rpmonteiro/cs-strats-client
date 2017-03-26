
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
      newLine.setAttribute('y1', y);
      this.refs.svg.appendChild(newLine);
      
      this.setState({
        activeMarkerId: parseInt(id),
        activeLine: newLine
      });
    }
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
    line.setAttribute('x2', lineX);
    line.setAttribute('y2', lineY);
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
      <div className="drag-container" onClick={this.clickHandler}>
        <svg className="paths" ref="svg"></svg>
        {playerMarkers}
      </div>
    );
  }
}
