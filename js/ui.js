const FALLBACK_POSTER =
  "https://via.placeholder.com/300x445/1c1c1c/888888?text=Şəkil+yoxdur";

// LocalStorage ilə Sevimlilər Siyahısı
let favorites = JSON.parse(localStorage.getItem("filmbax_favs")) || [];

function updateFavCount() {
  const countEl = document.getElementById("favCount");
  if (countEl) countEl.textContent = favorites.length;
}

function toggleFavorite(movie, e) {
  e.stopPropagation();
  const index = favorites.findIndex((item) => item.imdbID === movie.imdbID);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(movie);
  }

  localStorage.setItem("filmbax_favs", JSON.stringify(favorites));
  updateFavCount();
  document
    .querySelectorAll(`.fav-btn[data-id="${movie.imdbID}"]`)
    .forEach((btn) => {
      btn.textContent = index > -1 ? "🤍" : "❤️";
    });
}

function setupFavoritesModal() {
  const favBtn = document.getElementById("favoritesBtn");
  if (!favBtn) return;

  favBtn.addEventListener("click", () => {
    const modalOverlay = document.getElementById("modalOverlay");
    const modalBody = document.getElementById("modalBody");
    modalOverlay.classList.remove("hidden");

    if (!favorites.length) {
      modalBody.innerHTML = `<div class="empty" style="padding:40px; width:100%; text-align:center;">Hələ heç bir sevimli film əlavə edilməyib.</div>`;
      return;
    }

    modalBody.innerHTML = `
      <div style="padding:20px; width:100%;">
        <h2 style="margin-bottom:15px;">Sevimli Filmləriniz</h2>
        <div class="movie-row" id="favRow"></div>
      </div>
    `;

    const favRow = document.getElementById("favRow");
    favorites.forEach((movie) => favRow.appendChild(createMovieCard(movie)));
  });
}

// Skeleton loading kartları
function getSkeletonHTML(count = 6) {
  return Array(count).fill('<div class="skeleton-card"></div>').join("");
}

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

// Bütün kateqoriyaları səhifədə yaradır
async function renderAllCategories(categories) {
  const container = document.getElementById("categories");

  for (const cat of categories) {
    const section = document.createElement("div");
    section.className = "category";
    section.innerHTML = `
      <h2 data-cat-key="${cat.key}">${t(`categories.${cat.key}`)}</h2>
      <div class="movie-row" id="row-${cat.query}">
        ${getSkeletonHTML(6)}
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

  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER;

  card.innerHTML = `
    <div class="card-media">
      <img src="${poster}" alt="${movie.Title}" loading="lazy">
    </div>
    <div class="card-overlay">
      <div class="play-icon">▶</div>
      <div class="title">${movie.Title}</div>
      <div class="year">${movie.Year}</div>
    </div>
  `;

  // Sevimli ürək düyməsi
  const isFav = favorites.some((item) => item.imdbID === movie.imdbID);
  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.dataset.id = movie.imdbID;
  favBtn.textContent = isFav ? "❤️" : "🤍";
  favBtn.addEventListener("click", (e) => toggleFavorite(movie, e));
  card.appendChild(favBtn);

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
      media.innerHTML = `<img src="${poster}" alt="${movie.Title}" loading="lazy">`;
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
    if (!query) {
      resultsBlock.classList.add("hidden");
      row.innerHTML = "";
      return;
    }

    resultsBlock.classList.remove("hidden");
    row.innerHTML = getSkeletonHTML(6);

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

  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      resultsBlock.classList.add("hidden");
      row.innerHTML = "";
    }
  });
}
