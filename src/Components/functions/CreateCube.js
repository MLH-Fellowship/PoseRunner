import * as THREE from "three";

let createCube = function (direction, leftArrow, rightArrow, upArrow, scene) {
  const geometry = new THREE.PlaneGeometry(0.15, 0.15);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 1,
    transparent: true,
  });
  let cube = new THREE.Mesh(geometry, material);

  let leftTexture = new THREE.TextureLoader().load(leftArrow);
  let rightTexture = new THREE.TextureLoader().load(rightArrow);
  let upTexture = new THREE.TextureLoader().load(upArrow);

  if (direction === "left") {
    cube.position.set(-0.4, 3.5, 6);
    cube.material.map = leftTexture;
  } else if (direction === "right") {
    cube.position.set(0.4, 3.5, 6);
    cube.material.map = rightTexture;
  } else if (direction === "up") {
    cube.position.set(0, 3.6, 6);
    cube.material.map = upTexture;
  } else {
    return "Not a valid direction";
  }
  cube.visible = false;
  scene.add(cube);

  switch (direction) {
    case 'left':
      return { leftCube: cube, scene: scene }
    case 'right':
      return { rightCube: cube, scene: scene }
    case 'up':
      return { upCube: cube, scene: scene }
    default:
  }
};

export default createCube;
