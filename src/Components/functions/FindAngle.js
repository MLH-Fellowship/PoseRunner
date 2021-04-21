export function findAngle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(A.y - B.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(C.y - B.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(A.y - C.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}
