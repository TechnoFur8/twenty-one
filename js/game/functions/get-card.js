import { botGetCard, getBotSum } from "../bot/bot";
import { updateTurnLabels } from "./update-text";

export const deck = Array.from({ length: 11 }, (_, i) => i + 1)

for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
}

const dealtCards = []
let playerPassed = false
let finishGame = false
let isWaiting = false

export function setWaiting(val) { isWaiting = val }

export function isFinished() { return finishGame }

export function getPlayerSum() {
    return dealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
}

export function getCard() {
    if (deck.length === 0) return null

    const currentSum = dealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)

    if (currentSum >= 21) {
        dealtCards.push("skip")
        alert("Вы превысили лимит взятия карт, вы не можете взять еще одну карту")
        return null
    }

    const card = deck.pop()
    dealtCards.push(card)

    return [card, currentSum + card]
}

export function onPasCard() {

}

export function onGetCard(callback, onGameEnd, scene) {
    callback(getCard(), botGetCard())
    callback(getCard(), botGetCard())

    window.addEventListener("dblclick", () => {
        if (isWaiting) return
        const result = getCard()
        const botResult = botGetCard()
        callback(result, botResult, false)
    })

    let lastRightClick = 0
    window.addEventListener("contextmenu", (e) => {
        e.preventDefault()
        const now = Date.now()
        if (now - lastRightClick < 300) {
            playerPassed = true

            const botResult = botGetCard()

            if (botResult === null && playerPassed) {
                const playerSum = getPlayerSum()
                const botSum = getBotSum()

                const playerDiff = Math.abs(21 - playerSum)
                const botDiff = Math.abs(21 - botSum)

                updateTurnLabels("И выйграл...", scene)
                setTimeout(() => {
                    if (playerSum > 21) {
                        updateTurnLabels("Враг", scene)
                        finishGame = true
                    } else if (botSum > 21) {
                        updateTurnLabels("Ты", scene)
                        finishGame = true
                    } else if (playerDiff < botDiff) {
                        updateTurnLabels("Ты", scene)
                        finishGame = true
                    } else if (botDiff < playerDiff) {
                        updateTurnLabels("Враг", scene)
                        finishGame = true   
                    } else {
                        updateTurnLabels("Ничья", scene)
                        finishGame = true
                    }
                }, 2000)

                callback(null, null, true)
                setTimeout(() => location.reload(), 4000)
                return
            }

            callback(null, botResult, false)

            lastRightClick = 0
        } else {
            lastRightClick = now
        }
    })
}

