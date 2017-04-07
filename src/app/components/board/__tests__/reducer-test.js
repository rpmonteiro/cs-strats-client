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
    markers: {
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
    markers: {
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
    expect(initialState.get('markers').size).toEqual(0);
    expect(initialState.get('roundTime')).toEqual(87);
    expect(initialState.get('previewLine')).toEqual(false);
  });
  
  
  describe('ADD_MARKER', () => {
  
    it('should add a new marker', () => {
      const initialState = reducer();
      expect(initialState.get('markers').size).toEqual(0);
      
      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      
      expect(state.get('markers').size).toEqual(1);
      expect(state.getIn(['markers', '1']).toJS()).toEqual({
        id: 1,
        x: 500,
        y: 500,
        time: 87,
        paths: []
      });
    });
    
    
    it('should add a new marker', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('markers').size).toEqual(3);
      
      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      expect(state.get('markers').size).toEqual(4);
      expect(state.getIn(['markers', '4']).toJS()).toEqual({
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
      
      const initMarker = initialState.getIn(['markers', '1']);
      expect(initMarker.get('x')).toEqual(300);
      expect(initMarker.get('y')).toEqual(300);
      
      const actionData = { id: 1, x: 500, y: 500 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '1']);
      expect(marker.get('x')).toEqual(500);
      expect(marker.get('y')).toEqual(500);
    });
    
    
    it('should update the coordinates and time of adjacent path', () => {
      const initialState = reducer(simpleState);
      
      const initPath = initialState.getIn(['markers', '1', 'paths']);
      expect(initPath.getIn([0, 'x1'])).toEqual(300);
      expect(initPath.getIn([0, 'y1'])).toEqual(300);
      expect(initPath.getIn([0, 'time'])).toEqual(2);
      
      const actionData = { id: 1, x: 500, y: 500 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const path = state.getIn(['markers', '1', 'paths']);
      expect(path.getIn([0, 'x1'])).toEqual(500);
      expect(path.getIn([0, 'y1'])).toEqual(500);
      expect(path.getIn([0, 'time'])).toEqual(5);
    });
    
    
    it('should update the marker roundTime if new coords have different duration', () => {
      const initialState = reducer(simpleState);
      
      const initMarker = initialState.getIn(['markers', '1']);
      expect(initMarker.get('time')).toEqual(80);
      
      const actionData = { id: 1, x: 600, y: 600 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const marker = state.getIn(['markers', '1']);
      expect(marker.get('time')).toEqual(74);
    });
    
    
    it('should update the global roundTime if marker is the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const initMarker = initialState.getIn(['markers', '2']);
      expect(initMarker.get('time')).toEqual(65);
      
      const actionData = { id: 2, x: 1500, y: 1500 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const marker = state.getIn(['markers', '2']);
      expect(marker.get('time')).toEqual(31);
      expect(state.get('roundTime')).toEqual(31);
    });
    
    
    it('should not update roundTime if marker is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const initMarker = initialState.getIn(['markers', '1']);
      expect(initMarker.get('time')).toEqual(75);
      
      const actionData = { id: 2, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const marker = state.getIn(['markers', '2']);
      expect(marker.get('time')).toEqual(67);
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should update the time of the next paths', () => {
      const initialState = reducer(complexState);
      
      const initPaths = initialState.getIn(['markers', '2', 'paths']);
      expect(initPaths.getIn([0, 'time'])).toEqual(2);
      expect(initPaths.getIn([1, 'time'])).toEqual(10);
      expect(initPaths.getIn([2, 'time'])).toEqual(20);
      
      const actionData = { id: 2, x: 600, y: 600 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const paths = state.getIn(['markers', '2', 'paths']);
      expect(paths.getIn([0, 'time'])).toEqual(8);
      expect(paths.getIn([1, 'time'])).toEqual(16);
      expect(paths.getIn([2, 'time'])).toEqual(26);
    });
    
    
    it('should update the marker position even if it has no paths yet', () => {
      const initialState = reducer(complexState);
      
      const initMarker = initialState.getIn(['markers', '3']);
      expect(initMarker.get('paths').size).toEqual(0);
      expect(initMarker.get('time')).toEqual(87);
      expect(initMarker.get('x')).toEqual(600);
      expect(initMarker.get('y')).toEqual(600);
      
      const actionData = { id: 3, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));
      
      const marker = state.getIn(['markers', '3']);
      expect(marker.get('paths').size).toEqual(0);
      expect(marker.get('time')).toEqual(87);
      expect(marker.get('x')).toEqual(350);
      expect(marker.get('y')).toEqual(350);
    });
  
  });
  
  
  describe('ADD_NODE', () => {
  
    it('should add a node', () => {
      const initialState = reducer(simpleState);
      expect(initialState.getIn(['markers', '1', 'paths']).size).toEqual(2);
      expect(initialState.getIn(['previewLine', 'x1'])).toEqual(350);
      expect(initialState.getIn(['previewLine', 'y1'])).toEqual(600);
      expect(initialState.getIn(['previewLine', 'x2'])).toEqual(1000);
      expect(initialState.getIn(['previewLine', 'y2'])).toEqual(1000);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      
      expect(state.getIn(['markers', '1', 'paths']).size).toEqual(3);
      expect(state.getIn(['markers', '1', 'paths']).last().toJS()).toEqual({
        x1: 450,
        x2: 1000,
        y1: 600,
        y2: 1000,
        time: 22
      });
    });
    
    
    it('should update the roundTime if the marker is the furthest into the round', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('roundTime')).toEqual(80);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should update the marker time', () => {
      const initialState = reducer(simpleState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(80);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '1', 'time'])).toEqual(65);
    });
    
    
    it('should not update the roundTime if marker is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(75);
      expect(initialState.get('roundTime')).toEqual(65);
      
      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '1', 'time'])).toEqual(69);
      expect(state.get('roundTime')).toEqual(65);
    });
    
    
    it('should add the first node of a marker by using its original position', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '3', 'paths']).size).toEqual(0);
      
      const markerInitPos = initialState.getIn(['markers', '3']);
      
      const actionData = 3;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '3', 'paths']).size).toEqual(1);
      expect(state.getIn(['markers', '3', 'paths']).last().toJS()).toEqual({
        x1: markerInitPos.get('x'),
        x2: state.getIn(['previewLine', 'x2']),
        y1: markerInitPos.get('y'),
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
    
    
    it('should set the preview line with initial marker coords when no paths exist yet', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '3', 'x'])).toEqual(600);
      expect(initialState.getIn(['markers', '3', 'y'])).toEqual(600);
      
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
  
  // TODO: fix paths disappearing!
  describe('UPDATE_PATH', () => {
    
    const initialState = reducer(complexState);
    function makeSetup(markerId, pathIdx, actionData) {
      const state = reducer(initialState, actions.updatePath(actionData));
      const initPaths = initialState.getIn(['markers', markerId, 'paths']);
      const paths = state.getIn(['markers', markerId, 'paths']);
      
      return {
        initPath:     initialState.getIn(['markers', markerId, 'paths', pathIdx]),
        initMarker:   initialState.getIn(['markers', markerId]),
        initPrevPath: initPaths.get(pathIdx - 1),
        initNextPath: initPaths.get(pathIdx + 1),
        path:         state.getIn(['markers', markerId, 'paths', pathIdx]),
        marker:       state.getIn(['markers', markerId]),
        prevPath:     paths.get(pathIdx - 1),
        nextPath:     paths.get(pathIdx + 1),
        state,
        initialState
      };
    }
    
    
    describe('path with adjacent paths', () => {
    
      const markerId = '2';
      const pathIdx = 1;
      const actionData = { markerId, pathIdx, x: 500, y: 500 };
      
      it('should update its own coords and time', () => {
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 };
        expect(initPath.toJS()).toEqual(expectedInitPath);
        
        const expectedPath = {
          time: 7,
          x1: path.get('x1'),
          x2: actionData.x,
          y1: path.get('y1'),
          y2: actionData.y
        };
        expect(path.toJS()).toEqual(expectedPath);
      });
      
      
      it('should update the coords of the prev path', () => {
        const { initPrevPath, prevPath } = makeSetup(markerId, pathIdx, actionData);
        const expectedInitPrevPath = { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 };
        expect(initPrevPath.toJS()).toEqual(expectedInitPrevPath);

        const expectedPrevPath = { time: 2, x1: 300, x2: actionData.x, y1: 300, y2: actionData.y };
        expect(prevPath.toJS()).toEqual(expectedPrevPath);
      });
      
      
      it('should update the coords and time of the next path', () => {
        const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);
      
        const expectedInitPrevPath = { time: 20, x1: 350, x2: 450, y1: 350, y2: 600 };
        expect(initNextPath.toJS()).toEqual(expectedInitPrevPath);
      
        const expectedNextPath = { time: 12, x1: actionData.x, x2: 450, y1: actionData.y, y2: 600 };
        expect(nextPath.toJS()).toEqual(expectedNextPath);
      });
      
      
      it('should update the marker time', () => {
        const { initMarker, marker } = makeSetup(markerId, pathIdx, actionData);
        expect(initMarker.get('time')).toEqual(65);
        expect(marker.get('time')).toEqual(62);
      });
      
      
      it('should update the global round time if most forward marker', () => {
        const { state, initialState } = makeSetup(markerId, pathIdx, actionData);
        expect(initialState.get('roundTime')).toEqual(65);
        expect(state.get('roundTime')).toEqual(62);
      });

    });
    
    
    describe('update last path', () => {
      
      const markerId = '1';
      const pathIdx = 1;
      const actionData = { markerId, pathIdx, x: 200, y: 200 };
    
      it('should not update the global round time if not most forward marker ', () => {
        const { initialState, state } = makeSetup(markerId, pathIdx, actionData);
        
        expect(initialState.get('roundTime')).toEqual(65);
        expect(state.get('roundTime')).toEqual(65);
      });
      
      
      it('should update the path coords', () => {
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);
      
        const expectedInitPath = { time: 10, x1: 350, x2: 450, y1: 350, y2: 600 };
        expect(initPath.toJS()).toEqual(expectedInitPath);
      
        const expectedPath = {
          time: 7,
          x1: path.get('x1'),
          y1: path.get('y1'),
          x2: actionData.x,
          y2: actionData.y
        };
        expect(path.toJS()).toEqual(expectedPath);
      });
    });
    
    
    describe('update first path', () => {
      
      const markerId = '2';
      const pathIdx = 0;
      const actionData = { markerId, pathIdx, x: 700, y: 700 };
    
      it('should update the path coords and time', () => {
        const { initPath, path, marker } = makeSetup(markerId, pathIdx, actionData);
      
        const expectedInitPath = { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 };
        expect(initPath.toJS()).toEqual(expectedInitPath);
      
        const expectedPath = {
          time: 6,
          x1: marker.get('x'),
          y1: marker.get('y'),
          x2: actionData.x,
          y2: actionData.y
        };
        
        expect(path.toJS()).toEqual(expectedPath);
      });
      
      
      it('should update the nextPath coords and time', () => {
        const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);
      
        const expectedInitNextPath = { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 };
        expect(initNextPath.toJS()).toEqual(expectedInitNextPath);
      
        const expectedNextPath = { time: 12, x1: actionData.x, x2: 350, y1: actionData.y, y2: 350 };
        expect(nextPath.toJS()).toEqual(expectedNextPath);
      });
    
    });
    
    
  
  });
  
  
});
