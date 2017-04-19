import React, { PropTypes, PureComponent } from 'react';
import Board    from 'components/board/Board';
import Timeline from 'components/timeline/Timeline';

export default class Editor extends PureComponent {

  static propTypes = {
    
  }
  
  state = {
    
  }
  
  componentWillMount() {
    
  }
  

  render() {
    
    
    return (
      <div className="editor">
        <Board />
        <Timeline />
      </div>
    );
  }
}
