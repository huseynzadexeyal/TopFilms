// detail.js

function getTrailerSearchUrl(title, year) {
  const query = encodeURIComponent(`${title} ${year} official trailer`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");

// Modalı açır və filmin ətraflı məlumatını göstərir
async function openMovieModal(imdbID, options = {}) {
  if (!modalOverlay || !modalBody) return;

  modalOverlay.classList.remove("hidden");
  modalBody.innerHTML = `<div class="loading" style="padding:40px; text-align:center; width:100%;">Yüklənir...</div>`;

  try {
    const movie = await fetchMovieDetails(imdbID);

    if (!movie || movie.Response === "False") {
      modalBody.innerHTML = `<div class="empty" style="padding:40px; text-align:center; width:100%;">Film məlumatı tapılmadı.</div>`;
      return;
    }

    const poster = (movie.Poster && movie.Poster !== "N/A") ? movie.Poster : (typeof FALLBACK_POSTER !== 'undefined' ? FALLBACK_POSTER : '');

    modalBody.innerHTML = `
      <div class="modal-poster" id="modalPoster">
        <img src="${poster}" alt="${movie.Title}">
      </div>
      <div class="modal-info">
        <h2>${movie.Title}</h2>
        <div class="meta">${movie.Year || ''} • ${movie.Rated || ''} • ${movie.Runtime || ''} • ${movie.Genre || ''}</div>

        <div style="margin: 10px 0;">
          <span class="rating-badge">⭐ ${movie.imdbRating || 'N/A'}</span>
          <span class="meta">IMDb (${movie.imdbVotes || '0'} səs)</span>
        </div>

        <button class="trailer-btn" id="modalTrailerBtn" type="button">
          ▶ Treyleri İzlə
        </button>

        <p class="plot">${movie.Plot || 'Məzmun yoxdur.'}</p>

        <div class="detail-row"><span class="label">Rejissor: </span>${movie.Director || 'N/A'}</div>
        <div class="detail-row"><span class="label">Ssenari: </span>${movie.Writer || 'N/A'}</div>
        <div class="detail-row"><span class="label">Rollarda: </span>${movie.Actors || 'N/A'}</div>
        <div class="detail-row"><span class="label">Dil: </span>${movie.Language || 'N/A'}</div>
        <div class="detail-row"><span class="label">Ölkə: </span>${movie.Country || 'N/A'}</div>
        <div class="detail-row"><span class="label">Mükafatlar: </span>${movie.Awards || 'N/A'}</div>
        <div class="detail-row"><span class="label">Çıxış tarixi: </span>${movie.Released || 'N/A'}</div>
      </div>
    `;

    const trailerBtn = document.getElementById("modalTrailerBtn");
    if (trailerBtn) {
      trailerBtn.addEventListener("click", () => {
        playTrailerInline(movie.Title, movie.Year);
      });
    }

    if (options.autoplayTrailer) {
      playTrailerInline(movie.Title, movie.Year);
    }
  } catch (err) {
    console.error("Modal xətası:", err);
    modalBody.innerHTML = `<div class="empty" style="padding:40px; text-align:center; width:100%;">Xəta baş verdi.</div>`;
  }
}

// Treyleri pəncərə daxilində oynadır (Əgər API video tapmasa, birbaşa YouTube axtarış pəncərəsinə yönəldir)
async function playTrailerInline(title, year) {
  const posterBox = document.getElementById("modalPoster");
  if (!posterBox) return;

  posterBox.innerHTML = `<div class="loading" style="padding:20px; text-align:center;">Treyler axtarılır...</div>`;

  let videoId = null;
  if (typeof fetchTrailerVideoId === "function") {
    videoId = await fetchTrailerVideoId(title, year);
  }

  if (!videoId) {
    posterBox.innerHTML = `
      <div class="empty" style="padding:20px; text-align:center;">
        Video pleyer tapılmadı.
        <br /><br />
        <a href="${getTrailerSearchUrl(title, year)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-block; padding:8px 16px; text-decoration:none;">YouTube-da İzlə ↗</a>
      </div>
    `;
    return;
  }

  posterBox.innerHTML = `<iframe class="modal-trailer-frame" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="${title} trailer" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}

// Modalı bağlamaq üçün hadisələr
function setupModalClose() {
  const closeBtn = document.getElementById("modalClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.add("hidden");
  if (modalBody) modalBody.innerHTML = "";
}