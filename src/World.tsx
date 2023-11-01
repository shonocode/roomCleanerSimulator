import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class World {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  stats: Stats;
  octree: Octree;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ /*antialias: true*/ });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.VSMShadowMap;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.rotation.order = 'YXZ';
    this.clock = new THREE.Clock();
    this.octree = new Octree();

    //const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    this.scene.add(ambientLight);

    // 一時デバッグ用
    // this.scene.background = new THREE.Color(0x88ccee);
    // this.scene.fog = new THREE.Fog(0x88ccee, 0, 50);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(- 5, 25, - 1);
    directionalLight.castShadow = true;
    // directionalLight.shadow.camera.near = 0.01;
    // directionalLight.shadow.camera.far = 500;
    // directionalLight.shadow.camera.right = 30;
    // directionalLight.shadow.camera.left = - 30;
    // directionalLight.shadow.camera.top = 30;
    // directionalLight.shadow.camera.bottom = - 30;
    // directionalLight.shadow.mapSize.width = 1024;
    // directionalLight.shadow.mapSize.height = 1024;
    // directionalLight.shadow.radius = 4;
    // directionalLight.shadow.bias = - 0.00006;
    this.scene.add(directionalLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }));
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '0px';

  }
}

export default World;