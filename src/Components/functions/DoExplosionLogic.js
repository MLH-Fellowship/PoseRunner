import * as THREE from "three";

export function doExplosionLogic(particles, vertexArr, particleGeometry, explosionPower) {
  if (!particles.visible) return;
  vertexArr = [];
  for (let i = 0; i < 20; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = -0.4 + Math.random();
    vertex.y = -0.2 + Math.random();
    vertex.z = -0.2 + Math.random();
    vertexArr.push(vertex);
  }
  particleGeometry.setFromPoints(vertexArr);

  if (explosionPower > 1.005) {
    explosionPower -= 0.0015;
  } else {
    particles.visible = false;
  }
  particleGeometry.verticesNeedUpdate = true;
  return { particles, vertexArr, particleGeometry, explosionPower };
}
