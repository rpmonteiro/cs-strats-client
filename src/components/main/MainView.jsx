import React, { PropTypes, PureComponent } from 'react';
import src from '../../images/de_inferno.jpg';


export default class MainView extends PureComponent {

  state = {
    selected: false,
    mouseDown: false,
    selectedEl: ''
  }
  
  
  componentWillMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }
  
  
  startDrag = (e) => {
    this.setState({
      selectedEl: e.target,
      mouseDown: true
    });
  }
  
  
  stopDrag = () => {
    this.setState({
      selectedEl: '',
      dragging: false,
      mouseDown: false
    });
  }
  
  
  mouseMoveHandler = (e) => {
    const { selectedEl, mouseDown, dragging } = this.state;
    
    if (selectedEl && mouseDown) {
      const newStyle = `top:${e.clientY - 10}px; left:${e.clientX - 10}px`;
      selectedEl.setAttribute('style', newStyle);
      
      if (!dragging) {
        this.setState({dragging: true});
      }
    }
  }
  
  
  clickHandler = (e) => {
    if (e.target !== this.refs.map) {
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
    const { selected, dragging } = this.state;

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
    this.setState({selected: true, selectedEl: el, mouseDown: false});
  }
  
  
  unselectEl = () => {
    const { selectedEl } = this.state;
    
    if (selectedEl) {
      selectedEl.classList.remove('active');
    }
    
    this.setState({selected: false, selectedEl: '', mouseDown: false});
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
        <img ref="map" draggable="false" src={src}></img>
      </div>
    );
  }
}
