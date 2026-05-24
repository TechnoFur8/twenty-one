function showScreen(id) {
    document.querySelectorAll(".menu-screen").forEach(s => s.classList.remove("active"))
    document.getElementById("menu-" + id).classList.add("active")
}

document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.open))
})

function loadStats() {
    const s = JSON.parse(localStorage.getItem("21_stats") || '{"wins":0,"losses":0,"draws":0}')
    document.getElementById("stat-wins").textContent = s.wins
    document.getElementById("stat-losses").textContent = s.losses
    document.getElementById("stat-draws").textContent = s.draws
    document.getElementById("stat-total").textContent = s.wins + s.losses + s.draws
}

document.querySelector("[data-open='stats']").addEventListener("click", loadStats)

document.getElementById("reset-stats").addEventListener("click", () => {
    localStorage.removeItem("21_stats")
    loadStats()
})
