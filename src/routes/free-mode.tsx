import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import World from '../World'

const FreeMode = () => {
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      const world = new World()
      const screen = screenRef.current
      screen?.appendChild(world.renderer.domElement)

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      const cube = new THREE.Mesh(geometry, material)
      //world.scene.add(cube)

      world.camera.position.z = 5

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('draco/');
      loader.setDRACOLoader(dracoLoader);

      loader.load('room.glb', function (gltf) {
        world.scene.add(gltf.scene);
      }, undefined, function (error) {
        console.error(error);
      });

      const animate = () => {
        requestAnimationFrame(animate)

        // cube.rotation.x += 0.01
        // cube.rotation.y += 0.01

        world.renderer.render(world.scene, world.camera)
      }

      animate()

      return () => {
        screen?.removeChild(world.renderer.domElement)
      }
    })()

  }, [])

  return (
    <div ref={screenRef} />
  )
}

export default FreeMode