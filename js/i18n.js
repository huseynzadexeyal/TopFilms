// ===== Tərcümələr (AZ / RU / EN) =====
const translations = {
  az: {
    searchPlaceholder: "Film axtar...",
    searchBtn: "Axtar",
    heroTag: "Bu gecə üçün seçim",
    heroDetailBtn: "Ətraflı",
    heroTrailerBtn: "▶ Treyler",
    trailerBtn: "▶ Treyleri izlə",
    searchResultsTitle: "Axtarış Nəticələri",
    loading: "Yüklənir...",
    searching: "Axtarılır...",
    noResults: "Film tapılmadı.",
    noSearchResults: (q) => `"${q}" üçün nəticə tapılmadı.`,
    noDetails: "Məlumat tapılmadı.",
    noTrailer: "Treyler tapılmadı.",
    searchOnYoutube: "YouTube-da axtar",
    imdbVotesSuffix: "səs",
    categories: {
      action: "Actions",
      comedy: "Komediya",
      horror: "Qorxu",
      space: "Fantastika",
      love: "Dram",
      animation: "Animasiya",
      crime: "Cinayət",
      adventure: "Macəra",
    },
    labels: {
      director: "Rejissor:",
      writer: "Ssenari:",
      actors: "Aktyorlar:",
      language: "Dil:",
      country: "Ölkə:",
      awards: "Mükafatlar:",
      released: "Çıxış tarixi:",
    },
  },
  ru: {
    searchPlaceholder: "Поиск фильмов...",
    searchBtn: "Искать",
    heroTag: "Выбор на сегодня",
    heroDetailBtn: "Подробнее",
    heroTrailerBtn: "▶ Трейлер",
    trailerBtn: "▶ Смотреть трейлер",
    searchResultsTitle: "Результаты поиска",
    loading: "Загрузка...",
    searching: "Идёт поиск...",
    noResults: "Фильмы не найдены.",
    noSearchResults: (q) => `По запросу «${q}» ничего не найдено.`,
    noDetails: "Информация не найдена.",
    noTrailer: "Трейлер не найден.",
    searchOnYoutube: "Искать на YouTube",
    imdbVotesSuffix: "голосов",
    categories: {
      action: "Боевики",
      comedy: "Комедии",
      horror: "Ужасы",
      space: "Фантастика",
      love: "Драма",
      animation: "Анимация",
      crime: "Криминал",
      adventure: "Приключения",
    },
    labels: {
      director: "Режиссёр:",
      writer: "Сценарий:",
      actors: "Актёры:",
      language: "Язык:",
      country: "Страна:",
      awards: "Награды:",
      released: "Дата выхода:",
    },
  },
  en: {
    searchPlaceholder: "Search movies...",
    searchBtn: "Search",
    heroTag: "Tonight's pick",
    heroDetailBtn: "Details",
    heroTrailerBtn: "▶ Trailer",
    trailerBtn: "▶ Watch trailer",
    searchResultsTitle: "Search Results",
    loading: "Loading...",
    searching: "Searching...",
    noResults: "No movies found.",
    noSearchResults: (q) => `No results found for "${q}".`,
    noDetails: "Details not found.",
    noTrailer: "Trailer not found.",
    searchOnYoutube: "Search on YouTube",
    imdbVotesSuffix: "votes",
    categories: {
      action: "Action",
      comedy: "Comedy",
      horror: "Horror",
      space: "Sci-Fi",
      love: "Drama",
      animation: "Animation",
      crime: "Crime",
      adventure: "Adventure",
    },
    labels: {
      director: "Director:",
      writer: "Writer:",
      actors: "Cast:",
      language: "Language:",
      country: "Country:",
      awards: "Awards:",
      released: "Released:",
    },
  },
};

let currentLang = localStorage.getItem("filmbax_lang") || "az";

// path nümunələri: "loading", "labels.director", "categories.action"
function t(path) {
  const parts = path.split(".");
  let obj = translations[currentLang];
  for (const p of parts) obj = obj?.[p];
  return obj ?? path;
}

// Statik (dəyişməz) mətnləri cari dilə uyğun yeniləyir
function applyStaticTexts() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const heroTag = document.getElementById("heroTag");
  const heroDetailBtn = document.getElementById("heroDetailBtn");
  const heroTrailerBtn = document.getElementById("heroTrailerBtn");
  const searchResultsTitle = document.querySelector("#searchResults h2");

  if (searchInput) searchInput.placeholder = t("searchPlaceholder");
  if (searchBtn) searchBtn.textContent = t("searchBtn");
  if (heroTag) heroTag.textContent = t("heroTag");
  if (heroDetailBtn) heroDetailBtn.textContent = t("heroDetailBtn");
  if (heroTrailerBtn) heroTrailerBtn.textContent = t("heroTrailerBtn");
  if (searchResultsTitle) searchResultsTitle.textContent = t("searchResultsTitle");

  // Kateqoriya başlıqlarını yenilə
  document.querySelectorAll("[data-cat-key]").forEach((h2) => {
    h2.textContent = t(`categories.${h2.dataset.catKey}`);
  });

  // Dil düymələrinin aktiv vəziyyətini yenilə
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function setLanguage(lang) {
  if (!translations[lang] || lang === currentLang) {
    currentLang = lang;
    applyStaticTexts();
    return;
  }
  currentLang = lang;
  localStorage.setItem("filmbax_lang", lang);
  applyStaticTexts();

  // Kateqoriyaları və axtarış nəticələrini yeni dildə yenidən yüklə
  const categoriesContainer = document.getElementById("categories");
  if (categoriesContainer) {
    categoriesContainer.innerHTML = "";
    renderAllCategories(CATEGORIES);
  }

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  if (searchInput && searchInput.value.trim() && searchResults && !searchResults.classList.contains("hidden")) {
    document.getElementById("searchBtn").click();
  }
}

function setupLanguageSwitch() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  applyStaticTexts();
}
