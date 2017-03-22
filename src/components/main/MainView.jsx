import React, { PropTypes, PureComponent } from 'react';
import src from '../../images/de_inferno.jpg';



export default class MainView extends PureComponent {
  
  render() {
    return (
      <div id="main-container">
        <img src={src}></img>
        <div>Hello world</div>
      </div>
    );
  }
}
