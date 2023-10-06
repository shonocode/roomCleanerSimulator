import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import World from '../World';
import Cleaner from '../Cleaner';
import Map from '../Map';

const FreeMode = () => {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const world = new World();
      const screen = screenRef.current;
      screen?.appendChild(world.renderer.domElement);

      world.camera.position.set(0,2,2);
      world.camera.rotation.x = -0.3;

      const map:Map = await Map.init();
      world.scene.add(map.model);

      const cleaner:Cleaner = await Cleaner.init(world.camera);
      world.scene.add(cleaner.model);
      world.scene.add(cleaner.camera.cameraBox);

      const animate = () => {
        requestAnimationFrame(animate);
        cleaner.control();

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