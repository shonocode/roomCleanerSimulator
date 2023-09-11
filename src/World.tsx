import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class World {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera

  constructor() {
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)

    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0)
    this.scene.add(ambientLight)
  }
}

export default World