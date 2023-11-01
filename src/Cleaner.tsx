import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class Cleaner {
    velocity: THREE.Vector3;
    speed: number;               // 移動速度
    rotationSpeed: number;       // 回転速度
    keys: {
        forward: boolean,
        backward: boolean,
        left: boolean,
        right: boolean,
    };
    model: THREE.Object3D;
    cameraBox: THREE.Object3D;
    collider: Capsule;
    isOnFloor: boolean;

    constructor() {
        this.velocity = new THREE.Vector3();
        this.speed = 0.1;
        this.rotationSpeed = 0.01;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };
        this.setKey();
        this.model = new THREE.Object3D;
        this.cameraBox = new THREE.Object3D;
        this.collider = new Capsule;
        this.isOnFloor = false;
    }

    /**
     * 初期化メソッド
     * 初期化時にモデルのロードを非同期で行っている（コンストラクタは非同期で行えないため）
     */
    public static async init(scene: THREE.Scene, camera: THREE.Camera) {
        const cleaner = new Cleaner();
        //await cleaner.loadModel('roomba.glb');

        // 仮モデル使用
        const geometry = new THREE.CylinderGeometry(3, 3, 1, 12);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cleaner.model = new THREE.Mesh(geometry, material);
        cleaner.model.scale.setScalar(0.03);

        cleaner.setCapsule(scene);
        scene.add(cleaner.model);
        cleaner.setCamera(camera);
        scene.add(cleaner.cameraBox);
        cleaner.model.attach(cleaner.cameraBox);
        cleaner.model.position.set(0, 1, 0.6);
        cleaner.cameraControl();

        return cleaner;
    }

    /**
     * モデルのロードメソッド
     * DRACOLoaderで圧縮している
     */
    async loadModel(path: string) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('draco/');
        loader.setDRACOLoader(dracoLoader);
        const gltf = await loader.loadAsync(path);
        this.model = gltf.scene;
    }

    /**
     * クリーナー操作用キーイベントをセット
     */
    setKey() {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "w":
                    this.keys.forward = true;
                    break;
                case "a":
                    this.keys.left = true;
                    break;
                case "s":
                    this.keys.backward = true;
                    break;
                case "d":
                    this.keys.right = true;
                    break;
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.key) {
                case "w":
                    this.keys.forward = false;
                    break;
                case "a":
                    this.keys.left = false;
                    break;
                case "s":
                    this.keys.backward = false;
                    break;
                case "d":
                    this.keys.right = false;
                    break;
            }
        }
        document.addEventListener('keydown', (e) => onKeyDown(e), false);
        document.addEventListener('keyup', (e) => onKeyUp(e), false);
    }

    setCapsule(scene) {
        const bbox = new THREE.Box3().setFromObject(this.model);
        const helper = new THREE.Box3Helper(bbox, 0xffff00);
        //scene.add(helper);

        // バウンディングボックスの次元を取得します
        const size = bbox.getSize(new THREE.Vector3());

        // カプセルの開始点と終了点を決定します
        const start = new THREE.Vector3(0, -size.y / 2, 0);
        const end = new THREE.Vector3(0, size.y / 2, 0);

        // カプセルの半径を決定します（バウンディングボックスの幅と奥行きの最大値の半分とします）
        const radius = Math.max(size.x, size.y) / 2;

        // 新しいカプセルを作成します
        this.collider = new Capsule(start, end, radius);
    }

    /**
     * モデルの移動制御
     */
    control(deltaTime: number) {
        const speedDelta = deltaTime * (this.isOnFloor ? 25 : 8) * this.speed;

        const cleanerDirection = new THREE.Vector3();
        this.model.getWorldDirection(cleanerDirection);

        // 前進
        if (this.keys.forward) {
            this.velocity.add(cleanerDirection.multiplyScalar(speedDelta));
        }

        // 後進
        if (this.keys.backward) {
            this.velocity.add(cleanerDirection.multiplyScalar(-speedDelta));
        }

        // 左回転
        if (this.keys.left) {
            this.model.rotation.y += this.rotationSpeed;
        }

        // 右回転
        if (this.keys.right) {
            this.model.rotation.y -= this.rotationSpeed;
        }

        //   if (playerOnFloor) {
        //     if (keyStates['Space']) {
        //       playerVelocity.y = 15;
        //     }
        //   }
    }

    /**
     * カメラをセット
     * @param camera 
     */
    setCamera(camera: THREE.Camera) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.cameraBox = new THREE.Mesh(geometry, material);
        this.cameraBox.visible = false;
        camera.position.set(0, 0.3, 0.5); // 引数に対応させる?
        this.cameraBox.attach(camera);
        this.cameraBox.rotateY(-Math.PI)
    }

    /**
     * カメラ制御
     */
    cameraControl() {
        const pointerControl = (event: PointerEvent) => {
            if (document.pointerLockElement === document.body) {
                const rotationSpeed = 0.01;
                const maxRotationX = Math.PI / 3; // 上向きに回転させないための制限

                const cameraBoxEuler = new THREE.Euler(0, 0, 0, 'YXZ');
                cameraBoxEuler.setFromQuaternion(this.cameraBox.quaternion);
                cameraBoxEuler.y -= event.movementX * rotationSpeed;
                cameraBoxEuler.x -= event.movementY * rotationSpeed;
                cameraBoxEuler.x = Math.max(-maxRotationX, Math.min(maxRotationX, cameraBoxEuler.x));
                this.cameraBox.setRotationFromEuler(cameraBoxEuler)
            }
        };
        document.addEventListener('pointermove', (e) => pointerControl(e), false);
    }

    /**
     * クリーナーの衝突判定
     * @param worldOctree 
     */
    cleanerCollisions(worldOctree: Octree) {
        const result = worldOctree.capsuleIntersect(this.collider);
        this.isOnFloor = false;
        if (result) {
            this.isOnFloor = result.normal.y > 0;
            if (!this.isOnFloor) {
                this.velocity.addScaledVector(result.normal, - result.normal.dot(this.velocity));
            }
            this.collider.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    /**
     * 
     * @param deltaTime クリーナーの情報を更新
     * @param worldOctree 
     */
    updateCleaner(deltaTime: number, worldOctree: Octree) {
        const GRAVITY = 30;
        let damping = Math.exp(- 4 * deltaTime) - 1;

        if (!this.isOnFloor) {
            this.velocity.y -= GRAVITY * deltaTime;
            // small air resistance
            damping *= 0.1;
        }

        this.velocity.addScaledVector(this.velocity, damping);

        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.collider.translate(deltaPosition);
        this.cleanerCollisions(worldOctree);

        // モデルの位置を調整
        const cleanerPosition = new THREE.Vector3();
        cleanerPosition.copy(this.collider.start).add(new THREE.Vector3(0, -0.07, 0))
        this.model.position.copy(cleanerPosition);
    }

    /**
     * ゴミとの衝突判定
     * @param trash 
     */
    cleanerTrashCollision(trash) {
        const vector1 = new THREE.Vector3();
        const vector2 = new THREE.Vector3();
        const vector3 = new THREE.Vector3();

        const center = vector1.addVectors(this.collider.start, this.collider.end).multiplyScalar(0.5);
        const sphere_center = trash.collider.center;
        const r = this.collider.radius + trash.collider.radius;
        const r2 = r * r;
        // approximation: player = 3 spheres
        for (const point of [this.collider.start, this.collider.end, center]) {
            const d2 = point.distanceToSquared(sphere_center);
            if (d2 < r2) {
                trash.mesh.removeFromParent();
                // const normal = vector1.subVectors(point, sphere_center).normalize();
                // const v1 = vector2.copy(normal).multiplyScalar(normal.dot(this.velocity));
                // const v2 = vector3.copy(normal).multiplyScalar(normal.dot(trash.velocity));
                // this.velocity.add(v2).sub(v1);
                // trash.velocity.add(v1).sub(v2);
                // const d = (r - Math.sqrt(d2)) / 2;
                // sphere_center.addScaledVector(normal, - d);
            }
        }
    }

    // let mouseTime = 0;

    // function teleportPlayerIfOob() {
    //   if (camera.position.y <= - 25) {
    //     playerCollider.start.set(0, 0.35, 0);
    //     playerCollider.end.set(0, 1, 0);
    //     playerCollider.radius = 0.35;
    //     camera.position.copy(playerCollider.end);
    //     camera.rotation.set(0, 0, 0);
    //   }
    // }

}

export default Cleaner;

