import React, { PropTypes } from 'react';
import Caret from 'images/timeline-caret.svg';

TimelineCaret.propTypes = {
  left: PropTypes.number.isRequired
};

export default function TimelineCaret({left}) {
  
  return (
    <Caret style={{left: 50}} className="timeline-caret" />
  );
}
