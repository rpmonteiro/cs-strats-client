import { fromJS } from 'Immutable';
import { interpolate } from '../utils/interpolation';
import expect from 'expect';

describe('interpolate function', () => {

  it('should correctly interpolate between two points', () => {
    const marker = fromJS({ x: 150, y: 150 });
    const node = fromJS({ x1: 250, x2: 350, y1: 250, y2: 350 });
    
    const result = interpolate(marker, node, 0.5);
    
    expect(result.get('x')).toEqual(250);
    expect(result.get('y')).toEqual(250);
  });
  
  
  it('should handle not having a node', () => {
    const marker = fromJS({ x: 150, y: 150 });
    const node = undefined;
    
    const result = interpolate(marker, node, 0.5);
    
    expect(result.get('x')).toEqual(marker.get('x'));
    expect(result.get('y')).toEqual(marker.get('y'));
  });
  
  
  it('should handle progress being 0', () => {
    const marker = fromJS({ x: 150, y: 150 });
    const node = fromJS({ x1: 250, x2: 350, y1: 250, y2: 350 });
    
    const result = interpolate(marker, node, 0);
    
    expect(result.get('x')).toEqual(marker.get('x'));
    expect(result.get('y')).toEqual(marker.get('y'));
  });

});
