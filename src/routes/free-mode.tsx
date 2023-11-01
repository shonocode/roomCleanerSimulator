import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import World from '../World';
import Cleaner from '../Cleaner';
import Map from '../Map';
import Trash from '../Trash';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const FreeMode = () => {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const screen = screenRef.current;
      const world = new World();
      const canvas = world.renderer.domElement;
      screen?.appendChild(canvas);

      // デバッグ用
      screen?.appendChild(world.stats.dom);

      // 仮実装
      //.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
      //document.pointerLockElement = document.pointerLockElement
      //document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

      // キャンバスをクリックした際にポインタロックを要求
      document.body.onclick = () => {
        document.body.requestPointerLock();
      };

      const STEPS_PER_FRAME = 5;
      const map: Map = await Map.init(world.scene, world.octree);
      const cleaner: Cleaner = await Cleaner.init(world.scene, world.camera);
      const trash: Trash = new Trash(world.scene, map.mapBox, world.octree);

      const onWindowResize = () => {
        world.camera.aspect = window.innerWidth / window.innerHeight;
        world.camera.updateProjectionMatrix();
        world.renderer.setSize(window.innerWidth, window.innerHeight);
      }

      const animate = () => {
        const deltaTime = Math.min(0.05, world.clock.getDelta()) / STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          cleaner.control(deltaTime);
          cleaner.updateCleaner(deltaTime, world.octree);
          trash.updateTrashes(deltaTime, trash.trashes, world.octree, cleaner);
          //teleportPlayerIfOob();
        }

        world.renderer.render(world.scene, world.camera);
        world.stats.update();
        requestAnimationFrame(animate);
      }

      window.addEventListener('resize', onWindowResize);
      animate();

      return () => {
        screen?.removeChild(world.renderer.domElement)
      };
    })();

  }, []);

  return (
    <div ref={screenRef} />
  )
}

export default FreeMode