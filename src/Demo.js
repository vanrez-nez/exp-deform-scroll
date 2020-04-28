import * as THREE from 'three';
import ThreeApp from "./base/ThreeApp";

export default class Demo {
  constructor() {
    this.app = new ThreeApp({
      onRenderCallback: this.onRender.bind(this),
      orbitControls: true,
      // axesHelper: true,
    });
    this.setup();
    this.app.start();
  }

  setup() {
    const { scene } = this.app;

    // box
    const geo = new THREE.BoxBufferGeometry(2, 2, 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2f477d });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, 0);
    this.box = mesh;
    scene.add(mesh);

    // light
    const spotLight = new THREE.SpotLight(0xffffff, 2, 15);
    spotLight.position.set(3, 3, 3);
    scene.add(spotLight);
  }

  onRender({ delta, scene, camera, renderer }) {
    this.box.rotation.x += delta;
    this.box.rotation.z += delta;
    renderer.render(scene, camera);
  }
}