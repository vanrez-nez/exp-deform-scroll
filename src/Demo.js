import * as THREE from 'three';
import { TweenMax } from 'gsap';
import {
  BlurPass,
  VignetteEffect,
  BloomEffect,
  NoiseEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass
} from "postprocessing";
import ThreeApp from "./base/ThreeApp";
import ProjectResizer from './base/ProjectResizer';
import { visibleHeightAtZDepth } from './base/ProjectResizer';
import { lerp, clamp } from './base/Utils';
import img1 from '../images/img-1.jpg';
import img2 from '../images/img-2.jpg';
import vertexImage from './shaders/vertex-image.glsl';
import fragmentImage from './shaders/fragment-image.glsl';

export default class Demo {
  constructor() {
    this.app = new ThreeApp({
      onRenderCallback: this.onRender.bind(this),
      onResizeCallback: this.onResize.bind(this),
      orbitControls: false,
      axesHelper: false,
      skyDome: false,
    });
    this.setup();
    this.addScreenPlane(img1);
    this.addScreenPlane(img2);
    this.addScreenPlane(img1);
    this.addScreenPlane(img2);
    this.addScreenPlane(img1);
    this.addScreenPlane(img2);
    this.addScreenPlane(img1);
    this.addScreenPlane(img2);
    this.addScreenPlane(img1);
    this.addScreenPlane(img2);
    this.app.start();
  }

  addScreenPlane(image) {
    const { planes, resizers } = this;
    const { scene, camera } = this.app;
    const geo = new THREE.PlaneBufferGeometry(1, 1, 16, 16);
    const mat = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: {
        uForce: { value: 0.0 },
        tMap: { value: new THREE.TextureLoader().load(image) },
      },
      vertexShader: vertexImage,
      fragmentShader: fragmentImage,
    });
    // const mat = new THREE.MeshBasicMaterial({
    //   map: new THREE.TextureLoader().load(image),
    //   //wireframe: true,
    // });
    const mesh = new THREE.Mesh(geo, mat);
    const offset = planes.length * visibleHeightAtZDepth(camera, 0);
    const resizer = new ProjectResizer(camera, mesh);
    resizers.push(resizer);
    planes.push({ mesh, offset });
    mesh.position.y = -offset;
    //mesh.rotation.y = -(Math.PI / 180) * 90;
    scene.add(mesh);
  }

  setup() {
    const { scene, renderer, camera } = this.app;
    this.scrollForce = 0;
    this.lastTop = 0;
    camera.position.set(0, 0, 1);
    // Setup composer for postprocessing effects
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomEffect = new BloomEffect();
    const noiseEffect = new NoiseEffect({ premultiply: true });
    const chromaEffect = new ChromaticAberrationEffect();
    const vignetteEffect = new VignetteEffect();
    composer.addPass(new EffectPass(camera, bloomEffect));
    composer.addPass(new EffectPass(camera, noiseEffect));
    composer.addPass(new EffectPass(camera, vignetteEffect));

    //const blurPass = new BlurPass({ height: 480 });
    //composer.addPass(blurPass);

    // this.passes = {
    //   blur: blurPass,
    // };

    this.effects = {
      bloom: bloomEffect,
      chroma: chromaEffect,
      vignette: vignetteEffect,
    };
    this.composer = composer;
    this.resizers = [];
    this.planes = [];
    // hack to reset scroll top on reload
    window.addEventListener('beforeunload', () => {
      window.scrollTo(0, 0);
    });
  }

  updateScroll() {
    const { planes, effects } = this;
    const yPos = window.scrollY || window.pageYOffset;
    const delta = Math.abs(yPos - this.lastTop);

    // smooth scroll force delta
    this.scrollForce = lerp(this.scrollForce, this.scrollForce + delta * 0.003, 0.45);

    this.lastTop = yPos;
    // pixel to screen unit
    const screenUnits = visibleHeightAtZDepth(this.app.camera, 0) / window.innerHeight;
    for (let i = 0; i < planes.length; i++) {
      const { mesh, offset } = planes[i];
      const { position, material } = mesh;
      // Should calc magic number from pixels in view height

      const targetY = ((yPos > 0 ? yPos : 0.01) * screenUnits) - offset;
      position.y = lerp(position.y, targetY, 0.05);
      material.uniforms.uForce.value = this.scrollForce;
    }

    this.scrollForce = clamp(this.scrollForce * 0.94, -2, 2);
    effects.bloom.intensity = this.scrollForce * 4;
    //effects.vignette.darkness = this.scrollForce * 2;
    effects.vignette.uniforms.get('darkness').value = 0.2 + this.scrollForce * 0.25;
  }

  onResize(width, height) {
    this.composer.setSize(width, height, false);
    this.resizers.forEach(r => r.update());
  }

  onRender({ delta }) {
    const { composer } = this;
    this.updateScroll();
    composer.render(delta);
  }
}