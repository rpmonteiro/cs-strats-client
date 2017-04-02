'use strict';

import { fromJS }   from 'immutable';
import expect       from 'expect';
import * as actions from '../state/actions';
import reducer      from '../state/reducer';


describe('Board reducer', () => {
  
  
  const simpleState = fromJS({
    roundDuration: 87,
    roundTime: 80,
    previewLine: false,
    players: {
      1: {
        id: 1,
        x: 300,
        y: 300,
        time: 80,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 5, x1: 350, x2: 450, y1: 350, y2: 600 }
        ]
      }
    }
  });
  
  
  const complexState = fromJS({
    roundDuration: 87,
    roundTime: 65,
    previewLine: false,
    players: {
      1: {
        id: 1,
        x: 300,
        y: 300,
        time: 75,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 10, x1: 350, x2: 450, y1: 350, y2: 600 }
        ]
      },
      2: {
        id: 2,
        x: 500,
        y: 500,
        time: 65,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 20, x1: 350, x2: 450, y1: 350, y2: 600 }
        ]
      },
      3: {
        id: 1,
        x: 600,
        y: 600,
        time: 87,
        paths: []
      }
    }
  });
  
  
  it('should return the initial state', () => {
    const initialState = reducer();
    expect(initialState.get('roundDuration')).toEqual(87);
    expect(initialState.get('players').size).toEqual(0);
    expect(initialState.get('roundTime')).toEqual(87);
    expect(initialState.get('previewLine')).toEqual(false);
  });
  
  
  describe('ADD_MARKER', () => {
  
    it('should add a new marker', () => {
      const initialState = reducer();
      expect(initialState.get('players').size).toEqual(0);
      
      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      
      expect(state.get('players').size).toEqual(1);
      expect(state.getIn(['players', '1']).toJS()).toEqual({
        id: 1,
        x: 500,
        y: 500,
        time: 87,
        paths: []
      });
    });
    
    
    it('should add a new marker', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('players').size).toEqual(3);
      
      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      expect(state.get('players').size).toEqual(4);
      expect(state.getIn(['players', '4']).toJS()).toEqual({
        id: 4,
        x: 500,
        y: 500,
        time: 87,
        paths: []
      });
    });
  
  });
  
  
  describe('UPDATE_MARKER', () => {
  
    it('should update the marker position', () => {
      const initialState = reducer(simpleState);
      
      const initPlayer = initialState.getIn(['players', '1']);
      expect(initPlayer.get('x')).toEqual(300);
      expect(initPlayer.get('y')).toEqual(300);
      
      const actionData = { id: 1, x: 500, y: 500 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const player = state.getIn(['players', '1']);
      expect(player.get('x')).toEqual(500);
      expect(player.get('y')).toEqual(500);
    });
    
    
    it('should update the coordinates and time of adjacent path', () => {
      const initialState = reducer(simpleState);
      
      const initPath = initialState.getIn(['players', '1', 'paths']);
      expect(initPath.getIn([0, 'x1'])).toEqual(300);
      expect(initPath.getIn([0, 'y1'])).toEqual(300);
      expect(initPath.getIn([0, 'time'])).toEqual(2);
      
      const actionData = { id: 1, x: 500, y: 500 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const path = state.getIn(['players', '1', 'paths']);
      expect(path.getIn([0, 'x1'])).toEqual(500);
      expect(path.getIn([0, 'y1'])).toEqual(500);
      expect(path.getIn([0, 'time'])).toEqual(5);
    });
    
    
    it('should update the player roundTime if new coords have different duration', () => {
      const initialState = reducer(simpleState);
      
      const initPlayer = initialState.getIn(['players', '1']);
      expect(initPlayer.get('time')).toEqual(80);
      
      const actionData = { id: 1, x: 600, y: 600 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const player = state.getIn(['players', '1']);
      expect(player.get('time')).toEqual(74);
    });
    
    
    it('should update the global roundTime if player is the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const initPlayer = initialState.getIn(['players', '2']);
      expect(initPlayer.get('time')).toEqual(65);
      
      const actionData = { id: 2, x: 1500, y: 1500 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const player = state.getIn(['players', '2']);
      expect(player.get('time')).toEqual(31);
      expect(state.get('roundTime')).toEqual(31);
    });
    
    
    it('should not update roundTime if player is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const initPlayer = initialState.getIn(['players', '1']);
      expect(initPlayer.get('time')).toEqual(75);
      
      const actionData = { id: 2, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const player = state.getIn(['players', '2']);
      expect(player.get('time')).toEqual(67);
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should update the time of the next paths', () => {
      const initialState = reducer(complexState);
      
      const initPaths = initialState.getIn(['players', '2', 'paths']);
      expect(initPaths.getIn([0, 'time'])).toEqual(2);
      expect(initPaths.getIn([1, 'time'])).toEqual(10);
      expect(initPaths.getIn([2, 'time'])).toEqual(20);
      
      const actionData = { id: 2, x: 600, y: 600 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const paths = state.getIn(['players', '2', 'paths']);
      expect(paths.getIn([0, 'time'])).toEqual(8);
      expect(paths.getIn([1, 'time'])).toEqual(16);
      expect(paths.getIn([2, 'time'])).toEqual(26);
    });
  
  });
  
  
  describe('ADD_NODE', () => {
  
    it('should ', () => {
      
    });
  
  });
  
  
});
