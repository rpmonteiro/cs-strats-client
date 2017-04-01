
import React, { Component, PropTypes } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemTypes                       from '../utils/ItemTypes';
import Marker                          from './Marker';
import PreviewLine                     from './PreviewLine';
import Path                            from './Path';

import {
  addMarker,
  addNode,
  updateMarker,
  updateNode,
  setPreviewLine,
  updatePreviewLine,
  resetPreviewLine
} from '../state/actions';


const dropSource = {
  drop(props, monitor, component) {
    component.justDropped();
  }
};


@DropTarget(ItemTypes.PLAYER, dropSource, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Container extends Component {
  
  static propTypes = {
    players:           PropTypes.object.isRequired,
    previewLine:       PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    dispatch:          PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  }
  
  state = {
    activeMarkerId: '',
    justDropped: false
  }
  
  
  componentWillMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillReceiveProps() {
  }
  
  
  clickHandler = (e) => {
    console.log('clickHandler');
    const { previewLine } = this.props;
    const { activeMarkerId } = this.state;
    const { x, y } = this.getXYCoords(e);
    
    if (this.state.justDropped || !e.target.classList.contains('drag-container')) {
      this.setState({justDropped: false});
      return;
    }
    
    if (previewLine) {
      this.addNode(activeMarkerId);
      return;
    }
    
    if (e.target.classList.contains('player-marker')) {
      return;
    }
    console.log('add marker');
    this.props.dispatch(addMarker(x, y));
  }
  
  
  justDropped = () => {
    this.setState({justDropped: true});
  }
  
  
  addNode = () => {
    console.log('adding node');
    const { activeMarkerId } = this.state;
    this.props.dispatch(addNode(activeMarkerId));
    this.setPreviewLine();
  }
  
  
  setPreviewLine = () => {
    console.log('setPreviewLine');
    const { activeMarkerId } = this.state;
    this.props.dispatch(setPreviewLine(activeMarkerId));
  }
  
  
  getXYCoords = (e) => {
    return {
      x: e.clientX - e.target.parentNode.offsetLeft,
      y: e.clientY - e.target.parentNode.offsetTop
    };
  }
  
  
  markerHandler = (e) => {
    const { activeMarkerId } = this.state;
    
    const id = e.target.dataset.id;

    
    if (activeMarkerId !== '') {
      this.setState({activeMarkerId: ''});
      return;
    }
    
    this.setState({activeMarkerId: parseInt(id)}, this.setPreviewLine);
  }
  
  
  moveHandler = (e) => {
    const { previewLine, dispatch } = this.props;
    
    if (previewLine) {
      const { x, y } = this.getXYCoords(e);
      dispatch(updatePreviewLine({x, y}));
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
    // TODO: rename this method and stop preview line/active marker
    const { previewLine, dispatch } = this.props;
    
    if (previewLine) {
      dispatch(resetPreviewLine());
    }
    
    this.setState({
      activeMarkerId: '',
    });
  }
  
  
  render() {
    const { connectDropTarget, players, previewLine, dispatch } = this.props;
    const { activeMarkerId } = this.state;
    
    const pathNodes = [], playerMarkers = [];
    
    players.map(p => {
      const id = p.get('id');
      const paths = p.get('paths');

      paths.map((path, idx) => {
        pathNodes.push(
          <Path
            key={`path-${id}-${idx}`}
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
        <Marker
          clickHandler={this.markerHandler}
          className={className}
          dispatch={dispatch}
          key={`p-${id}`}
          id={id}
          x={p.get('x')}
          y={p.get('y')}
        />
      );
    });

    let previewNode;
    if (previewLine) {
      previewNode = <PreviewLine coords={previewLine} />;
    }

    return connectDropTarget(
      <div
        className="drag-container"
        onClick={this.clickHandler}
        onMouseMove={this.moveHandler}
      >
        <svg className="paths" ref="svg">
          {pathNodes}
          {previewNode}
        </svg>
        {playerMarkers}
      </div>
    );
  }
}
