import * as THREE from "three";

export function createTreesPool(treesPool, youtube, insta, anxiety, deadline) {
  let maxTreesInPool = 10;
  let newTree;
  for (let i = 0; i < maxTreesInPool; i++) {
    let random = Math.random();
    if (random < 0.5) newTree = createTree();
    else newTree = createStone(youtube, insta, anxiety, deadline);
    treesPool.push(newTree);
  }
  return treesPool;
}

function createTree() {
  let sides = 8;
  let tiers = 6;
  let treeGeometry = new THREE.ConeGeometry(0.3, 1, sides, tiers);
  let treeMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c43ad,
    flatShading: THREE.FlatShading,
  });
  let treeTop = new THREE.Mesh(treeGeometry, treeMaterial);
  let treeTop1 = new THREE.Mesh(treeGeometry, treeMaterial);
  let treeTop2 = new THREE.Mesh(treeGeometry, treeMaterial);

  treeTop.castShadow = true;
  treeTop.receiveShadow = false;
  treeTop.position.y = 0.6;
  treeTop1.castShadow = true;
  treeTop1.receiveShadow = false;
  treeTop1.position.y = 0.6;
  treeTop1.position.x -= 0.4;
  treeTop2.castShadow = true;
  treeTop2.receiveShadow = false;
  treeTop2.position.y = 0.6;
  treeTop2.position.x += 0.4;
  treeTop.rotation.y = 0;
  treeTop1.rotation.y = 0;
  treeTop2.rotation.y = 0;

  let treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
  let trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x886633,
    flatShading: THREE.FlatShading,
  });
  let treeTrunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial);
  treeTrunk.position.y = 0.25;
  let tree = new THREE.Object3D();
  tree.add(treeTop);
  tree.add(treeTop1);

  return tree;
}

function createStone(youtube, insta, anxiety, deadline) {
  let stoneGeometry = new THREE.DodecahedronGeometry(0.6, 0);

  let stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5f2f2,
    shading: THREE.FlatShading,
  });
  let stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
  stone.receiveShadow = true;
  stone.castShadow = true;

  let text = createGeometry(youtube, insta, anxiety, deadline);
  text.position.y = 0.75;
  text.position.z += 0.3;
  stone.add(text);
  return stone;
}

function createGeometry(youtube, insta, anxiety, deadline) {
  let textArray = [youtube, insta, anxiety, deadline];
  let num = Math.random() * 4;
  let tex = textArray[parseInt(num)];
  let texture = new THREE.TextureLoader().load(tex);
  let geometry = new THREE.PlaneGeometry(0.4, 0.4);
  let material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    map: texture,
    side: THREE.DoubleSide,
  });
  let mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
