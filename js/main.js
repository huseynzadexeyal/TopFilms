// ===== Konfiqurasiya =====
const API_KEY = "5b3e48fc";
const API_URL = "https://www.omdbapi.com/";
const MOVIES_PER_CATEGORY = 14;

const YOUTUBE_API_KEY = "BURAYA_YOUTUBE_API_ACARINIZI_YAZIN";

const trailerCache = new Map();

// main.js faylı üçün yenilənmiş funksiya:
async function fetchTrailerVideoId(title, year) {
  const cacheKey = `${title}_${year}`;
  if (trailerCache.has(cacheKey)) return trailerCache.get(cacheKey);

  try {
    // API Key yoxdursa, alternativ axtarış sorğusu
    const query = encodeURIComponent(`${title} ${year} official trailer`);
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=results&q=${query}`);
    
    // Əgər API key təyin olunmayıbsa, birbaşa YouTube search iframe istifadə edək
    trailerCache.set(cacheKey, null);
    return null;
  } catch (err) {
    return null;
  }
}
const CATEGORIES = [
  { key: "action", query: "action" },
  { key: "comedy", query: "comedy" },
  { key: "horror", query: "horror" },
  { key: "space", query: "space" },
  { key: "love", query: "love" },
  { key: "animation", query: "animation" },
  { key: "crime", query: "crime" },
  { key: "adventure", query: "adventure" },
];

// Şəkil linkinin həqiqətən açılıb-açılmadığını yoxlayan köməkçi funksiya
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Axtarış nəticələrini yığır, şəkillərin işlək olduğunu yoxlayır və yerlərin boş qalmaması üçün tam doldurur
async function fetchMoviesByQuery(query, count) {
  let results = [];
  let page = 1;

  while (results.length < count) {
    const res = await fetch(
      `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`,
    );
    const data = await res.json();

    if (data.Response === "False" || !data.Search) break;

    for (const movie of data.Search) {
      if (
        movie.Poster &&
        movie.Poster !== "N/A" &&
        movie.Poster.startsWith("http")
      ) {
        const isImageValid = await checkImageExists(movie.Poster);
        if (isImageValid) {
          results.push(movie);
        }
      }

      if (results.length === count) break;
    }

    if (data.Search.length < 10) break;
    page++;
    if (page > 15) break;
  }

  return results;
}

// Bir filmin tam məlumatını imdbID ilə gətirir
async function fetchMovieDetails(imdbID) {
  const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
  return res.json();
}

const SPOTLIGHT_IDS = [
  "tt1375666",
  "tt0468569",
  "tt0111161",
  "tt0137523",
  "tt0109830",
  "tt0110912",
  "tt0816692",
  "tt0080684",
];

async function fetchHeroMovie() {
  const id = SPOTLIGHT_IDS[Math.floor(Math.random() * SPOTLIGHT_IDS.length)];
  return fetchMovieDetails(id);
}

// Elektron Saat Funksiyası
function updateClock() {
  const clockElement = document.getElementById("clockTime");
  if (!clockElement) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// ===== İnisializasiya =====
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageSwitch();
  setupThemeSwitch();
  renderHero();
  renderAllCategories(CATEGORIES);
  setupSearch();
  setupModalClose();
  updateClock();
  updateFavCount();
  setupFavoritesModal();
});
