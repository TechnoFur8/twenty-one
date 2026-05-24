import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js"
import { observationCamera } from "./game/camera/observation"
import { table } from "../public/models/table"
import { isFinished, onGetCard, setWaiting, getWaiting, getPlayerSum, resetGame, applyTrump, getWinTarget, getDealtCards, forceBotCard } from "./game/functions/get-card"
import { getRandomTrumps } from "./game/trumps/trumps"
import { card, label } from "../public/models/card"
import { getBotArr, getBotSum, getBotDealtCards, removeLastBotCard } from "./game/bot/bot"
import { boxs } from "../public/models/box"
import { bigTvRight, smallTvInBox, smalTv, tvInBox } from "../public/models/tv"
import { painting } from "../public/models/painting"
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

const SPACING = 0.3
const START_X = -0.7

const cardCubes = []
const botCardCubes = []
const botCardLabels = []
let enemyLabel = null
let fakeCard = null
let fakeCardLabel = null
let firstBotCard = null
let firstBotCardValue = null
let playerFakeCard = null
let firstPlayerCard = null
let playerFirstLabel = null
let playerScoreLabel = null
let dealingTrumpCards = []

const sidePanel = document.getElementById("side-panel")
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault()
        if (document.getElementById("loading-overlay").style.display === "none") {
            sidePanel.classList.toggle("open")
        }
    }
})

// ── Раунды ──

const TOTAL_ROUNDS = 5
let currentRound = 1
let playerWins = 0
let botWins = 0

function updateRoundHUD() {
    document.getElementById("round-num").textContent = currentRound
    document.getElementById("player-wins").textContent = playerWins
    document.getElementById("bot-wins").textContent = botWins
}

function clearScene() {
    cardCubes.forEach(c => scene.remove(c))
    cardCubes.length = 0
    botCardCubes.forEach(c => scene.remove(c))
    botCardCubes.length = 0
    botCardLabels.forEach(l => scene.remove(l))
    botCardLabels.length = 0
    if (enemyLabel)      { scene.remove(enemyLabel);      enemyLabel = null }
    if (fakeCard)        { scene.remove(fakeCard);        fakeCard = null }
    if (fakeCardLabel)   { scene.remove(fakeCardLabel);   fakeCardLabel = null }
    if (playerFakeCard)  { scene.remove(playerFakeCard);  playerFakeCard = null }
    if (playerFirstLabel){ scene.remove(playerFirstLabel);playerFirstLabel = null }
    if (playerScoreLabel){ scene.remove(playerScoreLabel);playerScoreLabel = null }
    dealingTrumpCards.forEach(c => scene.remove(c))
    dealingTrumpCards = []
    firstBotCard = null
    firstBotCardValue = null
    firstPlayerCard = null
    const el = document.getElementById("score")
    el.textContent = "0"
    el.style.color = ""
}

function showFinalScreen() {
    let title, score
    if (playerWins > botWins)      title = "Вы победили!"
    else if (botWins > playerWins) title = "Бот победил!"
    else                           title = "Ничья!"
    score = `${playerWins} : ${botWins}`
    document.getElementById("final-title").textContent = title
    document.getElementById("final-score").textContent = score
    document.getElementById("final-screen").classList.add("visible")
    setTimeout(() => window.location.href = "/", 4000)
}

// ── Trump inventory ──

let trumpInventory = []

function renderTrumpInventory() {
    const container = document.getElementById("trump-inventory")
    container.innerHTML = ""
    if (trumpInventory.length === 0) {
        container.innerHTML = '<p class="no-trumps">Нет козырей</p>'
        return
    }
    trumpInventory.forEach((trump, idx) => {
        const el = document.createElement("div")
        el.className = "inv-trump"
        el.innerHTML = `
            <img src="${trump.texture}" alt="${trump.name}">
            <div class="inv-trump-info">
                <p class="inv-trump-name">${trump.name}</p>
                <p class="inv-trump-desc">${trump.desc}</p>
            </div>
        `
        el.addEventListener("click", () => useTrump(idx))
        container.appendChild(el)
    })
}

function showTrumpOnTable(texture) {
    const trumpCard = card(texture)
    trumpCard.position.set(5, -0.68, 5.35)
    trumpCard.rotation.y = 0
    scene.add(trumpCard)

    gsap.to(trumpCard.position, { x: 0, y: -0.68, z: 5.35, duration: 0.5, ease: "power2.out" })
    gsap.to(trumpCard.rotation, { y: "+=" + Math.PI * 2, duration: 0.5, ease: "power2.out" })

    setTimeout(() => {
        gsap.to(trumpCard.position, {
            y: 1.5,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => scene.remove(trumpCard)
        })
    }, 1500)
}

function updatePlayerScoreVisual(sum) {
    if (playerScoreLabel) scene.remove(playerScoreLabel)
    playerScoreLabel = label(`${sum} / ${getWinTarget()}`, 0.1)
    playerScoreLabel.position.set(START_X - 0.6, -0.48, 6)
    scene.add(playerScoreLabel)
    const el = document.getElementById("score")
    el.textContent = sum
    if (sum > getWinTarget()) el.style.color = "red"
    else if (sum === getWinTarget()) el.style.color = "green"
    else el.style.color = ""
}

function addBotCardVisual(botNewCard) {
    const botCardCube = card(botNewCard)
    const targetX = START_X + botCardCubes.length * SPACING
    botCardCubes.push(botCardCube)

    if (botCardCubes.length === 1) {
        firstBotCard = botCardCube
        firstBotCardValue = botNewCard
        botCardCube.position.set(targetX, -0.68, 4.7)
        fakeCard = card("?")
        fakeCard.position.set(5, -0.68, 4.7)
        fakeCard.rotation.y = 0
        scene.add(fakeCard)
        gsap.to(fakeCard.position, { x: targetX, y: -0.68, z: 4.7, duration: 0.5, ease: "power2.out" })
        gsap.to(fakeCard.rotation, {
            y: "+=" + Math.PI * 2, duration: 0.5, ease: "power2.out",
            onComplete: () => {
                fakeCardLabel = label("?", 0.08)
                fakeCardLabel.position.set(targetX, -0.45, 4.7)
                scene.add(fakeCardLabel)
            }
        })
    } else {
        botCardCube.position.set(5, -0.68, 4.7)
        botCardCube.rotation.y = Math.PI
        scene.add(botCardCube)
        gsap.to(botCardCube.position, { x: targetX, y: -0.68, z: 4.7, duration: 0.5, ease: "power2.out" })
        gsap.to(botCardCube.rotation, {
            y: "+=" + Math.PI * 2, duration: 0.5, ease: "power2.out",
            onComplete: () => {
                const cardLabel = label(String(botNewCard), 0.08)
                cardLabel.position.set(targetX, -0.45, 4.7)
                botCardLabels.push(cardLabel)
                scene.add(cardLabel)
            }
        })
        if (enemyLabel) scene.remove(enemyLabel)
        const botsCard = getBotArr()
        const firstPos = botCardCubes[0].position
        enemyLabel = label(`?+${botsCard}/${getWinTarget()}`, 0.1)
        enemyLabel.position.set(firstPos.x - 0.3, firstPos.y + 0.2, firstPos.z)
        scene.add(enemyLabel)
    }
}

function useTrump(idx) {
    if (isFinished() || getWaiting()) return
    const trump = trumpInventory[idx]

    showTrumpOnTable(trump.texture)

    const result = applyTrump(trump)

    switch (result.type) {
        case 'card':
            addPlayerCardVisual(result.card, result.sum)
            break

        case 'hush':
            // Карта добавлена в dealtCards, но показываем как "?"
            addPlayerCardVisual("?", result.sum)
            break

        case 'winTarget':
            // Обновляем текущий лейбл счёта
            updatePlayerScoreVisual(getPlayerSum())
            break

        case 'bet':
        case 'bloodshed':
            // TODO: показать UI ставки
            break

        case 'bless':
            // Флаг активен, работает при конце раунда
            break

        case 'return': {
            // Убрать последний куб карты игрока
            if (cardCubes.length > 1) {
                const last = cardCubes.pop()
                scene.remove(last)
            }
            updatePlayerScoreVisual(result.sum)
            break
        }

        case 'refresh': {
            // Очистить все карты игрока и показать 2 новых
            cardCubes.forEach(c => scene.remove(c))
            cardCubes.length = 0
            if (playerFakeCard)   { scene.remove(playerFakeCard);   playerFakeCard = null }
            if (playerFirstLabel) { scene.remove(playerFirstLabel); playerFirstLabel = null }
            if (playerScoreLabel) { scene.remove(playerScoreLabel); playerScoreLabel = null }
            firstPlayerCard = null
            let runningSum = 0
            result.cards.forEach(c => {
                runningSum += c
                addPlayerCardVisual(c, runningSum)
            })
            break
        }

        case 'remove': {
            const removed = removeLastBotCard()
            if (removed && botCardCubes.length > 1) {
                const last = botCardCubes.pop()
                scene.remove(last)
                if (botCardLabels.length > 0) {
                    scene.remove(botCardLabels.pop())
                }
                if (enemyLabel) scene.remove(enemyLabel)
                const botsCard = getBotArr()
                const firstPos = botCardCubes[0].position
                enemyLabel = label(`?+${botsCard}/${getWinTarget()}`, 0.1)
                enemyLabel.position.set(firstPos.x - 0.3, firstPos.y + 0.2, firstPos.z)
                scene.add(enemyLabel)
            }
            break
        }

        case 'disservice': {
            setWaiting(true)
            updateTurnLabels("Ход бота...", scene)
            setTimeout(() => {
                const botResult = forceBotCard()
                if (botResult !== null) {
                    addBotCardVisual(botResult[0])
                }
                setWaiting(false)
                updateTurnLabels("Ваш ход", scene)
            }, 1000)
            break
        }

        case 'exchange': {
            const playerCards = getDealtCards()
            const botCards = getBotDealtCards()
            const playerReal = playerCards.filter(c => c !== "skip")
            const botReal = botCards.filter(c => c !== "skip")
            if (playerReal.length > 1 && botReal.length > 1) {
                let pIdx = -1, bIdx = -1
                for (let i = playerCards.length - 1; i >= 0; i--) {
                    if (playerCards[i] !== "skip") { pIdx = i; break }
                }
                for (let i = botCards.length - 1; i >= 0; i--) {
                    if (botCards[i] !== "skip") { bIdx = i; break }
                }
                const tmp = playerCards[pIdx]
                playerCards[pIdx] = botCards[bIdx]
                botCards[bIdx] = tmp
                updatePlayerScoreVisual(getPlayerSum())
            }
            break
        }

        case 'reincarnation':
            trumpInventory.push(result.trump)
            break

        case 'friendship': {
            const newTrumps = getRandomTrumps(2)
            trumpInventory.push(...newTrumps)
            break
        }

        case 'destroy':
        case 'none':
        default:
            break
    }

    trumpInventory.splice(idx, 1)
    renderTrumpInventory()
    sidePanel.classList.remove("open")
}

function dealAndStartRound() {
    if (currentRound === 1) {
        runRound()
        return
    }

    const newTrumps = getRandomTrumps(2)

    function dealTrumpCard(texturePath, targetX, targetZ, delaySeconds) {
        const trumpCard = card(texturePath)
        trumpCard.position.set(5, -0.68, targetZ)
        trumpCard.rotation.y = 0
        scene.add(trumpCard)
        dealingTrumpCards.push(trumpCard)
        gsap.to(trumpCard.position, {
            x: targetX, y: -0.68, z: targetZ,
            duration: 0.5,
            delay: delaySeconds,
            ease: "power2.out"
        })
        gsap.to(trumpCard.rotation, {
            y: "+=" + Math.PI * 2,
            duration: 0.5,
            delay: delaySeconds,
            ease: "power2.out"
        })
    }

    dealTrumpCard(newTrumps[0].texture, START_X,           6,   0)
    dealTrumpCard(newTrumps[1].texture, START_X + SPACING, 6,   0.2)
    dealTrumpCard("?",                  START_X,           4.7, 0.1)
    dealTrumpCard("?",                  START_X + SPACING, 4.7, 0.3)

    setTimeout(() => {
        const snapshot = dealingTrumpCards.splice(0)
        snapshot.forEach(c => {
            gsap.to(c.position, {
                y: 1.5,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => scene.remove(c)
            })
        })
        trumpInventory.push(...newTrumps)
        renderTrumpInventory()
        setTimeout(runRound, 500)
    }, 1500)
}

function onRoundEnd(winner) {
    if (winner === "player") playerWins++
    else if (winner === "bot") botWins++

    const statsKey = winner === "player" ? "wins" : winner === "bot" ? "losses" : "draws"
    const s = JSON.parse(localStorage.getItem("21_stats") || '{"wins":0,"losses":0,"draws":0}')
    s[statsKey]++
    localStorage.setItem("21_stats", JSON.stringify(s))

    if (currentRound >= TOTAL_ROUNDS) {
        setTimeout(showFinalScreen, 2000)
    } else {
        setTimeout(() => {
            currentRound++
            clearScene()
            resetGame()
            updateRoundHUD()
            dealAndStartRound()
        }, 500)
    }
}

function addPlayerCardVisual(newCard, sumCard) {
    const cardCube = card(newCard)
    const targetX = START_X + cardCubes.length * SPACING
    cardCubes.push(cardCube)

    if (cardCubes.length === 1) {
        firstPlayerCard = cardCube
        cardCube.position.set(targetX, -0.68, 6)

        playerFakeCard = card("?")
        playerFakeCard.position.set(5, -0.68, 6)
        playerFakeCard.rotation.y = 0
        scene.add(playerFakeCard)
        gsap.to(playerFakeCard.position, { x: targetX, y: -0.68, z: 6, duration: 0.5, ease: "power2.out" })
        gsap.to(playerFakeCard.rotation, {
            y: "+=" + Math.PI * 2, duration: 0.5, ease: "power2.out",
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
        gsap.to(cardCube.position, { x: targetX, y: -0.68, z: 6, duration: 0.5, ease: "power2.out" })
        gsap.to(cardCube.rotation, { y: "+=" + Math.PI * 2, duration: 0.5, ease: "power2.out" })
    }

    if (playerScoreLabel) scene.remove(playerScoreLabel)
    playerScoreLabel = label(`${sumCard} / ${getWinTarget()}`, 0.1)
    playerScoreLabel.position.set(START_X - 0.6, -0.48, 6)
    scene.add(playerScoreLabel)

    const element = document.getElementById("score")
    element.textContent = sumCard
    if (sumCard > getWinTarget()) element.style.color = "red"
    else if (sumCard === getWinTarget()) element.style.color = "green"
    else element.style.color = ""
}

function runRound() {
onGetCard((result, botResult, finishGame) => {
    if (result !== null) {
        const [newCard, sumCard] = result
        addPlayerCardVisual(newCard, sumCard)
    }

    if (finishGame) {
        setTimeout(() => {
            scene.remove(fakeCard)
            if (fakeCardLabel) scene.remove(fakeCardLabel)
            scene.add(firstBotCard)
            const firstBotLabel = label(String(firstBotCardValue), 0.08)
            firstBotLabel.position.set(botCardCubes[0].position.x, -0.45, 4.7)
            scene.add(firstBotLabel)

            scene.remove(playerFakeCard)
            if (playerFirstLabel) scene.remove(playerFirstLabel)
            scene.add(firstPlayerCard)

            if (enemyLabel) scene.remove(enemyLabel)
            const firstPos = botCardCubes[0].position
            enemyLabel = label(`${getBotSum()} / ${getWinTarget()}`, 0.1)
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
            const targetX = START_X + botCardCubes.length * SPACING

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
                    ease: "power2.out",
                    onComplete: () => {
                        fakeCardLabel = label("?", 0.08)
                        fakeCardLabel.position.set(targetX, -0.45, 4.7)
                        scene.add(fakeCardLabel)
                    }
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
                enemyLabel = label(`?+${botsCard}/${getWinTarget()}`, 0.1)
                enemyLabel.position.set(firstPos.x - 0.3, firstPos.y + 0.2, firstPos.z)
                scene.add(enemyLabel)
            }
            setWaiting(false)
            updateTurnLabels("Ваш ход", scene)
        }, 2000)
    }

}, onRoundEnd, scene)
} // runRound

dealAndStartRound()

// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)


// телевизор

table(scene)
bigTvRight(scene)
// smalTv(scene)

// boxs(scene)
// tvInBox(scene)
// smallTvInBox(scene)

painting(scene)

function animate() {
    requestAnimationFrame(animate)
    // controls.update()
    renderer.render(scene, camera)
}

animate()
