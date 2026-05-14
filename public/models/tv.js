import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { loadingManager } from "/js/lib/loading-manager.js"

const loader = new GLTFLoader(loadingManager)

export const bigTvRight = (scene) => loader.load(
    "/models/crt_tv/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(4, 4, 4)
        model.position.set(2.5, -0.8, 0.5)
        model.rotation.y = Math.PI
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)

export const smalTv = (scene) => loader.load(
    "/models/crt_tv/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(2, 2, 2)
        model.position.set(2.5, 1.5, 0.4)
        model.rotation.y = Math.PI
        model.rotation.z = Math.PI / -2
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)

export const tvInBox = (scene) => loader.load(
    "/models/crt_tv/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(3, 3, 3)
        model.position.set(-2.5, -1.3, 0.6)
        model.rotation.x = Math.PI / -3.4
        model.rotation.y = Math.PI + Math.PI / 8
        // model.rotation.z = Math.PI / -2
        // model.rotation.z = Math.PI / -2
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)

export const smallTvInBox = (scene) => loader.load(
    "/models/crt_tv/scene.gltf",
    (gltf) => {
        const model = gltf.scene
        model.scale.set(2, 2, 2)
        model.position.set(-1.5, -0.62 , -0.2)
        model.rotation.y = Math.PI
        // model.rotation.z = Math.PI / -2
        scene.add(model)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% загрузка");
    },
    (err) => {
        console.error(err)
    }
)
