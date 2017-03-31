import React, { PropTypes } from 'react';


PreviewPath.propTypes = {
  coords: PropTypes.object.isRequired
};


export default function PreviewPath({coords}) {

  return (
    <svg>
      <line
        x1={coords.get('x1')}
        x2={coords.get('x2')}
        y1={coords.get('y1')}
        y2={coords.get('y2')}
        stroke="red"
        strokeWidth={3}
      />
    </svg>
  );
}
