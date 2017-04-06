
import React, { PureComponent, PropTypes } from 'react';
import { connect }                         from 'react-redux';
import Marker                              from './components/Marker';
import PreviewLine                         from './components/PreviewLine';
import Line                                from './components/Line';

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
    dispatch:    PropTypes.func.isRequired,
    markers:     PropTypes.object.isRequired,
    roundTime:   PropTypes.number.isRequired,
    previewLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
  }
    
  state = {
    activeMarkerId: '',
    draggingMarkerId: '',
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
    
    if (this.targetIsMarker(e) && mouseDown) {
      this.startMarkerDrag(e);
      return;
    }
    
    if (previewLine) {
      const { x, y } = this.getXYCoords(e);
      if (x && y) {
        dispatch(updatePreviewLine({x, y}));
      }
      console.log(!!e, x, y);
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

  
  addPath = () => {
    console.log('adding path');
    const { activeMarkerId } = this.state;
    this.props.dispatch(addPath(activeMarkerId));
    this.setPreviewLine();
  }
  
  
  pathDrag = (e) => {
    console.log('pathDrag');
    const { draggingPath: { pathIdx, markerId } } = this.state;
    const { x, y } = this.getXYCoords(e);
    this.props.dispatch(updatePath({pathIdx, markerId, x, y}));
  }
  
  
  stopPathDrag = () => {
    console.log('stopPathDrag');
    this.setState({draggingPath: false});
  }
  
  
  pathClickHandler = () => {
    console.log('pathClickHandler');
  }
  
  
  pathDownHandler = (e) => {
    console.log('pathDownHandler');
    const { pathIdx, markerId } = e.target.dataset;
    this.setState({draggingPath: {pathIdx, markerId}});
  }
  
  
  setPreviewLine = () => {
    const { activeMarkerId } = this.state;
    this.props.dispatch(setPreviewLine(activeMarkerId));
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
    const { activeMarkerId, draggingMarkerId } = this.state;
    
    if (draggingMarkerId) {
      this.stopMarkerDrag();
      return;
    }
    
    const id = this.getMarkerId(e);
    
    if (e.shiftKey) {
      this.props.dispatch(removeMarker(id));
      return;
    }
    

    if (activeMarkerId !== '') {
      this.setState({activeMarkerId: ''});
      return;
    }
    
    this.setState({activeMarkerId: parseInt(id)}, this.setPreviewLine);
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
    // TODO: rename this method and stop preview line/active marker
    const { previewLine, dispatch } = this.props;
    
    if (previewLine) {
      dispatch(resetPreviewLine());
    }
    
    this.setState({activeMarkerId: ''});
  }
  
  
  render() {
    const { markers, previewLine, dispatch, roundTime } = this.props;
    const { activeMarkerId } = this.state;
    
    const pathEls = [], markerEls = [];
    
    markers.map(p => {
      const id = p.get('id');
      const markerPaths = p.get('paths');

      markerPaths.map((path, idx) => {
        pathEls.push(
          <Line
            key={`path-${id}-${idx}`}
            x1={path.get('x1')}
            x2={path.get('x2')}
            y1={path.get('y1')}
            y2={path.get('y2')}
            idx={idx}
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

      markerEls.push(
        <Marker
          clickHandler={this.markerClickHandler}
          className={className}
          dispatch={dispatch}
          key={`p-${id}`}
          id={id}
          x={p.get('x')}
          y={p.get('y')}
        />
      );
    });

    let previewPath;
    if (previewLine) {
      previewPath = <PreviewLine coords={previewLine} />;
    }
    
    const currTime = <div className="round-time">{roundTime}</div>;
    
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
    markers: state.board.get('markers'),
    roundTime: state.board.get('roundTime'),
    previewLine: state.board.get('previewLine')
  };
};

export default connect(mapStateToProps)(Board);
