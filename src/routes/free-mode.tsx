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

      // loader.load('room.glb', function (gltf) {
      //   world.scene.add(gltf.scene);
      // }, undefined, function (error) {
      //   console.error(error);
      // });


      loader.load('roomba.glb', function (gltf) {
        gltf.scene.position.set(0, 0, 0);
        world.scene.add(gltf.scene);

        const keys = {
          forward: false,
          backward: false,
          left: false,
          right: false,
        };

        const onKeyDown = (event: KeyboardEvent) => {
          switch (event.key) {
            case "w":
              keys.forward = true;
              break;
            case "a":
              keys.left = true;
              break;
            case "s":
              keys.backward = true;
              break;
            case "d":
              keys.right = true;
              break;
          }
        }

        const onKeyUp = (event: KeyboardEvent) => {
          switch (event.key) {
            case "w":
              keys.forward = false;
              break;
            case "a":
              keys.left = false;
              break;
            case "s":
              keys.backward = false;
              break;
            case "d":
              keys.right = false;
              break;
          }
        }
        document.addEventListener('keydown', (e) => onKeyDown(e), false);
        document.addEventListener('keyup', (e) => onKeyUp(e), false);


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