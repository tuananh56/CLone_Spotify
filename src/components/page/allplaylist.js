import { api } from "../../app/api.js";
import { navigate } from "../../app/router.js";

// =========================
// Cấu hình
// =========================

const PLAYLISTS_PER_PAGE = 12;
const API_LIMIT = 20;

let allPlaylists = [];
let currentPage = 0;
let searchQuery = "";
let isLoading = false;
let initialized = false;
let requestId = 0;

// Ảnh mặc định
const fallbackImage = `${import.meta.env.BASE_URL}playlist.png`;

// =========================
// Khởi tạo trang tất cả playlist
// =========================

export function initAllPlaylistPage() {
  const playlistList = document.querySelector("#allPlaylistsList");

  if (!playlistList || initialized) return;

  initialized = true;

  const searchInput = document.querySelector("#playlistSearchInput");
  const reloadBtn = document.querySelector("#btnReloadPlaylists");
  const homeBtn = document.querySelector("#btnGoHome");
  const pagination = document.querySelector("#playlistsPagination");

  // Tìm kiếm playlist
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    currentPage = 0;
    renderFilteredPlaylists();
  });

  // Tải lại danh sách
  reloadBtn?.addEventListener("click", () => {
    loadPlaylists();
  });

  // Quay về trang chủ
  homeBtn?.addEventListener("click", () => {
    navigate("home");
  });

  // Phân trang
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled || isLoading) return;

    const page = Number(button.dataset.page);
    const filteredPlaylists = getFilteredPlaylists();
    const totalPages = Math.ceil(filteredPlaylists.length / PLAYLISTS_PER_PAGE);

    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page >= totalPages ||
      page === currentPage
    ) {
      return;
    }

    currentPage = page;
    renderFilteredPlaylists();

    playlistList.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  // Mở trang chi tiết playlist
  playlistList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-playlist-id]");

    if (!card || !playlistList.contains(card)) return;

    const playlistId = card.dataset.playlistId;

    if (!playlistId) return;

    navigate("playlist", { id: playlistId });
  });

  // Hỗ trợ bàn phím
  playlistList.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-playlist-id][role='link']");

    if (!card || !playlistList.contains(card)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });

  loadPlaylists();
}

// =========================
// Tải danh sách playlist từ API
// =========================

async function loadPlaylists() {
  const playlistList = document.querySelector("#allPlaylistsList");
  const playlistCount = document.querySelector("#playlistCount");
  const reloadBtn = document.querySelector("#btnReloadPlaylists");

  if (!playlistList || isLoading) return;

  isLoading = true;
  const currentRequest = ++requestId;

  if (playlistCount) {
    playlistCount.textContent = "Đang tải danh sách playlist...";
  }

  if (reloadBtn) {
    reloadBtn.disabled = true;
    reloadBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  playlistList.innerHTML = `
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách playlist...</p>
    </div>
  `;

  try {
    const res = await api.get(`/api/playlists?limit=${API_LIMIT}&offset=0`);

    if (currentRequest !== requestId) return;

    const data = res.data;
    // console.log("API tất cả playlist:", JSON.stringify(data, null, 2));

    // Hỗ trợ một số cấu trúc response phổ biến.
    const playlists = Array.isArray(data)
      ? data
      : Array.isArray(data?.playlists)
        ? data.playlists
        : Array.isArray(data?.data?.playlists)
          ? data.data.playlists
          : Array.isArray(data?.data)
            ? data.data
            : null;

    if (!playlists) {
      console.error("Response API playlist không hợp lệ:", data);
      throw new Error("Không đọc được danh sách playlist từ API.");
    }

    allPlaylists = playlists;
    currentPage = 0;

    renderFilteredPlaylists();

    if (playlistCount) {
      playlistCount.textContent = `Có ${allPlaylists.length} playlist trong thư viện`;
    }

    console.log("Đã tải playlist:", allPlaylists.length);
  } catch (error) {
    if (currentRequest !== requestId) return;

    console.error(
      "Lỗi tải danh sách playlist:",
      error.response?.data || error.message || error,
    );

    playlistList.innerHTML = `
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách playlist.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;

    const pagination = document.querySelector("#playlistsPagination");

    if (pagination) pagination.innerHTML = "";

    if (playlistCount) {
      playlistCount.textContent = "Tải danh sách playlist thất bại";
    }
  } finally {
    if (currentRequest === requestId) {
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
// Tìm kiếm playlist
// =========================

function getFilteredPlaylists() {
  if (!searchQuery) return allPlaylists;

  return allPlaylists.filter((playlist) => {
    const name = playlist.name || playlist.title || "";
    const description = playlist.description || "";
    const owner =
      playlist.owner?.name ||
      playlist.owner?.username ||
      playlist.username ||
      "";

    const searchableText = `${name} ${description} ${owner}`;

    return searchableText.toLowerCase().includes(searchQuery);
  });
}

// =========================
// Hiển thị playlist theo trang
// =========================

function renderFilteredPlaylists() {
  const filteredPlaylists = getFilteredPlaylists();

  const totalPages = Math.ceil(filteredPlaylists.length / PLAYLISTS_PER_PAGE);

  if (totalPages === 0) {
    currentPage = 0;
  } else if (currentPage >= totalPages) {
    currentPage = totalPages - 1;
  }

  const start = currentPage * PLAYLISTS_PER_PAGE;

  const playlistsOnPage = filteredPlaylists.slice(
    start,
    start + PLAYLISTS_PER_PAGE,
  );

  renderPlaylists(playlistsOnPage);
  renderPagination();

  const playlistCount = document.querySelector("#playlistCount");

  if (playlistCount && !isLoading) {
    playlistCount.textContent = searchQuery
      ? `Tìm thấy ${filteredPlaylists.length} playlist`
      : `Có ${allPlaylists.length} playlist trong thư viện`;
  }
}

// =========================
// Render các thẻ playlist
// =========================

function renderPlaylists(playlists) {
  const playlistList = document.querySelector("#allPlaylistsList");

  if (!playlistList) return;

  if (playlists.length === 0) {
    playlistList.innerHTML = `
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-music text-3xl mb-3"></i>
        <p>
          ${
            searchQuery
              ? "Không tìm thấy playlist phù hợp."
              : "Chưa có playlist nào."
          }
        </p>
      </div>
    `;

    return;
  }

  playlistList.innerHTML = playlists
    .map((playlist) => {
      const id = playlist.id ?? playlist._id ?? playlist.playlist_id;

      const name = playlist.name || playlist.title || "Playlist chưa có tên";

      const description =
        playlist.description ||
        playlist.owner?.name ||
        playlist.username ||
        "Playlist";

      const image =
        playlist.image_url ||
        playlist.cover_image_url ||
        playlist.cover_url ||
        playlist.thumbnail_url ||
        playlist.imageUrl ||
        playlist.image ||
        playlist.cover?.url ||
        playlist.images?.[0]?.url ||
        playlist.images?.[0] ||
        fallbackImage;

      const safeId = escapeHTML(id ?? "");
      const safeName = escapeHTML(name);
      const safeDescription = escapeHTML(description);
      const safeImage = escapeHTML(image);

      const hasId = id !== null && id !== undefined && id !== "";

      return `
        <article
          ${
            hasId
              ? `data-playlist-id="${safeId}" role="link" tabindex="0"`
              : 'aria-disabled="true"'
          }
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${
            hasId ? "cursor-pointer" : "cursor-default"
          }"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-md bg-neutral-800 shadow-lg">
            <img
              src="${safeImage}"
              alt="${safeName}"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='${fallbackImage}';"
            />

            <div
              class="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-green-500 text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"
              aria-hidden="true"
            >
              <i class="fa-solid fa-play"></i>
            </div>
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
  const pagination = document.querySelector("#playlistsPagination");

  if (!pagination) return;

  const totalPages = Math.ceil(
    getFilteredPlaylists().length / PLAYLISTS_PER_PAGE,
  );

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
