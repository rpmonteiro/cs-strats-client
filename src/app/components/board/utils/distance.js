export function coordsToSecs(coords) {
  const x1 = coords.get('x1');
  const x2 = coords.get('x2');
  const y1 = coords.get('y1');
  const y2 = coords.get('y2');
  
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const second = 45; // 1 sec per 45px;
  return parseFloat((distance / second).toFixed(0));
}
