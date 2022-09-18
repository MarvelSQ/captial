/**
 *
 * point to line
 *
 * |                 |
 * |       point     |
 * |      /  |  \    |
 * |     /   |   \   |
 * |    pf   v   pt  |
 * |   /     |    \  |
 * |  /      |     \ |
 * from ---- l ---- to
 *
 *
 */
export function distanceToLine(
  point: {
    x: number;
    y: number;
  },
  [from, to]: [
    {
      x: number;
      y: number;
    },
    {
      x: number;
      y: number;
    }
  ]
) {
  const a = to.y - from.y;
  const b = from.x - to.x;
  const c = to.x * from.y - from.x * to.y;

  const verticalDistance =
    Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);

  const formDistance = Math.hypot(point.x - from.x, point.y - from.y);

  const toDistance = Math.hypot(point.x - to.x, point.y - to.y);

  const lineDistance = Math.hypot(a, b);

  const fromProjectionDistance = Math.hypot(formDistance, verticalDistance);

  const toProjectionDistance = Math.hypot(toDistance, verticalDistance);

  return Math.max(fromProjectionDistance, toProjectionDistance) > lineDistance
    ? Math.min(formDistance, toDistance)
    : verticalDistance;
}

export function distanceToMultiLines(
  point: {
    x: number;
    y: number;
  },
  lines: {
    x: number;
    y: number;
  }[]
) {
  return lines.reduce((min, line, currentIndex) => {
    if (currentIndex === 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    const distance = distanceToLine(point, [lines[currentIndex - 1], line]);
    return Math.min(min, distance);
  }, Number.MAX_SAFE_INTEGER);
}

export function distanceToRect(
  point: {
    x: number;
    y: number;
  },
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  return distanceToMultiLines(point, [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x, y: rect.y },
  ]);
}
