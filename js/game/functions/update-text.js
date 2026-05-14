import { label } from "../../../assets/models/card.js"

let tvLabels = []

export function updateTurnLabels(text, scene) {
    tvLabels.forEach(l => scene.remove(l))
    tvLabels = []

    const l1 = label(text, 0.2)
    l1.position.set(2.5, 0.3, 0.6)
    scene.add(l1)
    tvLabels.push(l1)

    const l2 = label(text, 0.09)
    l2.position.set(2, 1.5, 0.5)
    l2.rotation.z = Math.PI / -2
    scene.add(l2)
    tvLabels.push(l2)

    const l3 = label(text, 0.12)
    l3.scale.x = -1
    l3.rotation.x = Math.PI / -3.4
    l3.rotation.y = Math.PI + Math.PI / 8
    l3.position.set(-2.5, -0.4, 0)
    scene.add(l3)
    tvLabels.push(l3)

    const l4 = label(text, 0.05)
    l4.position.set(-1.5, -0.1, -0.1)
    scene.add(l4)
    tvLabels.push(l4)
}