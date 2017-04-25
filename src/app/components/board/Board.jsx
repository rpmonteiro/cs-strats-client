
import React, { PureComponent, PropTypes } from 'react';
import { connect }                         from 'react-redux';
import Marker                              from './components/Marker';
import PreviewLine                         from './components/PreviewLine';
import Line                                from './components/Line';
import { interpolate }                     from './utils/interpolation';
import { Map }                             from 'immutable';

import {
  addMarker,
  addPath,
  updateMarker,
  updatePath,
  setPreviewLine,
  updatePreviewLine,
  resetPreviewLine,
  removeMarker
} from './state/actions';


export class Board extends PureComponent {
  
  static propTypes = {
    dispatch:      PropTypes.func.isRequired,
    markers:       PropTypes.object.isRequired,
    caretTime:     PropTypes.number.isRequired,
    roundDuration: PropTypes.number.isRequired,
    previewLine:   PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
  }
    
  state = {
    activeMarkerId: '',
    draggingMarkerId: '',
    draggingPath: '',
    mouseDown: false
  }
  
  
  componentWillMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillReceiveProps() {
  }
  
  
  moveHandler = (e) => {
    const { draggingMarkerId, mouseDown, draggingPath } = this.state;
    const { previewLine, dispatch } = this.props;
    
    if (draggingPath) {
      this.dragPath(e);
      return;
    }
    
    if (draggingMarkerId) {
      this.dragMarker(e);
      return;
    }
    
    if (this.targetIsPath(e) && mouseDown) {
      this.startPathDrag(e);
      return;
    }
    
    if (this.targetIsMarker(e) && mouseDown) {
      this.startMarkerDrag(e);
      return;
    }
    
    if (previewLine) {
      const { x, y } = this.getXYCoords(e);
      dispatch(updatePreviewLine({x, y}));
    }
  }
  
  
  mouseDownHandler = () => {
    this.setState({mouseDown: true});
  }
  
  
  mouseUpHandler = () => {
    this.setState({mouseDown: false});
  }
  
  
  clickHandler = (e) => {
    e.stopPropagation();
    console.log('board clickHandler');
    const { previewLine } = this.props;
    const { activeMarkerId, draggingMarkerId, draggingPath } = this.state;
    const { x, y } = this.getXYCoords(e);

    if (this.targetIsPath(e) && !draggingPath) {
      const { isLast, markerId } = e.target.dataset;
      
      if (isLast === 'true') {
        this.toggleActiveMarker(markerId);
      }
      return;
    }
    
    if (draggingPath) {
      this.stopPathDrag();
      return;
    }
    
    if (draggingMarkerId) {
      this.stopMarkerDrag();
      return;
    }

    if (previewLine) {
      this.addPath(activeMarkerId);
      return;
    }
    
    console.log('add marker');
    this.props.dispatch(addMarker({x, y}));
  }


  targetIsMarker = (e) => {
    return e.target.classList.contains('marker');
  }
  
  
  targetIsPath = (e) => {
    return e.target.classList.contains('path-node');
  }

  
  addPath = () => {
    console.log('adding path');
    const { activeMarkerId } = this.state;
    this.props.dispatch(addPath(activeMarkerId));
    this.setPreviewLine();
  }
  
  
  dragPath = (e) => {
    const { draggingPath: { pathIdx, markerId } } = this.state;
    const { x, y } = this.getXYCoords(e);
    this.props.dispatch(updatePath({pathIdx, markerId, x, y}));
  }
  
  
  startPathDrag = (e) => {
    console.log('startPathDrag');
    const { pathIdx, markerId } = e.target.dataset;
    const data = { pathIdx: parseInt(pathIdx), markerId };
    this.setState({draggingPath: data});
  }
  
  
  stopPathDrag = () => {
    console.log('stopPathDrag');
    this.setState({draggingPath: false});
  }
  
  
  pathClickHandler = () => {
    console.log('pathClickHandler');
  }
  
  
  pathDownHandler = () => {
    console.log('pathDownHandler');
    this.setState({mouseDown: true});
  }
  
  
  setPreviewLine = (markerId) => {
    const { activeMarkerId } = this.state;
    this.props.dispatch(setPreviewLine(activeMarkerId || markerId));
  }
  
  
  getXYCoords = (e) => {
    let boardEl = e.target.parentNode;
    if (!boardEl.classList.contains('board')) {
      boardEl = e.target.parentNode.parentNode;
    }
    
    return {
      x: e.clientX - boardEl.parentNode.offsetLeft,
      y: e.clientY - boardEl.parentNode.offsetTop
    };
  }
  
  
  markerClickHandler = (e) => {
    e.stopPropagation(); // so it doesnt trigger board click
    console.log('markerClickHandler');
    const { draggingMarkerId } = this.state;
    
    if (draggingMarkerId) {
      this.stopMarkerDrag();
      return;
    }
    
    const id = this.getMarkerId(e);
    if (e.shiftKey) {
      this.props.dispatch(removeMarker(id));
      return;
    }

    this.toggleActiveMarker(id);
  }
  
  
  toggleActiveMarker = (markerId) => {
    const { activeMarkerId } = this.state;
    
    if (activeMarkerId !== '') {
      this.resetSelections();
      return;
    }
    
    this.setState({activeMarkerId: parseInt(markerId)}, this.setPreviewLine);
  }
  

  startMarkerDrag = (e) => {
    console.log('startMarkerDrag');
    const id = this.getMarkerId(e);
    this.setState({draggingMarkerId: id});
  }
  
  
  dragMarker = (e) => {
    const { draggingMarkerId: id } = this.state;
    const { x, y } = this.getXYCoords(e);
    this.props.dispatch(updateMarker({x, y, id}));
  }
  
  
  stopMarkerDrag = () => {
    console.log('stop marker drag');
    this.setState({draggingMarkerId: ''});
  }

  
  getMarkerId = (e) => {
    return e.target.dataset.id;
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
    // TODO: rename this method?
    const { previewLine, dispatch } = this.props;
    
    if (previewLine) {
      dispatch(resetPreviewLine());
    }
    
    this.setState({activeMarkerId: ''});
  }
  
  
  getMarkerPos = (marker) => {
    const { roundDuration, caretTime } = this.props;
    const markerPaths = marker.get('paths');
    
    const markerTime = roundDuration - marker.get('time');
    let markerPos = marker;
    if (caretTime <= markerTime) {
      const nodeIdx = markerPaths.findIndex(p => {
        const pTime = p.get('time');
        return caretTime <= pTime;
      });
      
      const node = nodeIdx === -1 ? '' : markerPaths.get(nodeIdx);
      const prevNode = nodeIdx === 0 ? '' : markerPaths.get(nodeIdx - 1);

      const nodeTime = node ? node.get('time') : 0;
      const prevNodeTime = prevNode ? prevNode.get('time') : 0;
      
      const progress = (caretTime - prevNodeTime) / (nodeTime - prevNodeTime);
      
      markerPos = interpolate(prevNode || marker, node, progress);
    } else if (markerPaths.size) {
      const lastM = markerPaths.last();
      markerPos = Map({x: lastM.get('x2'), y: lastM.get('y2')});
    }
    
    return markerPos;
  }
  
  
  render() {
    const { markers, previewLine, dispatch, caretTime } = this.props;
    const { activeMarkerId } = this.state;
    
    const pathEls = [], markerEls = [];
    
    if (markers.size) {
      markers.map(m => {
        const id = m.get('id');
        const markerPaths = m.get('paths');
        
        markerPaths.map((path, idx) => {
          pathEls.push(
            <Line
              key={`path-${id}-${idx}`}
              x1={path.get('x1')}
              x2={path.get('x2')}
              y1={path.get('y1')}
              y2={path.get('y2')}
              idx={idx}
              isLast={idx === markerPaths.size - 1}
              clickHandler={this.pathClickHandler}
              mouseDownHandler={this.pathDownHandler}
              markerId={id}
            />
          );
        });
        
        let className = 'marker';
        if (activeMarkerId === id) {
          className += ' active';
        }
        
        const markerPos = this.getMarkerPos(m);
        
        markerEls.push(
          <Marker
            clickHandler={this.markerClickHandler}
            className={className}
            dispatch={dispatch}
            key={`p-${id}`}
            id={id}
            x={markerPos.get('x')}
            y={markerPos.get('y')}
          />
        );
      });
    }

    let previewPath;
    if (previewLine) {
      previewPath = <PreviewLine coords={previewLine} />;
    }
    
    const currTime = <div className="round-time">{caretTime}</div>;
    
    return (
      <div className="board"
        onClick={this.clickHandler}
        onMouseMove={this.moveHandler}
        onMouseDown={this.mouseDownHandler}
        onMouseUp={this.mouseUpHandler}
      >
        {currTime}
        <svg className="paths" ref="svg">
          {pathEls}
          {previewPath}
        </svg>
        {markerEls}
        <div className="map"></div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    markers:       state.board.get('markers'),
    roundDuration: state.board.get('roundDuration'),
    previewLine:   state.board.get('previewLine'),
    caretTime:     state.timeline.get('caretTime')
  };
};

export default connect(mapStateToProps)(Board);
