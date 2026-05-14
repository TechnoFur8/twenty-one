import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js"
import robotoFontUrl from "../../assets/fonts/Roboto/static/Roboto-Regular.ttf?url"

const fontLoader = new FontLoader()
const ttfLoader = new TTFLoader()

export function loadRobotoFont() {
    return new Promise((resolve, reject) => {
        ttfLoader.load(
            robotoFontUrl,
            (json) => resolve(fontLoader.parse(json)),
            undefined,
            reject,
        )
    })
}
