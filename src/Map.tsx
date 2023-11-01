import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';

class Map {
    position: THREE.Vector3;     // 初期位置
    model: THREE.Object3D;
    mapBox: THREE.Box3;

    constructor() {
        this.position = new THREE.Vector3();
        this.model = new THREE.Object3D();
        this.mapBox = new THREE.Box3();
    }

    /**
     * 初期化メソッド
     * 初期化時にモデルのロードを非同期で行っている（コンストラクタは非同期で行えないため）
     */
    public static async init(scene: THREE.Scene, octree: Octree) {
        const map = new Map();
        await map.loadModel('room.glb');
        map.mapBox = new THREE.Box3().setFromObject(map.model);
        octree.fromGraphNode(map.model);
        // map.model.traverse(child => {
        //     if (child.isMesh) {
        //         child.castShadow = true;
        //         child.receiveShadow = true;
        //         if (child.material.map) {
        //             child.material.map.anisotropy = 4;
        //         }
        //     }
        // });
        scene.add(map.model);

        // デバッグ用
        const helper = new THREE.Box3Helper(map.mapBox, 0xffff00);
        scene.add(helper);

        return map;
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
}

export default Map;