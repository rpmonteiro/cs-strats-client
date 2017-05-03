import { Map } from 'immutable';

export function interpolate(marker, node, progress) {
  if (!node) {
    return marker;
  }
  
  const markerX = marker.get('x2') || marker.get('x');
  const markerY = marker.get('y2') || marker.get('y');
  const nodeX   = node.get('x2');
  const nodeY   = node.get('y2');
  
  const x = markerX + (nodeX - markerX) * progress;
  const y = markerY + (nodeY - markerY) * progress;
  
  return Map({x, y});
}
