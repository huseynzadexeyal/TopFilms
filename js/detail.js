// Filmin adı və ilinə görə YouTube axtarış linki qurur (OMDb trailer linki vermir)
function getTrailerSearchUrl(title, year) {
  const query = encodeURIComponent(`${title} ${year} official trailer`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");

// Modalı açır və filmin ətraflı məlumatını göstərir
async function openMovieModal(imdbID, options = {}) {
  modalOverlay.classList.remove("hidden");
  modalBody.innerHTML = `<div class="loading" style="padding:40px;">${t("loading")}</div>`;

  const movie = await fetchMovieDetails(imdbID);

  if (movie.Response === "False") {
    modalBody.innerHTML = `<div class="empty" style="padding:40px;">${t("noDetails")}</div>`;
    return;
  }

  const poster = (movie.Poster && movie.Poster !== "N/A") ? movie.Poster : FALLBACK_POSTER;

  modalBody.innerHTML = `
    <div class="modal-poster" id="modalPoster">
      <img src="${poster}" alt="${movie.Title}">
    </div>
    <div class="modal-info">
      <h2>${movie.Title}</h2>
      <div class="meta">${movie.Year} • ${movie.Rated} • ${movie.Runtime} • ${movie.Genre}</div>

      <div>
        <span class="rating-badge">⭐ ${movie.imdbRating}</span>
        <span class="meta">IMDb (${movie.imdbVotes} ${t("imdbVotesSuffix")})</span>
      </div>

      <button class="trailer-btn" id="modalTrailerBtn" type="button">
        ${t("trailerBtn")}
      </button>

      <p class="plot">${movie.Plot}</p>

      <div class="detail-row"><span class="label">${t("labels.director")}</span>${movie.Director}</div>
      <div class="detail-row"><span class="label">${t("labels.writer")}</span>${movie.Writer}</div>
      <div class="detail-row"><span class="label">${t("labels.actors")}</span>${movie.Actors}</div>
      <div class="detail-row"><span class="label">${t("labels.language")}</span>${movie.Language}</div>
      <div class="detail-row"><span class="label">${t("labels.country")}</span>${movie.Country}</div>
      <div class="detail-row"><span class="label">${t("labels.awards")}</span>${movie.Awards}</div>
      <div class="detail-row"><span class="label">${t("labels.released")}</span>${movie.Released}</div>
    </div>
  `;

  document.getElementById("modalTrailerBtn").addEventListener("click", () => {
    playTrailerInline(movie.Title, movie.Year);
  });

  if (options.autoplayTrailer) {
    playTrailerInline(movie.Title, movie.Year);
  }
}

// Treyleri yeni pəncərə açmadan, poster yerinə birbaşa modalın içində oynadır
async function playTrailerInline(title, year) {
  const posterBox = document.getElementById("modalPoster");
  if (!posterBox) return;

  posterBox.innerHTML = `<div class="loading" style="padding:20px;">${t("loading")}</div>`;
  const videoId = await fetchTrailerVideoId(title, year);

  if (!videoId) {
    posterBox.innerHTML = `
      <div class="empty" style="padding:20px;">
        ${t("noTrailer")}
        <br />
        <a href="${getTrailerSearchUrl(title, year)}" target="_blank" rel="noopener noreferrer">${t("searchOnYoutube")}</a>
      </div>
    `;
    return;
  }

  posterBox.innerHTML = `<iframe class="modal-trailer-frame" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="${title} trailer" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}

// Modalı bağlamaq üçün hadisələr
function setupModalClose() {
  document.getElementById("modalClose").addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalBody.innerHTML = "";
}
