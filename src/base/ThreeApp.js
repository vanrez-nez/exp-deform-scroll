import * as THREE from 'three';
import SkyDome from './SkyDome';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CAMERA_FOV = 75;
const CAMERA_ASPECT = 2;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

const NOOP = () => {};

function toLocalCoords(domElement, mouseEvent) {
  const rect = domElement.getBoundingClientRect();
  const x = mouseEvent.clientX - rect.left;
  const y = mouseEvent.clientY - rect.top;
  return [x, y];
}

export default class ThreeApp {
  constructor({
    pixelRatio = window.devicePixelRatio,
    autoResize = true,
    orbitControls = false,
    axesHelper = false,
    skyDome = true,
    onRenderCallback = NOOP,
    onResizeCallback = NOOP,
    onMouseMoveCallback = NOOP,
    onMouseClickCallback = NOOP,
    onMouseWheelCallback = NOOP,
  } = {}) {
    this.features = { orbitControls, axesHelper, skyDome };
    this.autoResize = autoResize;
    this.width = 0;
    this.height = 0;
    this.pixelRatio = pixelRatio;
    this.onResizeCallback = onResizeCallback;
    this.onRenderCallback = onRenderCallback;
    this.onMouseClickCallback = onMouseClickCallback;
    this.onMouseMoveCallback = onMouseMoveCallback;
    this.onMouseWheelCallback = onMouseWheelCallback;
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('js-canvas'),
      antialias: true
    });
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      CAMERA_ASPECT,
      CAMERA_NEAR,
      CAMERA_FAR
    );
    this.camera.position.z = 10;
    this.scene = new THREE.Scene();
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(this.ambientLight);
    this.clock = new THREE.Clock();

    // Sky Dome
    if (skyDome) {
      this.skyDome = new SkyDome({
        radius: CAMERA_FAR / 3,
        detail: 1,
        intensity: 1.2,
        // colorFrom: 0x5c4070,
        // colorFrom: 0xfffce5, // greenish
        colorFrom: 0xffffff, // bluish
        // colorFrom: 0xe6a8a1, // redish
        colorTo: 0x6a6a84,
        hemisphereLight: true,
      });
      this.scene.add(this.skyDome.group);
    }

    // Optional Components
    if (orbitControls) {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 1;
      controls.maxDistance = 1000;
      this.orbitControls = controls;
    }

    if (axesHelper) {
      this.axesHelper = new THREE.AxesHelper(500);
      this.scene.add(this.axesHelper);
    }

    // Mouse Events
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('click', this.onMouseClick.bind(this));
    canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
  }

  start() {
    this.onRender();
    return this;
  }

  resizeToCanvasSize() {
    const { clientWidth, clientHeight } = this.renderer.domElement;
    this.resize(clientWidth, clientHeight);
  }

  resize(width, height) {
    const { renderer, camera, pixelRatio } = this;
    if (this.width !== width || this.height !== height) {
      this.width = width * pixelRatio | 0;
      this.height = height * pixelRatio | 0;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      this.onResizeCallback(width, height);
    }
  }

  onMouseClick(event) {
    const [x, y] = toLocalCoords(this.renderer.domElement, event);
    this.onMouseClickCallback({ x, y, event });
  }

  onMouseMove(event) {
    const [x, y] = toLocalCoords(this.renderer.domElement, event);
    this.onMouseMoveCallback({ x, y, event });
  }

  onMouseWheel(event) {
    this.onMouseWheelCallback(event);
  }

  onRender() {
    const { clock, scene, camera, renderer, autoResize, features } = this;
    if (autoResize) {
      this.resizeToCanvasSize();
    }

    if (features.orbitControls) {
      this.orbitControls.update();
    }

    camera.lookAt(scene.position);
    this.onRenderCallback({
      delta: clock.getDelta(),
      elapsedTime: clock.getElapsedTime(),
      scene,
      camera,
      renderer,
    });
    window.requestAnimationFrame(this.onRender.bind(this));
  }
}