import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class Map {
    position: THREE.Vector3;     // 初期位置
    model: THREE.Object3D;

    constructor() {
        this.position = new THREE.Vector3(0, 0, 0);
        this.model = new THREE.Object3D;
    }

    /**
     * 初期化メソッド
     * 初期化時にモデルのロードを非同期で行っている（コンストラクタは非同期で行えないため）
     */
    public static async init() {
        const map = new Map();
        await map.loadModel('room.glb');
        return map;
    }

    /**
     * モデルのロードメソッド
     * DRACOLoaderで圧縮している
     */
    async loadModel(path:string) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('draco/');
        loader.setDRACOLoader(dracoLoader);
        const gltf = await loader.loadAsync(path);
        this.model = gltf.scene;
    }
}

export default Map;