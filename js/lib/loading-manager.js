import * as THREE from "three"

const overlay = document.getElementById("loading-overlay")
const bar = document.getElementById("loading-bar")
const percent = document.getElementById("loading-percent")

export const loadingManager = new THREE.LoadingManager(
    () => {
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => { overlay.style.display = "none" }
        })
    },
    (url, loaded, total) => {
        const p = Math.round((loaded / total) * 100)
        bar.style.width = p + "%"
        percent.textContent = p + "%"
    }
)
