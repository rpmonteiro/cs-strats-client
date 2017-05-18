import React, { PropTypes, PureComponent } from 'react';
import { connect }     from 'react-redux';
import TimelineRuler   from './components/TimelineRuler';
import TimelineCaret   from './components/TimelineCaret';
import TimelineMarker  from './components/TimelineMarker';
import { updateCaret } from './state/actions';


export class Timeline extends PureComponent {

  static propTypes = {
    dispatch:      PropTypes.func.isRequired,
    caretPos:      PropTypes.number.isRequired,
    markers:       PropTypes.object.isRequired,
    roundDuration: PropTypes.number.isRequired
  }

  state = {
    mouseDown: false,
    draggingCaret: false
  }


  dragCaret = (e) => {
    const caretPos = this.getCaretPos(e);
    this.props.dispatch(updateCaret(caretPos));
  }

  clickHandler = (e) => {
    this.dragCaret(e);
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
    const { roundDuration } = this.props;
    const caretWidth = document.querySelector('.timeline-caret').width.baseVal.value;
    const tr = document.querySelector('.timeline-ruler');
    const tl = this.refTimeline;
    const x = e.clientX;

    const caretOffset = Math.ceil(tr.offsetLeft - caretWidth / 2);
    const start = (x - tl.offsetLeft - caretWidth / 2);
    const end = tl.offsetWidth - tr.offsetLeft;

    if (start <= caretOffset) {
      return { pos: (caretOffset / tr.offsetWidth) * 100, time: 0 };
    }

    if (x - tl.offsetLeft >= end) {
      const pos = ((tr.offsetWidth - caretWidth) / tr.offsetWidth) * 100;
      return { pos, time: roundDuration };
    }

    const pos = start / tl.offsetWidth * 100;
    const rulerPos = (x - tl.offsetLeft - tr.offsetLeft) / tr.offsetWidth;
    const time = rulerPos * roundDuration;
    return { pos, time };
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


  renderMarkers = () => {
    const { markers, roundDuration } = this.props;
    const tl = this.refTimeline;

    if (!tl || !markers.size) {
      return false;
    }

    const tlMarkers = [];
    markers.map((m, idx) => {
      const id = m.get('id');
      const time = m.get('time');
      const pos = Math.abs(time / roundDuration) * 100;
      const top = idx * 10;
      tlMarkers.push(<TimelineMarker key={`m-${idx}`} pos={pos} top={top} id={id} />);
    });

    return tlMarkers;
  }


  setRefTimeline = (el) => this.refTimeline = el;
  setRefCaret    = (el) => this.refCaret = el;

  render() {
    const { caretPos, roundDuration } = this.props;

    return (
      <div ref={this.setRefTimeline}
        className="timeline"
        onClick={this.clickHandler}
        onMouseUp={this.mouseUpHandler}
        onMouseDown={this.mouseDownHandler}
        onMouseMove={this.mouseMoveHandler}
      >
        {this.renderMarkers()}
        <TimelineRuler roundDuration={roundDuration} />
        <TimelineCaret ref={this.setRefCaret} left={caretPos} />
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    caretPos:      state.timeline.get('caretPos'),
    markers:       state.board.get('markers'),
    roundDuration: state.board.get('roundDuration')
  };
};

export default connect(mapStateToProps)(Timeline);
