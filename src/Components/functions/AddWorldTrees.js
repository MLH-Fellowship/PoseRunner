import { addTree } from './AddTree.js'

export function addWorldTrees(treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will) {
  let numTrees = 36;
  let gap = 6.28 / 36;
  for (let i = 0; i < numTrees; i++) {
    ({ treesPool = {}, treesInPath = {}, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addTree(false, i * gap, true, treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
    ({ treesPool = {}, treesInPath = {}, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addTree(false, i * gap, false, treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
  }
  return { treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will };
}
