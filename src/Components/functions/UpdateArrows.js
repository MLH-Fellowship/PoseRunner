import * as THREE from "three";

export function updateArrows(moveLeft, leftCube, LEFT, moveRight, rightCube, RIGHT, moveUp, upCube, UP) {
  if (moveLeft) {
    leftCube.position.x = THREE.Math.lerp(
      leftCube.position.x,
      (leftCube.position.x += LEFT * 3),
      0.01
    );
  }
  if (moveRight) {
    rightCube.position.x = THREE.Math.lerp(
      rightCube.position.x,
      (rightCube.position.x += RIGHT * 3),
      0.01
    );
  }
  if (moveUp) {
    upCube.position.y = THREE.Math.lerp(
      upCube.position.y,
      (upCube.position.y += UP * 3),
      0.01
    );
  }
  return { moveLeft, leftCube, LEFT, moveRight, rightCube, RIGHT, moveUp, upCube, UP };
}
