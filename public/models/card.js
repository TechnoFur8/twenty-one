import * as THREE from "three"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"

const font = await new FontLoader().loadAsync("/fonts/Roboto_Regular.json")
const textureLoader = new THREE.TextureLoader()

function roundedRect(width, height, radius) {
    const w = width / 2, h = height / 2
    const shape = new THREE.Shape()
    shape.moveTo(-w + radius, -h)
    shape.lineTo(w - radius, -h)
    shape.quadraticCurveTo(w, -h, w, -h + radius)
    shape.lineTo(w, h - radius)
    shape.quadraticCurveTo(w, h, w - radius, h)
    shape.lineTo(-w + radius, h)
    shape.quadraticCurveTo(-w, h, -w, h - radius)
    shape.lineTo(-w, -h + radius)
    shape.quadraticCurveTo(-w, -h, -w + radius, -h)
    const geom = new THREE.ShapeGeometry(shape)
    const pos = geom.attributes.position
    const uv = geom.attributes.uv
    for (let i = 0; i < pos.count; i++) {
        uv.setXY(i, (pos.getX(i) + w) / width, (pos.getY(i) + h) / height)
    }
    return geom
}

export function label(text, size = 0.035) {
    const geom = new TextGeometry(text, { font, size, depth: 0.002 })
    geom.center()
    return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: "white" }))
}

export function card(number) {
    const texturePath = number === "?"
        ? "/textures/cards/back.png"
        : typeof number === "string" && number.startsWith("/")
            ? number
            : `/textures/cards/${number}.png`

    const texture = textureLoader.load(texturePath)

    const plane = new THREE.Mesh(
        roundedRect(0.2, 0.3, 0.008),
        new THREE.MeshStandardMaterial({ map: texture })
    )
    plane.rotation.x = -Math.PI / 2

    const group = new THREE.Group()
    group.add(plane)
    return group
}
