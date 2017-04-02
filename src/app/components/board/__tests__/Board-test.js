'use strict';

import { fromJS } from 'immutable';
import { shallowComp, mountComp } from '__tests__/helpers';
import expect from 'expect';
import { Board } from '../Board';

import {
  addMarker,
  addNode,
  updateMarker,
  updateNode,
  setPreviewLine,
  updatePreviewLine,
  resetPreviewLine
} from '../state/actions';


describe('Board', () => {
  
  let props;
  beforeEach(() => {
    props = {
      dispatch: () => {},
      roundTime: 75,
      previewLine: fromJS({
        x1: 500,
        x2: 800,
        y1: 500,
        y2: 800
      }),
      players: fromJS({
        1: {
          id: 1,
          x: 400,
          y: 400,
          time: 87,
          paths: []
        },
        2: {
          id: 2,
          x: 100,
          y: 100,
          time: 75,
          paths: [
            {
              time: 2,
              x1: 300,
              y1: 200,
              x2: 350,
              y2: 250
            },
            {
              time: 12,
              x1: 500,
              y1: 500,
              x2: 550,
              y2: 500
            }
          ]
        }
      })
    };
  });


  it('should render something', () => {
    const { output } = shallowComp(Board, props);
    expect(output.find('.board').length).toEqual(1);
    expect(output.find('.paths').length).toEqual(1);
    expect(output.find('.map').length).toEqual(1);
    expect(output.find('.round-time').length).toEqual(1);
  });
  
  
  it('should render a marker per player', () => {
    expect(props.players.size).toEqual(2);
    const { output } = shallowComp(Board, props);
    expect(output.find('Marker').length).toEqual(2);
  });
  
  
  describe('Marker mouseDownHandler', () => {
  
    it('should set clicked marker to active', () => {
      const { output } = shallowComp(Board, props);
      expect(output.state().activeMarkerId).toEqual('');
      
      const event = { target: { dataset: { id: 1 } }, stopPropagation: () => {} };
      output.instance().markerClickHandler(event);
      expect(output.state().activeMarkerId).toEqual(1);
    });
    
    
    it('should remove active marker if click on active marker', () => {
      const { output } = shallowComp(Board, props);
      output.setState({activeMarkerId: 2});
      expect(output.state().activeMarkerId).toEqual(2);
      
      const event = { target: { dataset: { id: 1 } }, stopPropagation: () => {} };
      output.instance().markerClickHandler(event);
      expect(output.state().activeMarkerId).toEqual('');
    });
    
    
    it('should stop marker drag if is dragging', () => {
      const { output } = shallowComp(Board, props);
      output.setState({draggingMarkerId: 2});
      expect(output.state().draggingMarkerId).toEqual(2);
      
      const event = { target: { dataset: { id: 1 } }, stopPropagation: () => {} };
      output.instance().markerClickHandler(event);
      expect(output.state().draggingMarkerId).toEqual('');
    });
    
    
    it('should dispatch setPreviewLine with markerId if marker becomes active', () => {
      const spy = expect.spyOn(props, 'dispatch');
      const { output } = shallowComp(Board, props);
      expect(output.state().activeMarkerId).toEqual('');
      
      const markerId = 1;
      const event = { target: { dataset: { id: markerId } }, stopPropagation: () => {} };
      
      expect(spy).toNotHaveBeenCalled();
      output.instance().markerClickHandler(event);
      expect(output.state().activeMarkerId).toEqual(markerId);
      expect(spy).toHaveBeenCalledWith(setPreviewLine(markerId));
    });
  
  });
  

});
