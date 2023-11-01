import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

class Trash {
    trashes: [{
        mesh: THREE.Mesh,
        collider: THREE.Sphere,
        velocity: THREE.Vector3
    }][];

    constructor(scene: THREE.Scene, mapBox, worldOctree) {
        const NUM_SPHERES = 100;
        const SPHERE_RADIUS = 0.05;

        const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });

        this.trashes = [];

        for (let i = 0; i < NUM_SPHERES; i++) {
            const trash = new THREE.Mesh(sphereGeometry, sphereMaterial);
            // trash.castShadow = true;
            // trash.receiveShadow = true;
            scene.add(trash);

            const pos = new THREE.Vector3(
                THREE.MathUtils.randFloat(mapBox.min.x, mapBox.max.x),
                THREE.MathUtils.randFloat(mapBox.min.y, mapBox.max.y),
                THREE.MathUtils.randFloat(mapBox.min.z, mapBox.max.z)
            );

            const trashCollider = new THREE.Sphere(pos, SPHERE_RADIUS);

            const result = worldOctree.sphereIntersect(trashCollider);
            if (!result) {
                this.trashes.push({
                    mesh: trash,
                    collider: trashCollider,
                    velocity: new THREE.Vector3()
                });
            }
        }
    }

    trashesCollisions(trashes) {
        const vector1 = new THREE.Vector3();
        const vector2 = new THREE.Vector3();
        const vector3 = new THREE.Vector3();

        for (let i = 0, length = trashes.length; i < length; i++) {
            const s1 = trashes[i];
            for (let j = i + 1; j < length; j++) {
                const s2 = trashes[j];
                const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
                const r = s1.collider.radius + s2.collider.radius;
                const r2 = r * r;

                if (d2 < r2) {
                    const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
                    const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
                    const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));
                    s1.velocity.add(v2).sub(v1);
                    s2.velocity.add(v1).sub(v2);
                    const d = (r - Math.sqrt(d2)) / 2;
                    s1.collider.center.addScaledVector(normal, d);
                    s2.collider.center.addScaledVector(normal, - d);
                }
            }
        }
    }

    updateTrashes(deltaTime: number, trashes, worldOctree, cleaner) {
        const GRAVITY = 30;
        trashes.forEach(trash => {
            trash.collider.center.addScaledVector(trash.velocity, deltaTime);
            const result = worldOctree.sphereIntersect(trash.collider);
            if (result) {
                trash.velocity.addScaledVector(result.normal, - result.normal.dot(trash.velocity) * 1.5);
                trash.collider.center.add(result.normal.multiplyScalar(result.depth));
            } else {
                trash.velocity.y -= GRAVITY * deltaTime;
            }

            const damping = Math.exp(- 1.5 * deltaTime) - 1;
            trash.velocity.addScaledVector(trash.velocity, damping);
            cleaner.cleanerTrashCollision(trash);
        });

        this.trashesCollisions(trashes);

        for (const trash of trashes) {
            trash.mesh.position.copy(trash.collider.center);
        }
    }
}

export default Trash;

