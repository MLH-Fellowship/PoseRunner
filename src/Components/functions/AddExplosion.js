import * as THREE from "three";

export function addExplosion(particleGeometry, particles, scene) {
  particleGeometry = new THREE.BufferGeometry();
  let pnt = 50;
  let positions = [];
  const n = 2,
    n2 = n / 2;
  for (let i = 0; i < pnt; i++) {
    const x = Math.random() * n - n2;
    const y = Math.random() * n - n2;
    const z = Math.random() * n - n2;

    positions.push(x, y, z);
  }
  const vertices = new Float32Array(positions);
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );
  let pMaterial = new THREE.ParticleBasicMaterial({
    color: 0xc0c0c0,
    size: 0.1,
  });
  particles = new THREE.Points(particleGeometry, pMaterial);
  scene.add(particles);
  particles.visible = true;
  return { particleGeometry, particles, scene };
}
