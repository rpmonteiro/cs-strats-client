
import React, { PureComponent, PropTypes } from 'react';
import { connect }                         from 'react-redux';
import Marker                              from './components/Marker';
import PreviewLine                         from './components/PreviewLine';
import Line                                from './components/Line';

import {
  addMarker,
  addNode,
  updateMarker,
  updateNode,
  setPreviewLine,
  updatePreviewLine,
  resetPreviewLine
} from './state/actions';


export class Board extends PureComponent {
  
  static propTypes = {
    dispatch:    PropTypes.func.isRequired,
    players:     PropTypes.object.isRequired,
    roundTime:   PropTypes.string.isRequired,
    previewLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
  }
    
  state = {
    activeMarkerId: '',
    draggingMarkerId: ''
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
    const { draggingMarkerId } = this.state;
    const { previewLine, dispatch } = this.props;
    
    if (draggingMarkerId) {
      this.dragMarker(e);
      return;
    }
    
    if (previewLine) {
      const { x, y } = this.getXYCoords(e);
      dispatch(updatePreviewLine({x, y}));
    }
  }
  
  
  mouseDownHandler = (e) => {
    console.log('board mouseDownHandler');
    if (this.targetIsMarker(e)) {
      this.startMarkerDrag(e);
      return;
    }
  }
  
  
  clickHandler = (e) => {
    console.log('board clickHandler');
    const { previewLine } = this.props;
    const { activeMarkerId, draggingMarkerId } = this.state;
    const { x, y } = this.getXYCoords(e);
    
    if (draggingMarkerId) {
      this.stopMarkerDrag();
      return;
    }

    if (previewLine) {
      this.addNode(activeMarkerId);
      return;
    }
    
    console.log('add marker');
    this.props.dispatch(addMarker({x, y}));
  }


  targetIsMarker = (e) => {
    return e.target.classList.contains('marker');
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
    e.stopPropagation();
    console.log('markerHandler');
    const { activeMarkerId, draggingMarkerId } = this.state;
    
    if (draggingMarkerId) {
      this.stopMarkerDrag();
      return;
    }
    
    const id = this.getMarkerId(e);

    if (activeMarkerId !== '') {
      this.setState({activeMarkerId: ''});
      return;
    }
    
    this.setState({activeMarkerId: parseInt(id)}, this.setPreviewLine);
  }
  
  
  startMarkerDrag = (e) => {
    const id = this.getMarkerId(e);
    this.setState({draggingMarkerId: id});
  }
  
  
  dragMarker = (e) => {
    const { draggingMarkerId: id } = this.state;
    const { x, y } = this.getXYCoords(e);
    this.props.dispatch(updateMarker({x, y, id}));
  }
  
  
  stopMarkerDrag = () => {
    this.setState({draggingMarkerId: ''});
  }
  
  
  markerUpHandler = (e) => {
    console.log('markerUpHandler');
    e.stopPropagation();
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
    
    this.setState({
      activeMarkerId: '',
    });
  }
  
  
  render() {
    const { players, previewLine, dispatch, roundTime } = this.props;
    const { activeMarkerId } = this.state;
    
    const pathNodes = [], playerMarkers = [];
    
    players.map(p => {
      const id = p.get('id');
      const paths = p.get('paths');

      paths.map((path, idx) => {
        pathNodes.push(
          <Line
            key={`path-${id}-${idx}`}
            x1={path.get('x1')}
            x2={path.get('x2')}
            y1={path.get('y1')}
            y2={path.get('y2')}
            markerId={id}
          />
        );
      });
      
      let className = 'marker';
      if (activeMarkerId === id) {
        className += ' active';
      }

      playerMarkers.push(
        <Marker
          clickHandler={this.markerHandler}
          onMouseDown={this.markerDownHandler}
          onMouseUp={this.markerUpHandler}
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
    
    const currTime = <div className="round-time">{roundTime}</div>;
    
    return (
      <div className="board"
        onClick={this.clickHandler}
        onMouseMove={this.moveHandler}
        onMouseDown={this.mouseDownHandler}
      >
        {currTime}
        <svg className="paths" ref="svg">
          {pathNodes}
          {previewNode}
        </svg>
        {playerMarkers}
        <div className="map"></div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    players: state.board.get('players'),
    roundTime: state.board.get('roundTime'),
    previewLine: state.board.get('previewLine')
  };
};

export default connect(mapStateToProps)(Board);
