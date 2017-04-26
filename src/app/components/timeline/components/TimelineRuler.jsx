import React, { PropTypes, PureComponent } from 'react';


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


export default class MyComponent extends PureComponent {

  static propTypes = {
    roundDuration: PropTypes.number.isRequired
  }

  render() {
    const style = getRulerStyles(this.props.roundDuration);

    return (
      <div style={style} className="timeline-ruler"></div>
    );
  }
}
