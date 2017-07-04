'use strict';

import { fromJS }   from 'immutable';
import expect       from 'expect';
import * as actions from '../state/actions';
import reducer      from '../state/reducer';


describe('Board reducer', () => {

  const simpleState = fromJS({
    roundDuration: 87,
    roundTime: 5,
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
        time: 5,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 5, x1: 350, x2: 450, y1: 350, y2: 600 }
        ]
      }
    }
  });


  const complexState = fromJS({
    roundDuration: 87,
    roundTime: 74,
    previewLine: {
      x1: 450,
      y1: 600,
      x2: 650,
      y2: 750
    },
    markers: {
      1: {
        id: 1, x: 145, y: 453, time: 10,
        paths: [
          { time: 2, x1: 145, x2: 186, y1: 453, y2: 383 },
          { time: 10, x1: 186, x2: 516, y1: 383, y2: 465 }
        ]
      },
      2: {
        id: 2, x: 500, y: 500, time: 20,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 20, x1: 350, x2: 450, y1: 350, y2: 600 }
        ]
      },
      3: {
        id: 3, x: 600, y: 600, time: 0, paths: []
      },
      4: {
        id: 4, x: 146, y: 419, time: 5,
        paths: [
          { time: 5, x1: 146, x2: 270, y1: 419, y2: 228 }
        ]
      },
      5: {
        id: 5, x: 67, y: 449, time: 74,
        paths: [
          { time: 9, x1: 67, x2: 297, y1: 449, y2: 128 },
          { time: 15, x1: 297, x2: 550, y1: 128, y2: 207 },
          { time: 22, x1: 550, x2: 535, y1: 207, y2: 511 },
          { time: 32, x1: 535, x2: 102, y1: 511, y2: 507 },
          { time: 40, x1: 102, x2: 332, y1: 507, y2: 212 },
          { time: 44, x1: 332, x2: 519, y1: 212, y2: 277 },
          { time: 56, x1: 519, x2: 42, y1: 277, y2: 495 },
          { time: 62, x1: 42, x2: 98, y1: 495, y2: 231 },
          { time: 67, x1: 98, x2: 272, y1: 231, y2: 90 },
          { time: 74, x1: 272, x2: 599, y1: 90, y2: 166 }
        ]
      }
    }
  });


  it('should return the initial state', () => {
    const initialState = reducer();
    expect(initialState.get('roundDuration')).toEqual(87);
    expect(initialState.get('markers').size).toEqual(0);
    expect(initialState.get('roundTime')).toEqual(0);
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
        time: 0,
        paths: []
      });
    });


    it('should add a new marker', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('markers').size).toEqual(5);

      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      expect(state.get('markers').size).toEqual(6);
      expect(state.getIn(['markers', '6']).toJS()).toEqual({
        id: 6,
        x: 500,
        y: 500,
        time: 0,
        paths: []
      });
    });


    it('should not allow more than 10 markers', () => {
      let initialState = reducer(complexState);
      expect(initialState.get('markers').size).toEqual(5);

      const moreMarkers = {
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
        10: {}
      };

      initialState = initialState.mergeIn(['markers'], fromJS(moreMarkers));
      expect(initialState.get('markers').size).toEqual(10);

      const actionData = { x: 500, y: 500 };
      const state = reducer(initialState, actions.addMarker(actionData));
      expect(state.get('markers').size).toEqual(10);
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
      expect(initMarker.get('time')).toEqual(5);

      const actionData = { id: 1, x: 600, y: 600 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '1']);
      expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
    });


    it('should update the global roundTime if marker is the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(74);

      const initMarker = initialState.getIn(['markers', '2']);
      expect(initMarker.get('time')).toEqual(20);

      const actionData = { id: 2, x: 2300, y: 2300 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '2']);
      expect(marker.get('time')).toEqual(state.get('roundTime'));
      expect(state.get('roundTime')).toBeGreaterThan(initialState.get('roundTime'));
    });


    it('should not update roundTime if marker is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(74);

      const initMarker = initialState.getIn(['markers', '1']);
      expect(initMarker.get('time')).toEqual(10);

      const actionData = { id: 2, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '2']);
      expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
      expect(state.get('roundTime')).toEqual(74);
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
      expect(initMarker.get('time')).toEqual(0);
      expect(initMarker.get('x')).toEqual(600);
      expect(initMarker.get('y')).toEqual(600);

      const actionData = { id: 3, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '3']);
      expect(marker.get('paths').size).toEqual(initMarker.get('time'));
      expect(marker.get('time')).toEqual(initMarker.get('time'));
      expect(marker.get('x')).toEqual(350);
      expect(marker.get('y')).toEqual(350);
    });
  });


  describe('ADD_PATH', () => {

    it('should add a path', () => {
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
        time: 20
      });
    });


    it('should update the roundTime if the marker is the furthest into the round', () => {
      const initialState = reducer(simpleState);
      expect(initialState.get('roundTime')).toEqual(5);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.get('roundTime')).toEqual(20);
    });


    it('should update the marker time', () => {
      const initialState = reducer(simpleState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(5);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '1', 'time'])).toEqual(20);
    });


    it('should not update the roundTime if marker is not the furthest into the round', () => {
      const initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(10);
      expect(initialState.get('roundTime')).toEqual(74);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '1', 'time'])).toEqual(17);
      expect(state.get('roundTime')).toEqual(74);
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


    it('should not update the roundTime if new path duration wont make player the furthest', () => {
      const initialState = reducer(complexState);
      expect(initialState.get('roundTime')).toEqual(74);

      const actionData = 3;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.get('roundTime')).toEqual(74);
    });


    it('should update the roundTime if new path will make marker furthest in round', () => {
      let initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(10);
      expect(initialState.get('roundTime')).toEqual(74);

      const newPreviewLine = initialState.get('previewLine').merge({x2: 2750, y2: 2800});
      initialState = initialState.set('previewLine', newPreviewLine);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));

      const newMarkerTime = state.getIn(['markers', '1', 'time']);
      expect(newMarkerTime).toBeGreaterThan(initialState.get('roundTime'));
      expect(state.get('roundTime')).toEqual(newMarkerTime);
    });


    it('should not add a path if it goes past roundDuration', () => {
      let initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(10);
      expect(initialState.get('roundTime')).toEqual(74);

      initialState = initialState.withMutations(newState => {
        newState.setIn(['previewLine', 'x2'], 10000);
        newState.setIn(['previewLine', 'y2'], 10000);
      });

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));

      expect(state.getIn(['markers', '1', 'time'])).toEqual(initialState.getIn(['markers', '1', 'time']));
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


  describe('UPDATE_PATH', () => {

    const initialState = reducer(complexState);
    function makeSetup(markerId, pathIdx, actionData) {
      const state     = reducer(initialState, actions.updatePath(actionData));
      const initPaths = initialState.getIn(['markers', markerId, 'paths']);
      const paths     = state.getIn(['markers', markerId, 'paths']);

      return {
        initRoundTime: initialState.get('roundTime'),
        initPath:      initialState.getIn(['markers', markerId, 'paths', pathIdx]),
        initMarker:    initialState.getIn(['markers', markerId]),
        initPrevPath:  initPaths.get(pathIdx - 1),
        initNextPath:  initPaths.get(pathIdx + 1),
        roundTime:     state.get('roundTime'),
        path:          state.getIn(['markers', markerId, 'paths', pathIdx]),
        marker:        state.getIn(['markers', markerId]),
        prevPath:      paths.get(pathIdx - 1),
        nextPath:      paths.get(pathIdx + 1),
        state,
        initialState
      };
    }


    describe('path with adjacent paths', () => {

      const markerId = '5';
      const pathIdx = 5;

      it('should update its own coords and time - longer path', () => {
        const actionData = { markerId, pathIdx, x: 350, y: 250 };
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 44, x1: 332, x2: 519, y1: 212, y2: 277 };
        expect(initPath.toJS()).toEqual(expectedInitPath);
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeLessThan(initPath.get('time'));
      });


      it('should update the coords and time of the next path - shorter path', () => {
        const actionData = { markerId, pathIdx, x: 350, y: 250 };
        const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitNextPath = { time: 56, x1: 519, x2: 42, y1: 277, y2: 495 };
        expect(initNextPath.toJS()).toEqual(expectedInitNextPath);

        expect(nextPath.get('x1')).toEqual(actionData.x);
        expect(nextPath.get('y1')).toEqual(actionData.y);
        expect(nextPath.get('time')).toBeLessThan(initNextPath.get('time'));
      });


      it('should update the marker time - longer path', () => {
        const actionData = { markerId, pathIdx, x: 550, y: 300 };
        const { initMarker, marker } = makeSetup(markerId, pathIdx, actionData);
        expect(initMarker.get('time')).toEqual(74);
        expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
      });
    });


    describe('next path', () => {
      const markerId = '5';
      const pathIdx = 3;

      it('should update the x1/y1 set of coords', () => {
        const actionData = { markerId, pathIdx, x: 550, y: 300 };
        const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);

        expect(initNextPath.get('x1')).toEqual(102);
        expect(initNextPath.get('y1')).toEqual(507);

        expect(nextPath.get('x1')).toEqual(actionData.x);
        expect(nextPath.get('y1')).toEqual(actionData.y);
        expect(nextPath.get('x2')).toEqual(initNextPath.get('x2'));
        expect(nextPath.get('y2')).toEqual(initNextPath.get('y2'));
      });
    });


    describe('prev path', () => {
      
      const markerId = '5';
      const pathIdx = 3;

      it('should update the x2/y2 set of coords', () => {
        const actionData = { markerId, pathIdx, x: 550, y: 300 };
        const { initPrevPath, prevPath, path, marker } = makeSetup(markerId, pathIdx, actionData);

        expect(initPrevPath.get('x2')).toEqual(535)
        expect(initPrevPath.get('y2')).toEqual(511);
        expect(prevPath.get('x2')).toEqual(path.get('x1'));
        expect(prevPath.get('y2')).toEqual(path.get('y1'));
        expect(prevPath.get('x1')).toEqual(initPrevPath.get('x1'));
        expect(prevPath.get('y1')).toEqual(initPrevPath.get('y1')); 
      });
    });


    describe('update last path', () => {

      const markerId = '1';
      const pathIdx = 1;

      it('should not update the global round time if not most forward marker ', () => {
        const actionData = { markerId, pathIdx, x: 200, y: 200 };
        const { initialState, state } = makeSetup(markerId, pathIdx, actionData);

        expect(initialState.get('roundTime')).toEqual(74);
        expect(state.get('roundTime')).toEqual(74);
      });


      it('should update the path coords - longer path', () => {
        const actionData = { markerId, pathIdx, x: 650, y: 650 };
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 10, x1: 186, x2: 516, y1: 383, y2: 465 };
        expect(initPath.toJS()).toEqual(expectedInitPath);

        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeGreaterThan(initPath.get('time'));
      });


      it('should update the path coords - shorter path', () => {
        const actionData = { markerId, pathIdx, x: 200, y: 400 };
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 10, x1: 186, x2: 516, y1: 383, y2: 465 };
        expect(initPath.toJS()).toEqual(expectedInitPath);

        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeLessThan(initPath.get('time'));
      });
    });


    describe('update first path', () => {

      const markerId = '5';
      const pathIdx = 0;

      it('should update the path coords and time - shorter path', () => {
        const actionData = { markerId, pathIdx, x: 150, y: 300 };
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 9, x1: 67, x2: 297, y1: 449, y2: 128 };
        expect(initPath.toJS()).toEqual(expectedInitPath);

        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeLessThan(initPath.get('time'));
      });


      it('should update the nextPath coords and time - longer path', () => {
        const actionData = { markerId, pathIdx, x: 500, y: 50 };
        const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitNextPath = { time: 15, x1: 297, x2: 550, y1: 128, y2: 207 };
        expect(initNextPath.toJS()).toEqual(expectedInitNextPath);

        expect(nextPath.get('x1')).toEqual(actionData.x);
        expect(nextPath.get('y1')).toEqual(actionData.y);
        expect(nextPath.get('time')).toBeGreaterThan(initNextPath.get('time'));
      });
    });


    describe('updates roundTime and marker time', () => {

      it('should set time forward if path is longer and marker is the most forward', () => {
        const markerId = '5';
        const pathIdx = 2;
        const actionData = { markerId, pathIdx, x: 700, y: 700 };

        const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.toJS().time).toEqual(22);
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeGreaterThan(initPath.get('time'));

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(initRoundTime);

        expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
        expect(roundTime).toEqual(marker.get('time'));
      });


      it('should set time backward if path is shorter and marker is the most forward', () => {
        const markerId = '5';
        const pathIdx = 2;
        const actionData = { markerId, pathIdx, x: 600, y: 300 };

        const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.toJS().time).toEqual(22);
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeLessThan(initPath.get('time'));

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(initRoundTime);
        expect(marker.get('time')).toBeLessThan(initMarker.get('time'));
        expect(roundTime).toEqual(marker.get('time'));
      });


      it('should not update roundTime when marker is not the most forward - shorter path', () => {
        const markerId = '1';
        const pathIdx = 1;
        const actionData = { markerId, pathIdx, x: 350, y: 400 };

        const { initMarker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.toJS()).toEqual({ time: 10, x1: 186, x2: 516, y1: 383, y2: 465 });
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(10);
        expect(roundTime).toEqual(initRoundTime);
      });


      it('should only update marker time (longer path) if marker is not the most forward', () => {
        const markerId = '1';
        const pathIdx = 1;
        const actionData = { markerId, pathIdx, x: 650, y: 650 };

        const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.toJS()).toEqual({ time: 10, x1: 186, x2: 516, y1: 383, y2: 465 });
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeGreaterThan(initPath.get('time'));

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(10);

        expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
        expect(roundTime).toEqual(initRoundTime);
      });


      it('should update global time if marker becomes the most forward', () => {
        const markerId = '1';
        const pathIdx = 1;
        const actionData = { markerId, pathIdx, x: 3400, y: 1200 };

        const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.toJS()).toEqual({ time: 10, x1: 186, x2: 516, y1: 383, y2: 465 });
        expect(path.get('x2')).toEqual(actionData.x);
        expect(path.get('y2')).toEqual(actionData.y);
        expect(path.get('time')).toBeGreaterThan(initPath.get('time'));

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(10);

        expect(marker.get('time')).toBeGreaterThan(initRoundTime);
        expect(roundTime).toEqual(marker.get('time'));
      });


      it('should not update path if new path time goes past roundDuration', () => {
        const markerId = '5';
        const pathIdx = 5;
        const actionData = { markerId, pathIdx, x: 1000, y: 1000 };

        const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);

        expect(initPath.get('time')).toEqual(44);
        expect(path.get('time')).toEqual(initPath.get('time'));

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(74);

        expect(marker.get('time')).toEqual(initMarker.get('time'));
        expect(roundTime).toEqual(initRoundTime);
      });


      it('should increase the roundTime when extending last path', () => {
        const markerId = '5';
        const pathIdx = 9;
        const actionData = { markerId, pathIdx, x: 620, y: 200 };

        const { initMarker, marker, initRoundTime, roundTime } =
        makeSetup(markerId, pathIdx, actionData);

        expect(initRoundTime).toEqual(74);
        expect(initMarker.get('time')).toEqual(initRoundTime);
        expect(roundTime).toBeGreaterThan(initRoundTime);
        expect(marker.get('time')).toEqual(roundTime);
      });


      it('should correctly update the path time of the first path', () => {
        const markerId = '4';
        const pathIdx = 0;
        const actionData = { markerId, pathIdx, x: 250, y: 250 };

        const { initMarker, marker, initPath, path } =
        makeSetup(markerId, pathIdx, actionData);

        expect(initMarker.get('time')).toEqual(initPath.get('time'));
        expect(marker.get('time')).toEqual(path.get('time'));
        expect(marker.get('time')).toBeLessThan(initMarker.get('time'));
      });

    });


    describe('REMOVE_MARKER', () => {

      it('should set the roundTime to the 2nd mostForwardMarker', () => {
        const initialState = reducer(complexState);

        expect(initialState.get('roundTime')).toEqual(74);

        const actionData = 5;
        const state = reducer(initialState, actions.removeMarker(actionData));

        expect(state.getIn(['markers', '5'])).toNotExist();
        expect(state.get('roundTime')).toEqual(state.getIn(['markers', '2', 'time']));
      });


      it('should not change the roundTime if marker to delete is not the most forward', () => {
        const initialState = reducer(complexState);

        expect(initialState.get('roundTime')).toEqual(74);

        const actionData = 1;
        const state = reducer(initialState, actions.removeMarker(actionData));

        expect(state.getIn(['markers', '1'])).toNotExist();
        expect(state.get('roundTime')).toEqual(initialState.get('roundTime'));
      });


      it('should reset the roundTime to roundDuration if deleting the only marker', () => {
        const initialState = reducer(simpleState);
        expect(initialState.get('roundTime')).toEqual(5);

        const actionData = 1;
        const state = reducer(initialState, actions.removeMarker(actionData));

        expect(state.getIn(['markers', '1'])).toNotExist();
        expect(state.get('roundTime')).toEqual(0);
      });

    });

  });


  describe('ADD_INT_PATH', () => {

    it('should add an intermediary path with the coords given', () => {
      const initialState = reducer(simpleState);

      expect(initialState.getIn(['markers', '1', 'paths']).size).toEqual(2);

      const actionData = {
        markerId: '1',
        pathIdx: 0,
        x: 325,
        y: 400
      };

      const state = reducer(initialState, actions.addIntPath(actionData));
      expect(state.getIn(['markers', '1', 'paths']).size).toEqual(3);
    });


    it('should adjust the prev path coords/time', () => {
      const initialState = reducer(simpleState);

      const pKey = ['markers', '1', 'paths', 0];
      const initPrevP = initialState.getIn(pKey).toJS();

      expect(initPrevP.x2).toEqual(350);
      expect(initPrevP.y2).toEqual(350);
      expect(initPrevP.time).toEqual(2);

      const actionData = {
        markerId: '1',
        pathIdx: 0,
        x: 325,
        y: 400
      };

      const state = reducer(initialState, actions.addIntPath(actionData));

      const prevP = state.getIn(['markers', '1', 'paths', 0]).toJS();

      expect(prevP.x2).toEqual(actionData.x);
      expect(prevP.y2).toEqual(actionData.y);
      expect(prevP.time).toBeLessThan(initPrevP.time);
    });

  });


  describe('REMOVE_PATH', () => {

    it('should remove a path', () => {
      const initialState = reducer(simpleState);

      expect(initialState.getIn(['markers', '1', 'paths']).size).toEqual(2);

      const actionData = {
        markerId: '1',
        pathIdx: 0
      };

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(['markers', '1', 'paths']).size).toEqual(1);
    });


    it('should handle removing the only path', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '4',
        pathIdx: 0
      };

      const markerK = ['markers', actionData.markerId];

      const state = reducer(initialState, actions.removePath(actionData));
      const marker = state.getIn(markerK).toJS();

      expect(marker.paths.length).toEqual(0);
      expect(marker.time).toEqual(0);
    });


    it('should handle deleting the first path', () => {
      const initialState = reducer(simpleState);

      const actionData = {
        markerId: '1',
        pathIdx: 0
      };

      const markerK = ['markers', actionData.markerId];
      const pathsK = [...markerK, 'paths'];
      const pKey = [...pathsK, actionData.pathIdx];

      const initMarker = initialState.getIn(markerK).toJS();
      const initNextPath = initialState.getIn([...pathsK, actionData.pathIdx + 1]).toJS();
      expect(initialState.getIn(pathsK).size).toEqual(2);
      expect(initMarker.time).toEqual(5);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(pathsK).size).toEqual(1);

      const marker = state.getIn(markerK).toJS();
      const newPath = state.getIn(pKey).toJS();
      expect(newPath.x1).toEqual(marker.x);
      expect(newPath.x2).toEqual(initNextPath.x2);
      expect(newPath.y1).toEqual(marker.y);
      expect(newPath.y2).toEqual(initNextPath.y2);
      expect(marker.time).toEqual(7);
    });


    it('should update the marker time', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '2',
        pathIdx: 2
      };

      const markerK = ['markers', actionData.markerId];
      const pathsK = [...markerK, 'paths'];
      const pKey = [...pathsK, actionData.pathIdx];

      const initMarker = initialState.getIn(markerK).toJS();
      const pathToDel = initialState.getIn(pKey).toJS();
      const prevPath = initialState.getIn([...pKey.slice(0, 3), actionData.pathIdx - 1]).toJS();

      expect(initialState.getIn(pKey.slice(0, 3)).size).toEqual(3);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(pKey.slice(0, 3)).size).toEqual(2);

      const marker = state.getIn(markerK).toJS();
      const timeDiff = pathToDel.time - prevPath.time;

      expect(marker.time).toEqual(initMarker.time - timeDiff);
    });


    it('should handle deleting an intermediate path in the most forward marker and update roundTime', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '2',
        pathIdx: 1
      };

      const markerK = ['markers', actionData.markerId];
      const pathsK = [...markerK, 'paths'];
      const pKey = [...pathsK, actionData.pathIdx];

      const initNextPath = initialState.getIn([...pathsK, actionData.pathIdx + 1]).toJS();
      expect(initialState.getIn(pKey.slice(0, 3)).size).toEqual(3);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(pKey.slice(0, 3)).size).toEqual(2);

      const newPath = state.getIn(pKey).toJS();
      expect(newPath.x1).toEqual(initNextPath.x1);
      expect(newPath.x2).toEqual(initNextPath.x2);
      expect(newPath.y1).toEqual(initNextPath.y1);
      expect(newPath.y2).toEqual(initNextPath.y2);
    });


    it('should update the roundTime of the most forward marker', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '2',
        pathIdx: 1
      };

      const markerK = ['markers', actionData.markerId];
      const pathsK = [...markerK, 'paths'];

      expect(initialState.get('roundTime')).toEqual(74);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(pathsK).size).toEqual(2);
      expect(state.get('roundTime')).toBeLessThan(initialState.get('roundTime'));
    });


    it('should update all paths time after deleted path', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '5',
        pathIdx: 2
      };

      const markerK = ['markers', actionData.markerId];
      const pathsK = [...markerK, 'paths'];
      const firstPathTime = [... pathsK, 0, 'time'];
      const lastPathTime = [... pathsK, -1, 'time'];

      expect(initialState.getIn(firstPathTime)).toEqual(9);
      expect(initialState.getIn(lastPathTime)).toEqual(74);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(firstPathTime)).toEqual(9);
      expect(state.getIn(lastPathTime)).toBeLessThan(74);
      expect(state.get('roundTime')).toEqual(state.getIn(lastPathTime));
      expect(state.getIn([...markerK, 'time'])).toEqual(state.getIn(lastPathTime));
    });


    it('should update all paths time and roundTime after deleting path', () => {
      const initialState = reducer(complexState);

      const actionData = {
        markerId: '5',
        pathIdx: 7
      };

      const markerK = ['markers', actionData.markerId];
      const initPrevPath = initialState.getIn([...markerK, 'paths', actionData.pathIdx - 1]);
      expect(initPrevPath.get('time')).toEqual(56);

      const initNextPath = initialState.getIn([...markerK, 'paths', actionData.pathIdx + 1]);
      expect(initNextPath.get('time')).toEqual(67);
      expect(initialState.get('roundTime')).toEqual(initialState.getIn([... markerK, 'time']));

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.get('roundTime')).toEqual(state.getIn([... markerK, 'time']));
    });
  });
});
