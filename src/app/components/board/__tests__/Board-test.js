'use strict';

import { fromJS } from 'immutable';
import { shallowComp, mountComp } from '__tests__/helpers';
import expect from 'expect';
import { Board } from '../Board';


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
      output.find('Marker').first().simulate('click', event);
    });
  
  });
  

});
