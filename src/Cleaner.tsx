import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class Cleaner {
    position: THREE.Vector3;     // 初期位置
    rotation: THREE.Euler;       // 初期回転
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

    constructor() {
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
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
    }

    /**
     * 初期化メソッド
     * 初期化時にモデルのロードを非同期で行っている（コンストラクタは非同期で行えないため）
     */
    public static async init(scene: THREE.Scene, camera: THREE.Camera) {
        const cleaner = new Cleaner();
        // await cleaner.loadModel('roomba.glb');
        // 仮モデル使用
        const geometry = new THREE.CylinderGeometry(3, 3, 1, 12);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cleaner.model = new THREE.Mesh(geometry, material);
        cleaner.model.scale.setScalar(0.03);
        scene.add(cleaner.model);
        cleaner.setCamera(camera);
        scene.add(cleaner.cameraBox);
        cleaner.model.attach(cleaner.cameraBox);
        cleaner.model.position.set(0, -0.2, -2);
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

    /**
     * モデルの移動制御
     */
    control() {
        const moveVector = new THREE.Vector3(0, 0, -this.speed); // ローカル座標系での移動ベクトル

        // 前進
        if (this.keys.forward) {
            moveVector.applyEuler(this.model.rotation);
            this.model.position.add(moveVector);
        }

        // 後進
        if (this.keys.backward) {
            moveVector.applyEuler(this.model.rotation);
            this.model.position.sub(moveVector);
        }

        // 左回転
        if (this.keys.left) {
            this.model.rotation.y += this.rotationSpeed;
        }

        // 右回転
        if (this.keys.right) {
            this.model.rotation.y -= this.rotationSpeed;
        }
    }

    /**
     * カメラをセット
     * @param camera 
     */
    setCamera(camera: THREE.Camera) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.cameraBox = new THREE.Mesh(geometry, material);
        this.cameraBox.scale.setScalar(0.01);
        camera.position.set(0, 0.3, 0.3);
        this.cameraBox.attach(camera);
    }

    /**
     * カメラ制御
     */
    cameraControl() {
        const pointerControl = (event: PointerEvent) => {
            const rotationSpeed = 0.01;
            const maxRotationX = Math.PI / 3; // 上向きに回転させないための制限
            const cameraBoxEuler = new THREE.Euler(0, 0, 0, 'YXZ');
            cameraBoxEuler.setFromQuaternion(this.cameraBox.quaternion);
            cameraBoxEuler.y -= event.movementX * rotationSpeed;
            cameraBoxEuler.x -= event.movementY * rotationSpeed;
            cameraBoxEuler.x = Math.max(-maxRotationX, Math.min(maxRotationX, cameraBoxEuler.x));
            this.cameraBox.setRotationFromEuler(cameraBoxEuler)
        };
        document.addEventListener('pointermove', (e) => pointerControl(e), false);
    }
}

export default Cleaner;

