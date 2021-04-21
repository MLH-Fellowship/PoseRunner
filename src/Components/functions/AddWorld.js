import * as THREE from "three";
import { addWorldTrees } from './AddWorldTrees.js'

export function addWorld(txt, worldRadius, rollingGroundSphere, scene, treesPool, treesInPath, sphericalHelper, pathAngleValues, will) {
  let sides = 50;
  let tiers = 80;
  let sphereTexture = new THREE.TextureLoader().load(txt);
  let sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
  let sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3793,
    flatShading: THREE.FlatShading,
    map: sphereTexture,
  });
  rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  rollingGroundSphere.receiveShadow = true;
  rollingGroundSphere.castShadow = false;
  rollingGroundSphere.rotation.z = -Math.PI / 2;
  scene.add(rollingGroundSphere);
  rollingGroundSphere.position.y = -24.4;
  rollingGroundSphere.position.z = 2;
  ({ treesPool = {}, treesInPath = {}, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addWorldTrees(treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
  return { txt, worldRadius, rollingGroundSphere, scene, treesPool, treesInPath, sphericalHelper, pathAngleValues, will };
}
