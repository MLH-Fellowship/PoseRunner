import * as THREE from "three";

export function createBgTree(will) {
  let willTexture = new THREE.TextureLoader().load(will);

  let willGeometry = new THREE.PlaneGeometry(1.2, 1.2);
  let willMaterial = new THREE.MeshBasicMaterial({
    map: willTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });
  let willMesh = new THREE.Mesh(willGeometry, willMaterial);
  willMesh.position.y = 1.34;

  let treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
  let trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x251455,
    flatShading: THREE.FlatShading,
  });
  let treeTrunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial);
  treeTrunk.position.y = 0.5;
  let tree = new THREE.Object3D();
  tree.add(treeTrunk);
  tree.add(willMesh);
  return tree;
}
