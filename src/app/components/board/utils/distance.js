export function distanceToSeconds({x1, x2, y1, y2}) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const second = 45; // 1 sec per 45px;
  return parseFloat((distance / second).toFixed(1));
}
