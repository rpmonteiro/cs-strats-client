import React, { PropTypes } from 'react';

const getRulerStyles = (roundDuration) => {
  const percentage = 100 / (roundDuration / 10);
  return {
    background: `
      repeating-linear-gradient(
        90deg,
        #FFF,
        #FFF 2px,
        transparent 0,
        transparent ${percentage}%
      ) no-repeat,
        repeating-linear-gradient(
        90deg,
        #FFF,
        #FFF 2px,
        transparent 0,
        transparent ${percentage / 2}%
      ) 100% no-repeat,
        repeating-linear-gradient(
        90deg,
        #FFF,
        #FFF 2px,
        transparent 0,
        transparent ${(percentage / 2) / 5}%
      ) 100% no-repeat
    `,
    backgroundSize: '100% 50%, 100% 25%, 100% 13%',
    backgroundPosition: '0 100%'
  };
};


TimelineRuler.propTypes = {
  roundDuration: PropTypes.number.isRequired
};

export default function TimelineRuler({roundDuration}) {
  const style = getRulerStyles(roundDuration);

  return (
    <div className="timeline-ruler" style={style}></div>
  );
}
