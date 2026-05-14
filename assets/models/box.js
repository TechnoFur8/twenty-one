import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { loadingManager } from "/js/lib/loading-manager.js"

const loader = new GLTFLoader(loadingManager)

export const boxs = (scene) => loader.load(
    "/assets/models/set_of_cardboard_boxes/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(3, 3, 3)
        model.position.set(-3, -2.3, -1)
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)