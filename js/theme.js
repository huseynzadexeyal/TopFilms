// ===== Mövzu (Neon / Venom) =====
let currentTheme = localStorage.getItem("filmbax_theme") || "neon";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
  console.log("[FilmBax] Aktiv tema:", document.documentElement.getAttribute("data-theme"));
}

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("filmbax_theme", theme);
  applyTheme(theme);
}

function setupThemeSwitch() {
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });
  applyTheme(currentTheme);
}
