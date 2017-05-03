import React, { PropTypes } from 'react';

TimelineMarkers.propTypes = {
  pos: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  id:  PropTypes.number.isRequired
};

const markerWidth = 1;
const timelinePadding = 1;

export default function TimelineMarkers({pos, top, id}) {

  const left = `calc((${pos}% - ${markerWidth}rem / 2) - ${timelinePadding}rem)`;

  return (
    <div className="timeline-marker" style={{left: left, top: `${top}%`}}>
      <span>{id}</span>
    </div>
  );
}
