import { createBgTree } from './CreateBgTree.js'

export function addTree(inPath, row, isLeft, treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will) {
  let newTree;
  if (inPath) {
    if (treesPool.length === 0) return;
    newTree = treesPool.pop();
    newTree.visible = true;
    treesInPath.push(newTree);
    sphericalHelper.set(
      worldRadius - 0.3,
      pathAngleValues[row],
      -rollingGroundSphere.rotation.x + 4
    );
  } else {
    newTree = createBgTree(will);
    let forestAreaAngle = 0;
    if (isLeft) {
      forestAreaAngle = 1.68 + Math.random() * 0.1;
    } else {
      forestAreaAngle = 1.46 - Math.random() * 0.1;
    }
    sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
  }
  newTree.position.setFromSpherical(sphericalHelper);
  let rollingGroundVector = rollingGroundSphere.position
    .clone()
    .normalize();
  let treeVector = newTree.position.clone().normalize();
  newTree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
  rollingGroundSphere.add(newTree);
  return { treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will };
}
