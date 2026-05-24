import { botGetCard, getBotSum, resetBot } from "../bot/bot";
import { updateTurnLabels } from "./update-text";
import { TRUMPS } from "../trumps/trumps";

export const deck = Array.from({ length: 11 }, (_, i) => i + 1)

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
    }
}
shuffleDeck()

const dealtCards = []
let playerPassed = false
let finishGame = false
let isWaiting = false
let WIN_TARGET = 21
let bet = 1
let blessActive = false
let botActiveTrump = null

export function resetGame() {
    deck.splice(0, deck.length)
    for (let i = 1; i <= 11; i++) deck.push(i)
    shuffleDeck()
    dealtCards.splice(0, dealtCards.length)
    playerPassed = false
    finishGame = false
    isWaiting = false
    WIN_TARGET = 21
    bet = 1
    blessActive = false
    botActiveTrump = null
    resetBot()
}

export function setWaiting(val) { isWaiting = val }
export function getWaiting() { return isWaiting }
export function isFinished() { return finishGame }
export function getWinTarget() { return WIN_TARGET }
export function getBet() { return bet }
export function isBlessActive() { return blessActive }
export function getBotActiveTrump() { return botActiveTrump }
export function setBotActiveTrump(trump) { botActiveTrump = trump }
export function getDealtCards() { return dealtCards }

export function getPlayerSum() {
    return dealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
}

export function getCard() {
    if (deck.length === 0) return null

    const currentSum = dealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)

    if (currentSum >= WIN_TARGET) {
        dealtCards.push("skip")
        alert(`Вы превысили лимит взятия карт, вы не можете взять еще одну карту`)
        return null
    }

    const card = deck.pop()
    dealtCards.push(card)
    return [card, currentSum + card]
}

export function forceBotCard() {
    return botGetCard()
}

export function applyTrump(trump) {
    // Козыри id 1-6 — дают карту по value
    if (trump.value !== undefined) {
        const idx = deck.indexOf(trump.value)
        if (idx === -1) return { type: 'none' }
        deck.splice(idx, 1)
        const currentSum = dealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
        dealtCards.push(trump.value)
        return { type: 'card', card: trump.value, sum: currentSum + trump.value }
    }

    switch (trump.name) {
        case 'Go for 17': WIN_TARGET = 17; return { type: 'winTarget', value: 17 }
        case 'Go for 24': WIN_TARGET = 24; return { type: 'winTarget', value: 24 }
        case 'Go for 27': WIN_TARGET = 27; return { type: 'winTarget', value: 27 }

        case 'One-up':  bet += 1; return { type: 'bet', value: bet }
        case 'Two-up':  bet += 2; return { type: 'bet', value: bet }
        case 'Shield':  bet = Math.max(0, bet - 1); return { type: 'bet', value: bet }
        case 'Shield+': bet = Math.max(0, bet - 2); return { type: 'bet', value: bet }

        case 'Bless': blessActive = true; return { type: 'bless' }

        case 'Hush': {
            if (deck.length === 0) return { type: 'none' }
            const c = deck.pop()
            const sum = dealtCards.filter(x => x !== "skip").reduce((a, b) => a + b, 0)
            dealtCards.push(c)
            return { type: 'hush', card: c, sum: sum + c }
        }

        case 'Return': {
            const realCards = dealtCards.filter(c => c !== "skip")
            if (realCards.length <= 1) return { type: 'none' }
            for (let i = dealtCards.length - 1; i >= 0; i--) {
                if (dealtCards[i] !== "skip") {
                    deck.push(dealtCards[i])
                    dealtCards.splice(i, 1)
                    break
                }
            }
            const newSum = dealtCards.filter(c => c !== "skip").reduce((a, b) => a + b, 0)
            return { type: 'return', sum: newSum }
        }

        case 'Refresh': {
            const old = dealtCards.splice(0)
            old.filter(c => c !== "skip").forEach(c => deck.push(c))
            const c1 = deck.pop()
            const c2 = deck.pop()
            if (c1 !== undefined) dealtCards.push(c1)
            if (c2 !== undefined) dealtCards.push(c2)
            const newSum = dealtCards.filter(c => c !== "skip").reduce((a, b) => a + b, 0)
            return { type: 'refresh', cards: [...dealtCards.filter(c => c !== "skip")], sum: newSum }
        }

        case 'Perfect Draw': {
            if (deck.length === 0) return { type: 'none' }
            const best = Math.max(...deck)
            const idx = deck.indexOf(best)
            deck.splice(idx, 1)
            const currentSum = dealtCards.filter(c => c !== "skip").reduce((a, b) => a + b, 0)
            dealtCards.push(best)
            return { type: 'card', card: best, sum: currentSum + best }
        }

        case 'Destroy':
            botActiveTrump = null
            return { type: 'destroy' }

        case 'Bloodshed':
            botActiveTrump = null
            bet += 1
            return { type: 'bloodshed', bet }

        case 'Reincarnation': {
            botActiveTrump = null
            const randomTrump = TRUMPS[Math.floor(Math.random() * TRUMPS.length)]
            return { type: 'reincarnation', trump: randomTrump }
        }

        // Обрабатываются в index.js (нужен доступ к картам бота)
        case 'Remove':      return { type: 'remove' }
        case 'Exchange':    return { type: 'exchange' }
        case 'Disservice':  return { type: 'disservice' }
        case 'Friendship':  return { type: 'friendship' }

        default: return { type: 'none' }
    }
}

let gameAbortController = null

export function onGetCard(callback, onRoundEnd, scene) {
    if (gameAbortController) gameAbortController.abort()
    gameAbortController = new AbortController()
    const { signal } = gameAbortController

    callback(getCard(), botGetCard())
    callback(getCard(), botGetCard())

    window.addEventListener("dblclick", () => {
        if (isWaiting) return
        const result = getCard()
        const botResult = botGetCard()
        callback(result, botResult, false)
    }, { signal })

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
                const playerDiff = Math.abs(WIN_TARGET - playerSum)
                const botDiff = Math.abs(WIN_TARGET - botSum)

                updateTurnLabels("И выйграл...", scene)

                let roundWinner = "draw"
                setTimeout(() => {
                    if (playerSum > WIN_TARGET) {
                        roundWinner = "bot"
                        updateTurnLabels("Враг", scene)
                    } else if (botSum > WIN_TARGET) {
                        roundWinner = "player"
                        updateTurnLabels("Ты", scene)
                    } else if (playerDiff < botDiff) {
                        roundWinner = "player"
                        updateTurnLabels("Ты", scene)
                    } else if (botDiff < playerDiff) {
                        roundWinner = "bot"
                        updateTurnLabels("Враг", scene)
                    } else {
                        roundWinner = "draw"
                        updateTurnLabels("Ничья", scene)
                    }
                    finishGame = true
                }, 2000)

                callback(null, null, true)
                setTimeout(() => onRoundEnd && onRoundEnd(roundWinner), 4000)
                return
            }

            callback(null, botResult, false)
            lastRightClick = 0
        } else {
            lastRightClick = now
        }
    }, { signal })
}
