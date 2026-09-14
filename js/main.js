// ===== Konfiqurasiya =====
const API_KEY = "5b3e48fc";
const API_URL = "https://www.omdbapi.com/";
const MOVIES_PER_CATEGORY = 14;

// Real treyler videosunu tapıb kartın içində göstərmək üçün YouTube Data API v3 açarı lazımdır.
// Pulsuz açarı buradan alın: https://console.cloud.google.com/apis/library/youtube.googleapis.com
// (Google Cloud-da layihə yaradın → "YouTube Data API v3"-ü aktivləşdirin → Credentials → API Key)
const YOUTUBE_API_KEY = "BURAYA_YOUTUBE_API_ACARINIZI_YAZIN";

const trailerCache = new Map();

// Filmin adı və ilinə görə YouTube-dan real treyler video ID-si tapır (nəticələr keşlənir)
async function fetchTrailerVideoId(title, year) {
  const cacheKey = `${title}_${year}`;
  if (trailerCache.has(cacheKey)) return trailerCache.get(cacheKey);

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.startsWith("BURAYA")) {
    return null;
  }

  try {
    const query = encodeURIComponent(`${title} ${year} official trailer`);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${YOUTUBE_API_KEY}`,
    );
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId || null;
    trailerCache.set(cacheKey, videoId);
    return videoId;
  } catch (err) {
    console.error("Treyler tapılmadı:", err);
    return null;
  }
}

// OMDb-də hazır "kateqoriya" endpoint-i yoxdur, ona görə hər kateqoriya üçün
// açar sözlə axtarış edib nəticələri yığırıq.
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

// ===== API funksiyaları =====
// Axtarış nəticələrini yığır, şəkillərin həqiqətən varlığını yoxlayır və sayı tam tamamlayır
async function fetchMoviesByQuery(query, count) {
  let results = [];
  let page = 1;

  while (results.length < count) {
    const res = await fetch(
      `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`,
    );
    const data = await res.json();

    if (data.Response === "False" || !data.Search) break;

    // Hər bir filmin posterini tək-tək yoxlayırıq
    for (const movie of data.Search) {
      if (
        movie.Poster &&
        movie.Poster !== "N/A" &&
        movie.Poster.startsWith("http")
      ) {
        // Şəklin linkinin həqiqətən işlək (real şəkil) olduğunu yoxlayırıq
        const isImageValid = await checkImageExists(movie.Poster);
        if (isImageValid) {
          results.push(movie);
        }
      }

      // Tələb olunan saya çatdıqsa, dərhal dövrü dayandırırıq
      if (results.length === count) break;
    }

    if (data.Search.length < 10) break;
    page++;
    if (page > 15) break; // Çox irəli getməmək üçün limit
  }

  return results;
}

// Şəkil linkinin həqiqətən açılıb-açılmadığını yoxlayan köməkçi funksiya
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
// Bir filmin tam məlumatını imdbID ilə gətirir
async function fetchMovieDetails(imdbID) {
  const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
  return res.json();
}

// Hero bölməsi üçün seçilmiş klassik/məşhur filmlər (hər dəfə təsadüfi biri seçilir)
const SPOTLIGHT_IDS = [
  "tt1375666", // Inception
  "tt0468569", // The Dark Knight
  "tt0111161", // The Shawshank Redemption
  "tt0137523", // Fight Club
  "tt0109830", // Forrest Gump
  "tt0110912", // Pulp Fiction
  "tt0816692", // Interstellar
  "tt0080684", // Star Wars: Empire Strikes Back
];

async function fetchHeroMovie() {
  const id = SPOTLIGHT_IDS[Math.floor(Math.random() * SPOTLIGHT_IDS.length)];
  return fetchMovieDetails(id);
}

// ===== İnisializasiya =====
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageSwitch();
  setupThemeSwitch();
  renderHero();
  renderAllCategories(CATEGORIES);
  setupSearch();
  setupModalClose();
  updateClock();
});
// ===== Elektron Saat Funksiyası =====
function updateClock() {
  const clockElement = document.getElementById("clockTime");
  if (!clockElement) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Hər 1 saniyədən bir saatı yeniləyirik
setInterval(updateClock, 1000);
