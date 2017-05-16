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
    roundTime: 72,
    previewLine: {
      x1: 450,
      y1: 600,
      x2: 650,
      y2: 750
    },
    markers: {
      1: {
        id: 1, x: 300, y: 300, time: 10,
        paths: [
          { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 },
          { time: 10, x1: 350, x2: 450, y1: 350, y2: 600 }
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
        id: 4, x: 150, y: 150, time: 5,
        paths: [
          { time: 5, x1: 300, x2: 360, y1: 400, y2: 480 }
        ]
      },
      5: {
        id: 5, x: 100, y: 100, time: 72,
        paths: [
          { time: 2, x1: 150, x2: 300, y1: 150, y2: 300 },
          { time: 10, x1: 300, x2: 550, y1: 300, y2: 120 },
          { time: 22, x1: 550, x2: 1000, y1: 120, y2: 650 },
          { time: 30, x1: 1000, x2: 220, y1: 650, y2: 300 },
          { time: 37, x1: 220, x2: 420, y1: 300, y2: 50},
          { time: 46, x1: 420, x2: 10, y1: 50, y2: 740},
          { time: 60, x1: 10, x2: 1000, y1: 740, y2: 330},
          { time: 67, x1: 1000, x2: 750, y1: 330, y2: 620},
          { time: 72, x1: 750, x2: 120, y1: 620, y2: 80}
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
        time: 87,
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
        time: 87,
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
      expect(initialState.get('roundTime')).toEqual(72);

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
      expect(initialState.get('roundTime')).toEqual(72);

      const initMarker = initialState.getIn(['markers', '1']);
      expect(initMarker.get('time')).toEqual(10);

      const actionData = { id: 2, x: 350, y: 350 };
      const state = reducer(initialState, actions.updateMarker(actionData));

      const marker = state.getIn(['markers', '2']);
      expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
      expect(state.get('roundTime')).toEqual(72);
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
      expect(initialState.get('roundTime')).toEqual(72);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.getIn(['markers', '1', 'time'])).toEqual(16);
      expect(state.get('roundTime')).toEqual(72);
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
      expect(initialState.get('roundTime')).toEqual(72);

      const actionData = 3;
      const state = reducer(initialState, actions.addPath(actionData));
      expect(state.get('roundTime')).toEqual(72);
    });


    it('should update the roundTime if new path will make marker the furthest in the round', () => {
      let initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(10);
      expect(initialState.get('roundTime')).toEqual(72);

      initialState = initialState.setIn(['previewLine', 'x2'], 2800);
      initialState = initialState.setIn(['previewLine', 'y2'], 2800);

      const actionData = 1;
      const state = reducer(initialState, actions.addPath(actionData));

      expect(state.getIn(['markers', '1', 'time'])).toEqual(82);
      expect(state.get('roundTime')).toEqual(82);
    });


    it('should not add a path if it goes past roundDuration', () => {
      let initialState = reducer(complexState);
      expect(initialState.getIn(['markers', '1', 'time'])).toEqual(10);
      expect(initialState.get('roundTime')).toEqual(72);

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

      const markerId = '2';
      const pathIdx = 1;
      const actionData = { markerId, pathIdx, x: 500, y: 500 };

      it('should update its own coords and time', () => {
        const { initPath, path } = makeSetup(markerId, pathIdx, actionData);

        const expectedInitPath = { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 };
        expect(initPath.toJS()).toEqual(expectedInitPath);

        const expectedPath = {
          time: 13,
          x1: expectedInitPath.x2,
          x2: actionData.x,
          y1: expectedInitPath.y2,
          y2: actionData.y
        };
        expect(path.toJS()).toEqual(expectedPath);
      });


      // it('should update the coords and time of the next path', () => {
      //   const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);
      //
      //   const expectedInitPrevPath = { time: 20, x1: 350, x2: 450, y1: 350, y2: 600 };
      //   expect(initNextPath.toJS()).toEqual(expectedInitPrevPath);
      //
      //   const expectedNextPath = { time: 12, x1: actionData.x, x2: 450, y1: actionData.y, y2: 600 };
      //   expect(nextPath.toJS()).toEqual(expectedNextPath);
      // });


      // it('should update the marker time', () => {
      //   const { initMarker, marker } = makeSetup(markerId, pathIdx, actionData);
      //   expect(initMarker.get('time')).toEqual(20);
      //   expect(marker.get('time')).toNotEqual(initMarker.get('time'));
      // });
    });


    describe('update last path', () => {

      const markerId = '1';
      const pathIdx = 1;
      const actionData = { markerId, pathIdx, x: 200, y: 200 };

      // it('should not update the global round time if not most forward marker ', () => {
      //   const { initialState, state } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initialState.get('roundTime')).toEqual(72);
      //   expect(state.get('roundTime')).toEqual(72);
      // });


      // it('should update the path coords', () => {
      //   const { initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   const expectedInitPath = { time: 10, x1: 350, x2: 450, y1: 350, y2: 600 };
      //   expect(initPath.toJS()).toEqual(expectedInitPath);
      //
      //   const expectedPath = {
      //     time: 7,
      //     x1: path.get('x1'),
      //     y1: path.get('y1'),
      //     x2: actionData.x,
      //     y2: actionData.y
      //   };
      //   expect(path.toJS()).toEqual(expectedPath);
      // });
    });


    // describe('update first path', () => {
    //
    //   const markerId = '2';
    //   const pathIdx = 0;
    //   const actionData = { markerId, pathIdx, x: 700, y: 700 };
    //
    //   it('should update the path coords and time', () => {
    //     const { initPath, path, marker } = makeSetup(markerId, pathIdx, actionData);
    //
    //     const expectedInitPath = { time: 2, x1: 300, x2: 350, y1: 300, y2: 350 };
    //     expect(initPath.toJS()).toEqual(expectedInitPath);
    //
    //     const expectedPath = {
    //       time: 6,
    //       x1: marker.get('x'),
    //       y1: marker.get('y'),
    //       x2: actionData.x,
    //       y2: actionData.y
    //     };
    //
    //     expect(path.toJS()).toEqual(expectedPath);
    //   });
    //
    //
    //   it('should update the nextPath coords and time', () => {
    //     const { initNextPath, nextPath } = makeSetup(markerId, pathIdx, actionData);
    //
    //     const expectedInitNextPath = { time: 10, x1: 300, x2: 350, y1: 300, y2: 350 };
    //     expect(initNextPath.toJS()).toEqual(expectedInitNextPath);
    //
    //     const expectedNextPath = { time: 12, x1: actionData.x, x2: 350, y1: actionData.y, y2: 350 };
    //     expect(nextPath.toJS()).toEqual(expectedNextPath);
    //   });
    // });


    describe('updates roundTime and marker time', () => {

      // it('should set time forward if path is longer and marker is the most forward', () => {
      //   const markerId = '5';
      //   const pathIdx = 2;
      //   const actionData = { markerId, pathIdx, x: 2300, y: 2300 };
      //
      //   const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initPath.toJS()).toEqual({ time: 22, x1: 550, x2: 1000, y1: 120, y2: 650 });
      //   expect(path.get('x2')).toEqual(2300);
      //   expect(path.get('y2')).toEqual(2300);
      //   expect(path.get('time')).toBeGreaterThan(initPath.get('time'));
      //
      //   expect(initRoundTime).toEqual(72);
      //   expect(initMarker.get('time')).toEqual(initRoundTime);
      //
      //   expect(marker.get('time')).toBeLessThan(initMarker.get('time'));
      //   expect(roundTime).toEqual(marker.get('time'));
      // });
      //
      //
      // it('should set time backward if path is shorter and marker is the most forward', () => {
      //   const markerId = '5';
      //   const pathIdx = 2;
      //   const actionData = { markerId, pathIdx, x: 440, y: 590 };
      //
      //   const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initPath.toJS()).toEqual({ time: 22, x1: 550, x2: 1000, y1: 120, y2: 650 });
      //   expect(path.get('x2')).toEqual(actionData.x);
      //   expect(path.get('y2')).toEqual(actionData.y);
      //   expect(path.get('time')).toBeLessThan(initPath.get('time'));
      //
      //   expect(initRoundTime).toEqual(72);
      //   expect(initMarker.get('time')).toEqual(initRoundTime);
      //
      //   expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
      //   expect(roundTime).toEqual(marker.get('time'));
      // });
      //
      //
      // it('should only update marker time (shorter path) if marker is not the most forward', () => {
      //   const markerId = '1';
      //   const pathIdx = 1;
      //   const actionData = { markerId, pathIdx, x: 440, y: 590 };
      //
      //   const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initPath.toJS()).toEqual({ time: 10, x1: 350, x2: 450, y1: 350, y2: 600 });
      //   expect(path.get('x2')).toEqual(actionData.x);
      //   expect(path.get('y2')).toEqual(actionData.y);
      //   expect(path.get('time')).toBeLessThan(initPath.get('time'));
      //
      //   expect(initRoundTime).toEqual(72);
      //   expect(initMarker.get('time')).toEqual(10);
      //
      //   expect(marker.get('time')).toBeLessThan(initMarker.get('time'));
      //   expect(roundTime).toEqual(initRoundTime);
      // });


      // it('should only update marker time (longer path) if marker is not the most forward', () => {
      //   const markerId = '1';
      //   const pathIdx = 1;
      //   const actionData = { markerId, pathIdx, x: 650, y: 650 };
      //
      //   const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initPath.toJS()).toEqual({ time: 10, x1: 350, x2: 450, y1: 350, y2: 600 });
      //   expect(path.get('x2')).toEqual(actionData.x);
      //   expect(path.get('y2')).toEqual(actionData.y);
      //   expect(path.get('time')).toBeGreaterThan(initPath.get('time'));
      //
      //   expect(initRoundTime).toEqual(72);
      //   expect(initMarker.get('time')).toEqual(10);
      //
      //   expect(marker.get('time')).toBeGreaterThan(initMarker.get('time'));
      //   expect(roundTime).toEqual(initRoundTime);
      // });
      //
      //
      // it('should update global time if marker becomes the most forward', () => {
      //   const markerId = '1';
      //   const pathIdx = 1;
      //   const actionData = { markerId, pathIdx, x: 10000, y: 1200 };
      //
      //   const { initMarker, marker, initRoundTime, roundTime, initPath, path } = makeSetup(markerId, pathIdx, actionData);
      //
      //   expect(initPath.toJS()).toEqual({ time: 10, x1: 350, x2: 450, y1: 350, y2: 600 });
      //   expect(path.get('x2')).toEqual(actionData.x);
      //   expect(path.get('y2')).toEqual(actionData.y);
      //   expect(path.get('time')).toBeGreaterThan(initPath.get('time'));
      //
      //   expect(initRoundTime).toEqual(72);
      //   expect(initMarker.get('time')).toEqual(75);
      //
      //   expect(marker.get('time')).toBeLessThan(initRoundTime);
      //   expect(roundTime).toBeLessThan(initRoundTime);
      // });

    });


    describe('REMOVE_MARKER', () => {

    //   it('should set the roundTime to the 2nd mostForwardMarker', () => {
    //     const initialState = reducer(complexState);
    //
    //     expect(initialState.get('roundTime')).toEqual(72);
    //
    //     const actionData = 5;
    //     const state = reducer(initialState, actions.removeMarker(actionData));
    //
    //     expect(state.getIn(['markers', '5'])).toNotExist();
    //     expect(state.get('roundTime')).toEqual(state.getIn(['markers', '2', 'time']));
    //   });
    //
    //
    //   it('should not change the roundTime if marker to delete is not the most forward', () => {
    //     const initialState = reducer(complexState);
    //
    //     expect(initialState.get('roundTime')).toEqual(72);
    //
    //     const actionData = 1;
    //     const state = reducer(initialState, actions.removeMarker(actionData));
    //
    //     expect(state.getIn(['markers', '1'])).toNotExist();
    //     expect(state.get('roundTime')).toEqual(initialState.get('roundTime'));
    //   });
    //
    //
    //   it('should reset the roundTime to roundDuration if deleting the only marker', () => {
    //     const initialState = reducer(simpleState);
    //
    //     expect(initialState.get('roundTime')).toEqual(80);
    //
    //     const actionData = 1;
    //     const state = reducer(initialState, actions.removeMarker(actionData));
    //
    //     expect(state.getIn(['markers', '1'])).toNotExist();
    //     expect(state.get('roundTime')).toEqual(initialState.get('roundDuration'));
    //   });
    //
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
      const roundDuration = initialState.get('roundDuration');

      const actionData = {
        markerId: '4',
        pathIdx: 0
      };

      const markerK = ['markers', actionData.markerId];

      const state = reducer(initialState, actions.removePath(actionData));
      const marker = state.getIn(markerK).toJS();

      expect(marker.paths.length).toEqual(0);
      expect(marker.time).toEqual(roundDuration);
    });


    // it('should handle deleting the first path', () => {
    //   const initialState = reducer(simpleState);
    //
    //   const actionData = {
    //     markerId: '1',
    //     pathIdx: 0
    //   };
    //
    //   const markerK = ['markers', actionData.markerId];
    //   const pathsK = [...markerK, 'paths'];
    //   const pKey = [...pathsK, actionData.pathIdx];
    //
    //   const initMarker = initialState.getIn(markerK).toJS();
    //   const initNextPath = initialState.getIn([...pathsK, actionData.pathIdx + 1]).toJS();
    //   expect(initialState.getIn(pKey.slice(0, 3)).size).toEqual(2);
    //
    //   const state = reducer(initialState, actions.removePath(actionData));
    //   expect(state.getIn(pKey.slice(0, 3)).size).toEqual(1);
    //
    //   const marker = state.getIn(markerK).toJS();
    //   const newPath = state.getIn(pKey).toJS();
    //
    //   expect(marker.time).toEqual(initMarker.time);
    //   expect(newPath.x1).toEqual(marker.x);
    //   expect(newPath.x2).toEqual(initNextPath.x2);
    //   expect(newPath.y1).toEqual(marker.y);
    //   expect(newPath.y2).toEqual(initNextPath.y2);
    // });


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

      expect(marker.time).toEqual(initMarker.time + timeDiff);
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

      expect(initialState.get('roundTime')).toEqual(72);

      const state = reducer(initialState, actions.removePath(actionData));
      expect(state.getIn(pathsK).size).toEqual(2);
      expect(state.get('roundTime')).toBeGreaterThan(initialState.get('roundTime'));
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

      expect(initialState.getIn(firstPathTime)).toEqual(2);
      expect(initialState.getIn(lastPathTime)).toEqual(72);

      const state = reducer(initialState, actions.removePath(actionData));

      expect(state.getIn(firstPathTime)).toEqual(2);
      expect(state.getIn(lastPathTime)).toBeLessThan(72);
    });

  });


  // it('should have a correct time diff between paths', () => {
  //   const initialState = reducer(complexState);
  //
  //   const actionData = {
  //     markerId: '5',
  //     pathIdx: 3
  //   };
  //
  //   const markerK = ['markers', actionData.markerId];
  //   const pathsK = [...markerK, 'paths'];
  //
  //   const state = reducer(initialState, actions.removePath(actionData));
  //
  //   console.log(state.getIn(pathsK).toJS());
  //   expect(false).toBe(true);
  // });

  // TODO: fix tests broken by changing roundTime
  // TODO: tests that catch the correct time diff between paths, etc.


});
