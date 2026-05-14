import * as THREE from "three"

const mouse = new THREE.Vector2()

export function observationCamera(camera)  {
    addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1

        camera.rotation.x = mouse.y * 0.2
        camera.rotation.y = -mouse.x * 0.1
    })
}