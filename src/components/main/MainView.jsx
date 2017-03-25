import React, { PropTypes, PureComponent } from 'react';
import src from '../../images/de_inferno.jpg';


export default class MainView extends PureComponent {

  state = {
    selected: false,
    mouseDown: false,
    activeEl: '',
    activeLine: ''
  }
  
  
  componentWillMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }
  
  
  startDrag = (e) => {
    this.setState({
      activeEl: e.target,
      mouseDown: true
    });
  }
  
  
  stopDrag = () => {
    this.setState({
      activeEl: '',
      dragging: false,
      mouseDown: false
    });
  }
  
  
  makeLine = () => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.style.stroke = '#FFF';
    line.style.strokeWidth = '3px';
    return line;
  }
  
  
  makeSquare = () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const style = 'fill: yellow; stroke: back; stroke-width: 1';
    rect.setAttribute('width', '10');
    rect.setAttribute('height', '10');
    rect.setAttribute('style', style);
    return rect;
  }
  
  
  mouseMoveHandler = (e) => {
    const { activeEl, activeLine, mouseDown, dragging } = this.state;
    
    if (activeEl && mouseDown) {
      const newStyle = `top:${e.clientY - 10}px; left:${e.clientX - 10}px`;
      activeEl.setAttribute('style', newStyle);
      
      if (!dragging) {
        this.setState({dragging: true});
      }
    }
    
    if (activeEl && activeLine) {
      const line = activeLine;
      line.setAttribute('x2', e.clientX - 10);
      line.setAttribute('y2', e.clientY - 10);
    }
  }
  
  
  clickHandler = (e) => {
    const { activeLine } = this.state;
    
    if (e.target !== this.refs.map) {
      return;
    }
    
    if (activeLine) {
      const lineX = activeLine.getAttribute('x2');
      const lineY = activeLine.getAttribute('y2');
      
      const square = this.makeSquare();
      square.setAttribute('x', lineX - 5);
      square.setAttribute('y', lineY - 5);
      this.refs.svg.appendChild(square);
      
      
      const line = this.makeLine();
      line.setAttribute('x1', lineX);
      line.setAttribute('y1', lineY);
      line.setAttribute('x2', lineX);
      line.setAttribute('y2', lineY);
      this.refs.svg.appendChild(line);
      this.setState({activeLine: line});
      return;
    }

    const newEl = document.createElement('span');
    newEl.className = 'player-marker';
    newEl.setAttribute('draggable', 'true');
    newEl.style.top = e.clientY - 10 + 'px';
    newEl.style.left = e.clientX - 10 + 'px';
    newEl.setAttribute('draggable', 'false');
    newEl.addEventListener('click', this.elClickHandler);
    newEl.addEventListener('mousedown', this.startDrag);
    this.refs.container.appendChild(newEl);
  }
  
  
  elClickHandler = (e) => {
    const { selected, dragging, activeEl } = this.state;

    if (dragging) {
      this.stopDrag();
      return;
    }

    if (selected) {
      this.unselectEl();
      return;
    }

    const el = e.target;
    el.classList.add('active');
    
    const line = this.makeLine();
    line.setAttribute('x1', parseInt(activeEl.style.left));
    line.setAttribute('y1', parseInt(activeEl.style.top));
    this.refs.svg.appendChild(line);
    
    this.setState({
      selected: true,
      activeEl: el,
      activeLine: line,
      mouseDown: false
    });
  }
  
  
  unselectEl = () => {
    const { activeEl } = this.state;
    
    if (activeEl) {
      activeEl.classList.remove('active');
    }
    
    this.setState({selected: false, activeEl: '', mouseDown: false});
  }
  
  
  keydownHandler = (e) => {
    const key = e.which || e.keycode;

    if (key === 27) { // escape
      console.log('escape key pressed');
      this.unselectEl();
      this.stopDrag();
    }
  }
  
  render() {
    return (
      <div
        draggable="false"
        className="main-container"
        onClick={this.clickHandler}
        onMouseMove={this.mouseMoveHandler}
        ref="container"
      >
        <svg ref="svg"></svg>
        <img ref="map" draggable="false" src={src}></img>
      </div>
    );
  }
}
