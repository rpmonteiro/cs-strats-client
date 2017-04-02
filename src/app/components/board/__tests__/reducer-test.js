'use strict';

import { fromJS }   from 'immutable';
import expect       from 'expect';
import * as actions from '../state/actions';
import reducer      from '../state/reducer';


describe('Board reducer', () => {
  
  
  const simpleState = fromJS({
    roundDuration: 87,
    roundTime: 80,
    previewLine: {
      x1: 350,
      y1: 600,
      x2: 1000,
      y2: 1000
    },
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
    previewLine: {
      x1: 450,
      y1: 600,
      x2: 650,
      y2: 750
    },
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
    
    
    it('should update the marker position even if it has no paths yet', () => {
      const initialState = reducer(complexState);
      
      const initPlayer = initialState.getIn(['players', '3']);
      expect(initPlayer.get('paths').size).toEqual(0);
      expect(initPlayer.get('time')).toEqual(87);
      expect(initPlayer.get('x')).toEqual(600);
      expect(initPlayer.get('y')).toEqual(600);
      
      const actionData = { id: 3, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const player = state.getIn(['players', '3']);
      expect(player.get('paths').size).toEqual(0);
      expect(player.get('time')).toEqual(87);
      expect(player.get('x')).toEqual(350);
      expect(player.get('y')).toEqual(350);
    });
  
  });
  
  
  describe('ADD_NODE', () => {
  
    it('should add a node', () => {
      const initialState = reducer(simpleState);
      expect(initialState.getIn(['players', '1', 'paths']).size).toEqual(2);
      expect(initialState.getIn(['previewLine', 'x1'])).toEqual(350);
      expect(initialState.getIn(['previewLine', 'y1'])).toEqual(600);
      expect(initialState.getIn(['previewLine', 'x2'])).toEqual(1000);
      expect(initialState.getIn(['previewLine', 'y2'])).toEqual(1000);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addNode(actionData));
      
      expect(state.getIn(['players', '1', 'paths']).size).toEqual(3);
      expect(state.getIn(['players', '1', 'paths']).last().toJS()).toEqual({
        x1: 450,
        x2: 1000,
        y1: 600,
        y2: 1000,
        time: 22
      });
    });
    
    
    it('should update the roundTime if the player is the furthest into the round', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('roundTime')).toEqual(80);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addNode(actionData));
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should update the player time', () => {
      const initialState = reducer(simpleState);
      expect(initialState.getIn(['players', '1', 'time'])).toEqual(80);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addNode(actionData));
      expect(state.getIn(['players', '1', 'time'])).toEqual(65);
    });
    
    
    it('should not update the roundTime if player is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['players', '1', 'time'])).toEqual(75);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addNode(actionData));
      expect(state.getIn(['players', '1', 'time'])).toEqual(69);
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should add the first node of a player by using its original position', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['players', '3', 'paths']).size).toEqual(0);
      
      const playerInitPos = initialState.getIn(['players', '3']);
      
      const actionData = 3;
      const state = reducer(initialState, actions.addNode(actionData));
      expect(state.getIn(['players', '3', 'paths']).size).toEqual(1);
      expect(state.getIn(['players', '3', 'paths']).last().toJS()).toEqual({
        x1: playerInitPos.get('x'),
        x2: state.getIn(['previewLine', 'x2']),
        y1: playerInitPos.get('y'),
        y2: state.getIn(['previewLine', 'y2']),
        time: 4
      });
    });
  
  });
  
  
  describe('SET_PREVIEW_LINE', () => {
  
    it('should set the preview line with previous node coords', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('previewLine').toJS()).toEqual({
        x1: 350, y1: 600, x2: 1000, y2: 1000
      });
      
      const actionData = 1;
      const state = reducer(initialState, actions.setPreviewLine(actionData));
      
      expect(state.get('previewLine').toJS()).toEqual({
        x1: 450, x2: 450, y1: 600, y2: 600
      });
    });
    
    
    it('should set the preview line with initial player coords when no paths exist yet', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['players', '3', 'x'])).toEqual(600);
      expect(initialState.getIn(['players', '3', 'y'])).toEqual(600);
      
      const actionData = 3;
      const state = reducer(initialState, actions.setPreviewLine(actionData));
      expect(state.get('previewLine').toJS()).toEqual({
        x1: 600, x2: 600, y1: 600, y2: 600
      });
    });
  
  });
  
  
  describe('UPDATE_PREVIEW_LINE', () => {
  
    it('should update the previewLine coords', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('previewLine').toJS()).toEqual({
        x1: 350, y1: 600, x2: 1000, y2: 1000
      });
      
      const actionData = { x: 100, y: 100 };
      const state = reducer(initialState, actions.updatePreviewLine(actionData));
      expect(state.get('previewLine').toJS()).toEqual({
        x1: 350, x2: 100, y1: 600, y2: 100
      });
    });
  
  });
  
  
  describe('RESET_PREVIEW_LINE', () => {
  
    it('should set previewLine to false', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('previewLine').toJS()).toEqual({
        x1: 350, y1: 600, x2: 1000, y2: 1000
      });
      
      const state = reducer(initialState, actions.resetPreviewLine());
      expect(state.get('previewLine')).toEqual(false);
    });
  
  });
  
  
});
