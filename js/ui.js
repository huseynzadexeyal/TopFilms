const FALLBACK_POSTER =
  "https://via.placeholder.com/300x445/1c1c1c/888888?text=Şəkil+yoxdur";

// ===== Hero bölməsi =====
async function renderHero() {
  const heroBackdrop = document.getElementById("heroBackdrop");
  const heroTitle = document.getElementById("heroTitle");
  const heroPlot = document.getElementById("heroPlot");
  const heroTrailerBtn = document.getElementById("heroTrailerBtn");
  const heroDetailBtn = document.getElementById("heroDetailBtn");

  const movie = await fetchHeroMovie();
  if (!movie || movie.Response === "False") return;

  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER;

  heroBackdrop.style.backgroundImage = `url('${poster}')`;
  heroTitle.textContent = movie.Title;
  heroPlot.textContent = movie.Plot;
  heroTrailerBtn.href = "#";
  heroTrailerBtn.onclick = (e) => {
    e.preventDefault();
    openMovieModal(movie.imdbID, { autoplayTrailer: true });
  };
  heroDetailBtn.onclick = () => openMovieModal(movie.imdbID);
}

// Bütün kateqoriyaları səhifədə yaradır və doldurur
async function renderAllCategories(categories) {
  const container = document.getElementById("categories");

  for (const cat of categories) {
    const section = document.createElement("div");
    section.className = "category";
    section.innerHTML = `
      <h2 data-cat-key="${cat.key}">${t(`categories.${cat.key}`)}</h2>
      <div class="movie-row" id="row-${cat.query}">
        <div class="loading">${t("loading")}</div>
      </div>
    `;
    container.appendChild(section);

    fetchMoviesByQuery(cat.query, MOVIES_PER_CATEGORY).then((movies) => {
      const row = document.getElementById(`row-${cat.query}`);
      row.innerHTML = "";

      if (!movies.length) {
        row.innerHTML = `<div class="empty">${t("noResults")}</div>`;
        return;
      }

      movies.forEach((movie) => row.appendChild(createMovieCard(movie)));
    });
  }
}

// Bir film kartı yaradır
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const poster = movie.Poster;

  card.innerHTML = `
    <div class="card-media">
      <img src="${poster}" alt="${movie.Title}" loading="lazy" onerror="this.closest('.movie-card').remove();">
    </div>
    <div class="card-overlay">
      <div class="play-icon">▶</div>
      <div class="title">${movie.Title}</div>
      <div class="year">${movie.Year}</div>
    </div>
  `;

  card.addEventListener("click", () => openMovieModal(movie.imdbID));

  const media = card.querySelector(".card-media");
  let hoverTimer = null;
  let previewActive = false;

  card.addEventListener("mouseenter", () => {
    hoverTimer = setTimeout(async () => {
      const videoId = await fetchTrailerVideoId(movie.Title, movie.Year);
      if (!videoId || !card.matches(":hover")) return;
      media.innerHTML = `<iframe class="trailer-frame" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}" frameborder="0" allow="autoplay; encrypted-media" title="${movie.Title} trailer"></iframe>`;
      previewActive = true;
    }, 600);
  });

  card.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimer);
    if (previewActive) {
      media.innerHTML = `<img src="${poster}" alt="${movie.Title}" loading="lazy" onerror="this.closest('.movie-card').remove();">`;
      previewActive = false;
    }
  });

  return card;
}
// ===== Axtarış =====
function setupSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const resultsBlock = document.getElementById("searchResults");
  const row = document.getElementById("searchRow");

  async function doSearch() {
    const query = input.value.trim();

    // Əgər axtarış sahəsi boşdursa, nəticələri və bölməni sıfırla/gizlət
    if (!query) {
      resultsBlock.classList.add("hidden");
      row.innerHTML = "";
      return;
    }

    resultsBlock.classList.remove("hidden");
    row.innerHTML = `<div class="loading">${t("searching")}</div>`;

    const movies = await fetchMoviesByQuery(query, 20);
    row.innerHTML = "";

    if (!movies.length) {
      row.innerHTML = `<div class="empty">${t("noSearchResults")(query)}</div>`;
      return;
    }

    movies.forEach((movie) => row.appendChild(createMovieCard(movie)));
  }

  btn.addEventListener("click", doSearch);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  // 💡 Mətni siləndə (yazını təmizlədikdə) avtomatik sıfırlanması üçün:
  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      resultsBlock.classList.add("hidden");
      row.innerHTML = "";
    }
  });
}
