import React, { PropTypes, PureComponent } from 'react';
import { connect }     from 'react-redux';
import TimelineRuler   from './components/TimelineRuler';
import TimelineCaret   from './components/TimelineCaret';
import { updateCaret } from './state/actions';


export class Timeline extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    caretPos: PropTypes.number.isRequired
  }
  
  state = {
    mouseDown: false,
    draggingCaret: false
  }
  
  
  dragCaret = (e) => {
    const pos = this.getCaretPos(e);
    this.props.dispatch(updateCaret(pos));
  }
  
  
  startCaretDrag = () => {
    this.setState({draggingCaret: true});
  }
  
  
  stopCaretDrag = () => {
    this.setState({draggingCaret: false});
  }
  
  
  targetIsCaret = (e) => {
    const className = 'timeline-caret';
    const el = e.target;
    const parentEl = e.target.parentNode;
    return el.classList.contains(className) || parentEl.classList.contains(className);
  }
  
  
  getCaretPos = (e) => {
    const tl = this.refTimeline;
    return (e.clientX - tl.offsetLeft) / tl.offsetWidth * 100;
  }
  
  
  mouseUpHandler = () => {
    this.setState({mouseDown: false, draggingCaret: false});
  }
  
  
  mouseDownHandler = () => {
    this.setState({mouseDown: true});
  }
  
  
  mouseMoveHandler = (e) => {
    const { draggingCaret, mouseDown } = this.state;

    if (draggingCaret) {
      return this.dragCaret(e);
    }
    
    if (this.targetIsCaret(e) && mouseDown) {
      return this.startCaretDrag(e);
    }
  }
  
  
  setRefTimeline = (el) => this.refTimeline = el;
  setRefCaret    = (el) => this.refCaret = el;
  
  render() {
    const { caretPos } = this.props;
    
    return (
      <div ref={this.setRefTimeline}
        className="timeline"
        onMouseUp={this.mouseUpHandler}
        onMouseDown={this.mouseDownHandler}
        onMouseMove={this.mouseMoveHandler}
      >
        <TimelineRuler />
        <TimelineCaret ref={this.setRefCaret} left={caretPos} />
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    caretPos: state.timeline.get('caretPos')
  };
};

export default connect(mapStateToProps)(Timeline);
