
import React, { Component, PropTypes } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemTypes                       from '../utils/ItemTypes';
import PlayerMarker                    from './PlayerMarker';
import Path                            from './Path';
import { makeLine, makeSquare }        from '../utils/svgShapes';

import {
  updatePlayerMarker,
  addPlayerMarker,
  addPathNode
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
    const { activeLine } = this.state;
    
    if (this.state.justDropped || !e.target.classList.contains('drag-container')) {
      this.setState({justDropped: false});
      return;
    }
    
    if (activeLine) {
      this.drawPath(e);
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
      
      const line = makeLine();
      line.setAttribute('x1', x);
      line.setAttribute('x2', x);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      this.refs.svg.appendChild(line);
      
      this.setState({
        activeMarkerId: parseInt(id),
        activeLine: line
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
    
    if (activeLine) {
      activeLine.parentNode.removeChild(activeLine);
      this.setState({
        activeMarkerId: '',
        activeLine: ''
      });
    }
  }
  
  
  drawPath = () => {
    const { activeLine, activeMarkerId } = this.state;
    const { dispatch } = this.props;

    
    const x1 = activeLine.getAttribute('x1');
    const x2 = activeLine.getAttribute('x2');
    
    const y1 = activeLine.getAttribute('y1');
    const y2 = activeLine.getAttribute('y2');
    
    const squareWidth = 10;
    const square = makeSquare();
    square.setAttribute('x', x2 - squareWidth / 2);
    square.setAttribute('y', y2 - squareWidth / 2);
    this.refs.svg.appendChild(square);
    
    const line = makeLine();
    line.setAttribute('x1', x2);
    line.setAttribute('x2', x2);
    line.setAttribute('y1', y2);
    line.setAttribute('y2', y2);
    this.refs.svg.appendChild(line);
    this.setState({activeLine: line});

    dispatch(addPathNode({x1, x2, y1, y2}, activeMarkerId));
  }
  
  
  
  render() {
    const { connectDropTarget, players } = this.props;
    const { activeMarkerId } = this.state;
    
    const pathNodes = [], playerMarkers = [];
    players.map(p => {
      const id = p.get('id');
        
      const paths = p.get('paths');
      paths.map(path => {
        pathNodes.push(
          <Path
            x1={path.get('x1')}
            x2={path.get('x2')}
            y1={path.get('y1')}
            y2={path.get('y2')}
            markerId={id}
          />
        );
      });
      
      let className = 'player-marker';
      if (activeMarkerId === id) {
        className += ' active';
      }

      playerMarkers.push(
        <PlayerMarker
          clickHandler={this.markerHandler}
          className={className}
          key={`p-${id}`}
          id={id}
          x={p.get('x')}
          y={p.get('y')}
        />
      );
    });

    return connectDropTarget(
      <div
        className="drag-container"
        onClick={this.clickHandler}
        onMouseMove={this.moveHandler}
      >
        <svg className="paths" ref="svg">
          {pathNodes}
        </svg>
        {playerMarkers}
      </div>
    );
  }
}
