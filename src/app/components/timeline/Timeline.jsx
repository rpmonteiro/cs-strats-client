import React, { PropTypes, PureComponent } from 'react';
import TimelineRuler from './components/TimelineRuler';
import TimelineCaret from './components/TimelineCaret';

export default class Timeline extends PureComponent {

  static propTypes = {
    
  }
  
  state = {
    
  }
  
  componentWillMount() {
    
  }
  

  render() {
    
    
    return (
      <div className="timeline">
        <TimelineRuler />
        <TimelineCaret left={0} />
      </div>
    );
  }
}
