import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { loadingManager } from "/js/lib/loading-manager.js"

// Load

const loader = new GLTFLoader(loadingManager)

export const table = (scene) => loader.load(
    "/models/table_1900s/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(1, 1, 1)
        model.position.set(0.81, -0.69, 5.31)
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)

// const texture = new THREE.TextureLoader().load("/assets/textures/images.jpeg")
// const textureMaterial = new THREE.MeshBasicMaterial({ map: texture })

// export const table = new THREE.Mesh(
//     new THREE.BoxGeometry(5, 1, 2),
//     textureMaterial
// )

// table.position.set(1, -1, 5.3)
