import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { loadingManager } from "/js/lib/loading-manager.js"

const loader = new GLTFLoader(loadingManager)

export const painting = (scene) => loader.load(
    "/models/painting_by_zdzislaw_beksinski_3/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(0.5, 0.5, 0.5)
        model.position.set(-5, -0.8, -1)
        model.rotation.y = -Math.PI / -4
        model.rotation.x = Math.PI / 5
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)
