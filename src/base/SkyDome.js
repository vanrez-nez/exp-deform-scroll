import * as THREE from 'three';

export default class SkyDome {
  constructor({
    radius,
    detail,
    colorFrom = 0x00ff00,
    colorTo = 0xff0000,
    intensity = 0.5,
    hemisphereLight = false,
    lightHelpers = false,
  }) {
    this.group = new THREE.Group();
    this.mesh = this.createMesh(radius, detail);
    this.group.add(this.mesh);

    // Hemishphere light
    if (hemisphereLight) {
      this.hemisphereLight = new THREE.HemisphereLight(colorFrom, colorTo, intensity);
      this.hemisphereLight.name = 'Hemisphere Light';
      this.hemisphereLight.position.set(radius / 3, radius / 3, radius / 3);
      this.group.add(this.hemisphereLight);
      if (lightHelpers) {
        const hemiHelper = new THREE.HemisphereLightHelper(this.hemisphereLight, 10);
        this.group.add(hemiHelper);
      }
    }
  }

  createMesh(radius, detail) {
    const geo = new THREE.IcosahedronBufferGeometry(radius, detail);
    const mat = new THREE.MeshStandardMaterial({
      name: 'skydome',
      side: THREE.BackSide,
      color: 0xffffff,
      metalness: 0.35,
      roughness: 1,
      flatShading: false,
    });
    return new THREE.Mesh(geo, mat);
  }
  
  setDomeColor(color) {}
  setLightColor(color) {}
  setSize() {}
}