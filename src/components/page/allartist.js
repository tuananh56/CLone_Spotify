import { api } from "../../app/api.js";
import { navigate } from "../../app/router.js";

// =========================
// Cấu hình phân trang
// =========================

const ARTISTS_PER_PAGE = 5;

let currentPage = 0;
let currentRequestId = 0;
let isLoading = false;

let allArtists = [];
let searchQuery = "";

// =========================
// Khởi tạo trang tất cả nghệ sĩ
// =========================

export function initAllArtistPage() {
  const artistsList = document.querySelector("#allArtistsList");

  if (!artistsList) return;

  // Tránh đăng ký sự kiện nhiều lần.
  if (artistsList.dataset.initialized === "true") return;

  artistsList.dataset.initialized = "true";

  const reloadBtn = document.querySelector("#btnReloadArtists");
  const homeBtn = document.querySelector("#btnGoHome");
  const searchInput = document.querySelector("#artistSearchInput");
  const pagination = document.querySelector("#artistsPagination");

  // Tải lại danh sách nghệ sĩ.
  reloadBtn?.addEventListener("click", () => {
    loadArtists();
  });

  // Quay về trang chủ.
  homeBtn?.addEventListener("click", () => {
    navigate("home");
  });

  // Tìm kiếm trong toàn bộ danh sách đã tải.
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    currentPage = 0;
    renderFilteredArtists();
  });

  // Phân trang phía frontend.
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled || isLoading) return;

    const page = Number(button.dataset.page);
    const filteredArtists = getFilteredArtists();
    const totalPages = Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE);

    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page >= totalPages ||
      page === currentPage
    ) {
      return;
    }

    currentPage = page;
    renderFilteredArtists();

    // Đưa danh sách về tầm nhìn khi chuyển trang.
    artistsList.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  // Mở trang chi tiết nghệ sĩ.
  artistsList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-artist-id]");

    if (!card || !artistsList.contains(card)) return;

    const artistId = card.dataset.artistId;

    if (!artistId) return;

    navigate("artist", { id: artistId });
  });

  // Hỗ trợ bàn phím.
  artistsList.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-artist-id][role='link']");

    if (!card || !artistsList.contains(card)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });

  // Tải dữ liệu lần đầu.
  loadArtists();
}

// =========================
// Tải toàn bộ danh sách nghệ sĩ
// =========================

async function loadArtists() {
  const artistsList = document.querySelector("#allArtistsList");
  const artistCount = document.querySelector("#artistCount");
  const reloadBtn = document.querySelector("#btnReloadArtists");

  if (!artistsList || isLoading) return;

  isLoading = true;

  const requestId = ++currentRequestId;

  if (artistCount) {
    artistCount.textContent = "Đang tải danh sách nghệ sĩ...";
  }

  if (reloadBtn) {
    reloadBtn.disabled = true;
    reloadBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  artistsList.innerHTML = `
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách nghệ sĩ...</p>
    </div>
  `;

  renderPagination();

  try {
    const res = await api.get("/api/artists?limit=50&offset=0");

    if (requestId !== currentRequestId) return;

    const data = res.data;

    const artists = Array.isArray(data)
      ? data
      : Array.isArray(data?.artists)
        ? data.artists
        : Array.isArray(data?.data?.artists)
          ? data.data.artists
          : Array.isArray(data?.data)
            ? data.data
            : null;

    if (!artists) {
      console.error("Response API nghệ sĩ không hợp lệ:", data);
      throw new Error("Không đọc được danh sách nghệ sĩ từ API.");
    }

    allArtists = artists;
    currentPage = 0;

    renderFilteredArtists();

    if (artistCount) {
      artistCount.textContent = `Có ${allArtists.length} nghệ sĩ trong thư viện`;
    }
  } catch (error) {
    if (requestId !== currentRequestId) return;

    console.error(
      "Lỗi tải danh sách nghệ sĩ:",
      error.response?.data || error.message || error,
    );

    artistsList.innerHTML = `
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách nghệ sĩ.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;

    const pagination = document.querySelector("#artistsPagination");

    if (pagination) {
      pagination.innerHTML = "";
    }

    if (artistCount) {
      artistCount.textContent = "Tải danh sách nghệ sĩ thất bại";
    }
  } finally {
    if (requestId === currentRequestId) {
      isLoading = false;

      if (reloadBtn) {
        reloadBtn.disabled = false;
        reloadBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }

      renderPagination();
    }
  }
}

// =========================
// Lọc nghệ sĩ theo từ khóa
// =========================

function getFilteredArtists() {
  return allArtists.filter((artist) => {
    const name = artist.name || artist.artist_name || artist.title || "";

    return String(name).toLowerCase().includes(searchQuery);
  });
}

// =========================
// Hiển thị nghệ sĩ của trang hiện tại
// =========================

function renderFilteredArtists() {
  const filteredArtists = getFilteredArtists();
  const totalPages = Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE);

  // Đảm bảo trang hiện tại luôn hợp lệ sau khi tìm kiếm.
  if (totalPages === 0) {
    currentPage = 0;
  } else if (currentPage >= totalPages) {
    currentPage = totalPages - 1;
  }

  const start = currentPage * ARTISTS_PER_PAGE;

  const artistsOnPage = filteredArtists.slice(start, start + ARTISTS_PER_PAGE);

  renderArtists(artistsOnPage);
  renderPagination();

  const artistCount = document.querySelector("#artistCount");

  if (artistCount && !isLoading) {
    artistCount.textContent = searchQuery
      ? `Tìm thấy ${filteredArtists.length} nghệ sĩ`
      : `Có ${allArtists.length} nghệ sĩ trong thư viện`;
  }
}

// =========================
// Render danh sách nghệ sĩ
// =========================

function renderArtists(artists) {
  const artistsList = document.querySelector("#allArtistsList");

  if (!artistsList) return;

  if (artists.length === 0) {
    artistsList.innerHTML = `
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-users text-3xl mb-3"></i>
        <p>
          ${
            searchQuery
              ? "Không tìm thấy nghệ sĩ phù hợp."
              : "Không tìm thấy nghệ sĩ nào."
          }
        </p>
      </div>
    `;

    return;
  }

  artistsList.innerHTML = artists
    .map((artist) => {
      const id = artist.id ?? artist._id ?? artist.artist_id;

      const name =
        artist.name ||
        artist.artist_name ||
        artist.title ||
        "Chưa có tên nghệ sĩ";

      const image =
        artist.image_url ||
        artist.avatar_url ||
        artist.profile_image_url ||
        artist.picture_url ||
        `${import.meta.env.BASE_URL}playlist.png`;

      const description =
        artist.bio || artist.description || artist.genre || "Nghệ sĩ";

      const safeId = escapeHTML(id ?? "");
      const safeName = escapeHTML(name);
      const safeImage = escapeHTML(image);
      const safeDescription = escapeHTML(description);

      const clickable = id !== null && id !== undefined && id !== "";

      return `
        <article
          ${
            clickable
              ? `data-artist-id="${safeId}" role="link" tabindex="0"`
              : 'aria-disabled="true"'
          }
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${
            clickable ? "cursor-pointer" : "cursor-default"
          }"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-full bg-neutral-800 shadow-lg">
            <img
              src="${safeImage}"
              alt="${safeName}"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='${import.meta.env.BASE_URL}playlist.png';"
            />

            ${
              clickable
                ? `
                  <div
                    class="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-green-500 text-lg text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                `
                : ""
            }
          </div>

          <h2
            class="mb-1 truncate text-sm font-semibold text-white"
            title="${safeName}"
          >
            ${safeName}
          </h2>

          <p
            class="truncate text-sm text-neutral-400"
            title="${safeDescription}"
          >
            ${safeDescription}
          </p>
        </article>
      `;
    })
    .join("");
}

// =========================
// Render phân trang
// =========================

function renderPagination() {
  const pagination = document.querySelector("#artistsPagination");

  if (!pagination) return;

  const totalPages = Math.ceil(getFilteredArtists().length / ARTISTS_PER_PAGE);

  // Không cần phân trang nếu chỉ có tối đa 5 nghệ sĩ.
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index);

  pagination.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${currentPage - 1}"
        ${currentPage === 0 || isLoading ? "disabled" : ""}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${pages
        .map(
          (page) => `
            <button
              type="button"
              data-page="${page}"
              ${isLoading ? "disabled" : ""}
              aria-current="${page === currentPage ? "page" : "false"}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${
                page === currentPage
                  ? "bg-green-500 text-black"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              } disabled:opacity-50"
            >
              ${page + 1}
            </button>
          `,
        )
        .join("")}

      <button
        type="button"
        data-page="${currentPage + 1}"
        ${currentPage >= totalPages - 1 || isLoading ? "disabled" : ""}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// =========================
// Escape HTML
// =========================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
