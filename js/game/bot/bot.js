import { deck, getWinTarget } from "../functions/get-card"

const botDealtCards = []

export function resetBot() {
    botDealtCards.splice(0, botDealtCards.length)
}

export function getBotSum() {
    return botDealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
}

export function getBotArr() {
    const sum = botDealtCards.slice(1).filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
    return sum
}

export function getBotDealtCards() {
    return botDealtCards
}

export function removeLastBotCard() {
    const realCards = botDealtCards.filter(c => c !== "skip")
    if (realCards.length <= 1) return false
    for (let i = botDealtCards.length - 1; i >= 0; i--) {
        if (botDealtCards[i] !== "skip") {
            deck.push(botDealtCards[i])
            botDealtCards.splice(i, 1)
            return true
        }
    }
    return false
}

function getFiftyFifty() {
    return Math.random() >= 0.5;
}

export function botGetCard() {
    if (deck.length === 0) return null

    const botSum = getBotSum()
    const winTarget = getWinTarget()

    let card

    const currentSum = botDealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
    if (currentSum >= winTarget) {
        console.log("Бот превысили лимит взятие карт")
        botDealtCards.push("skip")
        return null
    }

    if (botSum >= 17 && getFiftyFifty()) {
        console.log("бот решил пропустить карту при 17 или больше очков")
        botDealtCards.push("skip")
        return null
    }

    card = deck.pop()
    botDealtCards.push(card)

    return [card, currentSum + card]
}