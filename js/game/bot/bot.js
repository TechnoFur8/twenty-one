import { deck } from "../functions/get-card"

const botDealtCards = []

export function getBotSum() {
    return botDealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
}

export function getBotArr() {
    const sum = botDealtCards.slice(1).filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
    return sum
}

function getFiftyFifty() {
    return Math.random() >= 0.5;
}

export function botGetCard() {
    if (deck.length === 0) return null

    const botSum = getBotSum()


    let card

    const currentSum = botDealtCards.filter(c => c !== "skip").reduce((acc, curr) => acc + curr, 0)
    if (currentSum >= 21) {
        console.log("Бот привысили лимит взятие карт")
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