import { addTree } from './AddTree.js'

export function addPathTree(treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will) {
  let options = [0, 1, 2];
  let lane = Math.floor(Math.random() * 3);
  if (treesPool.length !== 0) {
    ({ treesPool = {}, treesInPath = {}, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addTree(true, lane, false, treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
  }
  options.splice(lane, 1);
  if (Math.random() > 0.5) {
    lane = Math.floor(Math.random() * 2);
    if (treesPool.length !== 0) {
      ({ treesPool = {}, treesInPath = {}, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addTree(true, options[lane], false, treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
    }
  }
  return { treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will };
}
