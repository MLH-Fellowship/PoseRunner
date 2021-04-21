export function explode(particles, playerObject, vertexArr, THREE, particleGeometry, explosionPower) {
  particles.position.y = 2;
  particles.position.z = 4.8;
  particles.position.x = playerObject.position.x;
  vertexArr = [];
  for (let i = 0; i < 20; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = -0.4 + Math.random();
    vertex.y = -0.2 + Math.random();
    vertex.z = -0.2 + Math.random();
    vertexArr.push(vertex);
  }
  particleGeometry.setFromPoints(vertexArr);
  explosionPower = 1.07;
  particles.visible = true;
  return { particles, playerObject, vertexArr, particleGeometry, explosionPower }
}
