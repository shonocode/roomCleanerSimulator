import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import World from '../World';
import Cleaner from '../Cleaner';
import Map from '../Map';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

const FreeMode = () => {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const world = new World();
      const screen = screenRef.current;
      const canvas = world.renderer.domElement;
      const worldOctree = new Octree();
      screen?.appendChild(canvas);

      // 仮実装
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

      // キャンバスをクリックした際にポインタロックを要求
      canvas.onclick = function () {
        canvas.requestPointerLock();
      };

      world.camera.position.set(0, 2, 2);
      world.camera.rotation.x = -0.3;

      const map: Map = await Map.init();
      world.scene.add(map.model);

      worldOctree.fromGraphNode(map.model);
      console.log(map.model)
      console.log(worldOctree)

      map.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material.map) {
            child.material.map.anisotropy = 4;
          }
        }
      });

      const helper = new OctreeHelper(worldOctree);
      helper.visible = true;
      //world.scene.add(helper);



      // const result = map.model.children.filter((mesh) => mesh.geometry != undefined);
      // const boxes = [];
      // for (const mesh of result) {
      //   //console.log(mesh.geometry);
      //   mesh.geometry.computeBoundingBox();
      //   const box = new THREE.Box3();
      //   box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      //   boxes.push(box);
      //   const helper = new THREE.Box3Helper(box, 0xffff00);
      //   world.scene.add(helper);
      // }


      const cleaner: Cleaner = await Cleaner.init(world.scene, world.camera);

      const trashGeometry = new THREE.SphereGeometry();
      const trashMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const trash = new THREE.Mesh(trashGeometry, trashMaterial);
      trash.scale.setScalar(0.5);
      trash.position.z = -3;
      //world.scene.add(trash);


      cleaner.model.geometry.computeBoundingBox();
      const box = new THREE.Box3();

      const bhelper = new THREE.Box3Helper(box, 0xffff00);
      world.scene.add(bhelper);

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const height = size.y;
      const radius = Math.max(size.x, size.z) / 2;
      const start = new THREE.Vector3(center.x, center.y - height / 2, center.z);
      const end = new THREE.Vector3(center.x, center.y + height / 2, center.z);

      const playerCollider = new Capsule( start, end, radius);
      //const playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );
      let playerOnFloor = false;
      //const playerVelocity = cleaner.model.position;
      //const playerVelocity = new THREE.Vector3();

      function playerCollisions(playerVelocity) {
        const result = worldOctree.capsuleIntersect(playerCollider);
        playerOnFloor = false;
        if (result) {
          playerOnFloor = result.normal.y > 0;
          if (!playerOnFloor) {
            playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
          }
          playerCollider.translate(result.normal.multiplyScalar(result.depth));
        }
      }

      function updatePlayer(deltaTime, playerVelocity) {
        const GRAVITY = 30
        let damping = Math.exp(- 4 * deltaTime) - 1;

        // if (!playerOnFloor) {
        //   playerVelocity.y -= GRAVITY * deltaTime;
        //   // small air resistance
        //   damping *= 0.1;
        // }

        //playerVelocity.addScaledVector(playerVelocity, damping);

        const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
        playerCollider.translate(deltaPosition);

        playerCollisions(playerVelocity);
      }

      
      const animate = () => {
        requestAnimationFrame(animate);
        cleaner.control();
        updatePlayer(world.clock.getDelta(), cleaner.model.position)
        box.copy(cleaner.model.geometry.boundingBox).applyMatrix4(cleaner.model.matrixWorld);

        world.renderer.render(world.scene, world.camera)
      };

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