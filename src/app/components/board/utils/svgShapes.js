export function makeLine() {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.style.stroke = '#FFF';
  line.style.strokeWidth = '3px';
  return line;
}


export function makeSquare() {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const style = 'fill: yellow; stroke: back; stroke-width: 1';
  rect.setAttribute('width', '10');
  rect.setAttribute('height', '10');
  rect.setAttribute('style', style);
  return rect;
}
