import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js"
import { observationCamera } from "./game/camera/observation"
import { table } from "../assets/models/table"
import { isFinished, onGetCard, setWaiting } from "./game/functions/get-card"
import { card, label } from "../assets/models/card"
import { getBotArr, getBotSum } from "./game/bot/bot"
import { boxs } from "../assets/models/box"
import { bigTvRight, smallTvInBox, smalTv, tvInBox } from "../assets/models/tv"
import { painting } from "../assets/models/painting"
import { updateTurnLabels } from "./game/functions/update-text"

// сцена

const scene = new THREE.Scene()
RectAreaLightUniformsLib.init()

// свет

const ambientLight = new THREE.AmbientLight("white", 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight("white", 5, 0, 2)
pointLight.position.set(0, 2, 5)
scene.add(pointLight)

const pointHelper = new THREE.PointLightHelper(pointLight, 0.1)
scene.add(pointHelper)

// свет от телевизоров (плоский, как экран)

const tvColor = "#6688ff"

const bigTvLight = new THREE.RectAreaLight(tvColor, 8, 1.5, 1.1)
bigTvLight.position.set(2.5, 0.3, 0.6)
bigTvLight.rotation.y = Math.PI
scene.add(bigTvLight)
scene.add(new RectAreaLightHelper(bigTvLight))

const smalTvLight = new THREE.RectAreaLight(tvColor, 6, 0.8, 0.6)
smalTvLight.position.set(2, 1.5, 0.5)
smalTvLight.rotation.y = Math.PI
smalTvLight.rotation.z = Math.PI / -2
scene.add(smalTvLight)
scene.add(new RectAreaLightHelper(smalTvLight))

const tvInBoxLight = new THREE.RectAreaLight(tvColor, 6, 1.0, 0.8)
tvInBoxLight.position.set(-2.5, -0.4, -0)
tvInBoxLight.rotation.x = Math.PI / -3.4
tvInBoxLight.rotation.y = Math.PI + Math.PI / 8
scene.add(tvInBoxLight)
scene.add(new RectAreaLightHelper(tvInBoxLight))

const smallTvInBoxLight = new THREE.RectAreaLight(tvColor, 4, 0.7, 0.5)
smallTvInBoxLight.position.set(-1.5, -0.1, -0.1)
smallTvInBoxLight.rotation.y = Math.PI
scene.add(smallTvInBoxLight)
scene.add(new RectAreaLightHelper(smallTvInBoxLight))

updateTurnLabels("Ваш ход", scene)

// камера


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
)

camera.position.z = 7

observationCamera(camera)

// рендер

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// const controls = new OrbitControls(camera, renderer.domElement)

// опонент

const box = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: "red" }),
)
box.position.set(0, 0, 3.8)
scene.add(box)

// логика взятие карт

const cardCubes = []
const botCardCubes = []
const botCardLabels = []
let enemyLabel = null
let fakeCard = null
let firstBotCard = null
let firstBotCardValue = null
let playerFakeCard = null
let firstPlayerCard = null
let playerFirstLabel = null
let playerScoreLabel = null

onGetCard((result, botResult, finishGame) => {
    const spacing = 0.3
    const startX = 0 - 0.7

    if (result !== null) {
        const [newCard, sumCard] = result
        const cardCube = card(newCard)
        const targetX = startX + cardCubes.length * spacing
        cardCubes.push(cardCube)

        if (cardCubes.length === 1) {
            firstPlayerCard = cardCube
            cardCube.position.set(targetX, -0.68, 6)

            playerFakeCard = card("?")
            playerFakeCard.position.set(5, -0.68, 6)
            playerFakeCard.rotation.y = 0
            scene.add(playerFakeCard)
            gsap.to(playerFakeCard.position, {
                x: targetX, y: -0.68, z: 6,
                duration: 0.5, ease: "power2.out"
            })
            gsap.to(playerFakeCard.rotation, {
                y: "+=" + Math.PI * 2,
                duration: 0.5, ease: "power2.out",
                onComplete: () => {
                    playerFirstLabel = label(String(newCard), 0.08)
                    playerFirstLabel.position.set(targetX, -0.45, 6)
                    scene.add(playerFirstLabel)
                }
            })
        } else {
            cardCube.position.set(5, -0.68, 6)
            cardCube.rotation.y = 0
            scene.add(cardCube)
            gsap.to(cardCube.position, {
                x: targetX, y: -0.68, z: 6,
                duration: 0.5, ease: "power2.out"
            })
            gsap.to(cardCube.rotation, {
                y: "+=" + Math.PI * 2,
                duration: 0.5, ease: "power2.out"
            })
        }

        if (playerScoreLabel) scene.remove(playerScoreLabel)
        playerScoreLabel = label(`${sumCard} / 21`, 0.1)
        playerScoreLabel.position.set(startX - 0.6, -0.48, 6)
        scene.add(playerScoreLabel)

        const element = document.getElementById("score")
        element.textContent = sumCard
        switch (true) {
            case (sumCard > 21):
                element.style.color = "red"
                break
            case (sumCard === 21):
                element.style.color = "green"
                break
        }
    }

    if (finishGame) {
        setTimeout(() => {
            scene.remove(fakeCard)
            scene.add(firstBotCard)
            const firstBotLabel = label(String(firstBotCardValue), 0.08)
            firstBotLabel.position.set(botCardCubes[0].position.x, -0.45, 4.7)
            scene.add(firstBotLabel)

            scene.remove(playerFakeCard)
            if (playerFirstLabel) scene.remove(playerFirstLabel)
            scene.add(firstPlayerCard)

            if (enemyLabel) scene.remove(enemyLabel)
            const firstPos = botCardCubes[0].position
            enemyLabel = label(`${getBotSum()} / 21`, 0.1)
            enemyLabel.position.set(firstPos.x - 0.3, firstPos.y + 0.2, firstPos.z)
            scene.add(enemyLabel)
        }, 2000)
    }

    if (botResult !== null) {
        setWaiting(true)
        updateTurnLabels("Ход бота...", scene)
        setTimeout(() => {
            const [botNewCard] = botResult

            const botCardCube = card(botNewCard)
            const targetX = startX + botCardCubes.length * spacing

            botCardCubes.push(botCardCube)

            if (botCardCubes.length === 1) {
                firstBotCard = botCardCube
                firstBotCardValue = botNewCard
                botCardCube.position.set(targetX, -0.68, 4.7)
                fakeCard = card("?")
                fakeCard.position.set(5, -0.68, 4.7)
                fakeCard.rotation.y = 0
                scene.add(fakeCard)
                gsap.to(fakeCard.position, {
                    x: targetX,
                    y: -0.68,
                    z: 4.7,
                    duration: 0.5,
                    ease: "power2.out"
                })
                gsap.to(fakeCard.rotation, {
                    y: "+=" + Math.PI * 2,
                    duration: 0.5,
                    ease: "power2.out"
                })
            } else {
                botCardCube.position.set(5, -0.68, 4.7)
                botCardCube.rotation.y = Math.PI
                scene.add(botCardCube)
                gsap.to(botCardCube.position, {
                    x: targetX,
                    y: -0.68,
                    z: 4.7,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        const cardLabel = label(String(botNewCard), 0.08)
                        cardLabel.position.set(targetX, -0.45, 4.7)
                        botCardLabels.push(cardLabel)
                        scene.add(cardLabel)
                    }
                })
                gsap.to(botCardCube.rotation, {
                    y: "+=" + Math.PI * 2,
                    duration: 0.5,
                    ease: "power2.out"
                })

                if (enemyLabel) scene.remove(enemyLabel)
                const botsCard = getBotArr()
                const firstPos = botCardCubes[0].position
                enemyLabel = label(`?+${botsCard}/21`, 0.1)
                enemyLabel.position.set(firstPos.x - 0.3, firstPos.y + 0.2, firstPos.z)
                scene.add(enemyLabel)
            }
            setWaiting(false)
            updateTurnLabels("Ваш ход", scene)
        }, 2000)
    }

}, null, scene)

// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)


// телевизор

table(scene)
bigTvRight(scene)
smalTv(scene)

boxs(scene)
tvInBox(scene)
smallTvInBox(scene)

painting(scene)

function animate() {
    requestAnimationFrame(animate)
    // controls.update()
    renderer.render(scene, camera)
}

animate()
