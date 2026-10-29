import { api } from "../../app/api.js";
import { navigate } from "../../app/router.js";

// =========================
// Cấu hình phân trang
// =========================

const ALBUMS_PER_PAGE = 5;

let currentPage = 0;
let currentRequestId = 0;
let isLoading = false;

let allAlbums = [];
let searchQuery = "";

// =========================
// Khởi tạo trang tất cả album
// =========================

export function initAllAlbumPage() {
  const albumsList = document.querySelector("#allAlbumsList");

  if (!albumsList) return;

  // Tránh đăng ký sự kiện nhiều lần.
  if (albumsList.dataset.initialized === "true") return;

  albumsList.dataset.initialized = "true";

  const reloadBtn = document.querySelector("#btnReloadAlbums");
  const homeBtn = document.querySelector("#btnGoHome");
  const searchInput = document.querySelector("#albumSearchInput");
  const pagination = document.querySelector("#albumsPagination");

  // Tải lại danh sách album.
  reloadBtn?.addEventListener("click", () => {
    loadAlbums();
  });

  // Quay về trang chủ.
  homeBtn?.addEventListener("click", () => {
    navigate("home");
  });

  // Tìm kiếm trên toàn bộ danh sách album đã tải.
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    currentPage = 0;
    renderFilteredAlbums();
  });

  // Phân trang phía frontend.
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled || isLoading) return;

    const page = Number(button.dataset.page);
    const filteredAlbums = getFilteredAlbums();
    const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page >= totalPages ||
      page === currentPage
    ) {
      return;
    }

    currentPage = page;
    renderFilteredAlbums();

    albumsList.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  // Mở trang chi tiết album.
  albumsList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-album-id]");

    if (!card || !albumsList.contains(card)) return;

    const albumId = card.dataset.albumId;

    if (!albumId) return;

    navigate("album", { id: albumId });
  });

  // Hỗ trợ bàn phím.
  albumsList.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-album-id][role='link']");

    if (!card || !albumsList.contains(card)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });

  // Tải dữ liệu lần đầu.
  loadAlbums();
}

// =========================
// Tải danh sách album
// =========================

async function loadAlbums() {
  const albumsList = document.querySelector("#allAlbumsList");
  const albumCount = document.querySelector("#albumCount");
  const reloadBtn = document.querySelector("#btnReloadAlbums");

  if (!albumsList || isLoading) return;

  isLoading = true;

  const requestId = ++currentRequestId;

  if (albumCount) {
    albumCount.textContent = "Đang tải danh sách album...";
  }

  if (reloadBtn) {
    reloadBtn.disabled = true;
    reloadBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  albumsList.innerHTML = `
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách album...</p>
    </div>
  `;

  renderPagination();

  try {
    // Lấy danh sách album một lần để phân trang ở frontend.
    const res = await api.get("/api/albums?limit=50&offset=0");

    if (requestId !== currentRequestId) return;

    const data = res.data;

    const albums = Array.isArray(data)
      ? data
      : Array.isArray(data?.albums)
        ? data.albums
        : Array.isArray(data?.data?.albums)
          ? data.data.albums
          : Array.isArray(data?.data)
            ? data.data
            : null;

    if (!albums) {
      console.error("Response API album không hợp lệ:", data);
      throw new Error("Không đọc được danh sách album từ API.");
    }

    allAlbums = albums;
    currentPage = 0;

    renderFilteredAlbums();

    if (albumCount) {
      albumCount.textContent = `Có ${allAlbums.length} album trong thư viện`;
    }
  } catch (error) {
    if (requestId !== currentRequestId) return;

    console.error(
      "Lỗi tải danh sách album:",
      error.response?.data || error.message || error,
    );

    albumsList.innerHTML = `
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách album.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;

    const pagination = document.querySelector("#albumsPagination");

    if (pagination) {
      pagination.innerHTML = "";
    }

    if (albumCount) {
      albumCount.textContent = "Tải danh sách album thất bại";
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
// Lọc album theo từ khóa
// =========================

function getFilteredAlbums() {
  return allAlbums.filter((album) => {
    const title = album.title || album.name || album.album_title || "";

    const artistValue =
      album.artist_name || album.artist || album.artists || "";

    const artistName = Array.isArray(artistValue)
      ? artistValue
          .map((artist) =>
            typeof artist === "string"
              ? artist
              : artist?.name || artist?.artist_name || "",
          )
          .join(" ")
      : typeof artistValue === "object" && artistValue !== null
        ? artistValue.name || artistValue.artist_name || ""
        : artistValue;

    const searchableText = `${title} ${artistName}`.toLowerCase();

    return searchableText.includes(searchQuery);
  });
}

// =========================
// Hiển thị album của trang hiện tại
// =========================

function renderFilteredAlbums() {
  const filteredAlbums = getFilteredAlbums();

  const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

  // Đảm bảo trang hiện tại hợp lệ sau khi tìm kiếm.
  if (totalPages === 0) {
    currentPage = 0;
  } else if (currentPage >= totalPages) {
    currentPage = totalPages - 1;
  }

  const start = currentPage * ALBUMS_PER_PAGE;

  const albumsOnPage = filteredAlbums.slice(start, start + ALBUMS_PER_PAGE);

  renderAlbums(albumsOnPage);
  renderPagination();

  const albumCount = document.querySelector("#albumCount");

  if (albumCount && !isLoading) {
    albumCount.textContent = searchQuery
      ? `Tìm thấy ${filteredAlbums.length} album`
      : `Có ${allAlbums.length} album trong thư viện`;
  }
}

// =========================
// Render danh sách album
// =========================

function renderAlbums(albums) {
  const albumsList = document.querySelector("#allAlbumsList");

  if (!albumsList) return;

  if (albums.length === 0) {
    albumsList.innerHTML = `
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-compact-disc text-3xl mb-3"></i>
        <p>
          ${
            searchQuery
              ? "Không tìm thấy album phù hợp."
              : "Không tìm thấy album nào."
          }
        </p>
      </div>
    `;

    return;
  }

  albumsList.innerHTML = albums
    .map((album) => {
      const id = album.id ?? album._id ?? album.album_id;

      const title =
        album.title || album.name || album.album_title || "Chưa có tên album";

      const artistValue =
        album.artist_name || album.artist || album.artists || "";

      const artistName = Array.isArray(artistValue)
        ? artistValue
            .map((artist) =>
              typeof artist === "string"
                ? artist
                : artist?.name || artist?.artist_name || "",
            )
            .filter(Boolean)
            .join(", ")
        : typeof artistValue === "object" && artistValue !== null
          ? artistValue.name || artistValue.artist_name || "Nghệ sĩ"
          : artistValue || "Nghệ sĩ";

      const image =
        album.cover_image_url ||
        album.image_url ||
        album.cover_url ||
        album.thumbnail_url ||
        `${import.meta.env.BASE_URL}playlist.png`;

      const releaseDate = album.release_date || "";

      const safeId = escapeHTML(id ?? "");
      const safeTitle = escapeHTML(title);
      const safeArtist = escapeHTML(artistName);
      const safeImage = escapeHTML(image);
      const safeReleaseDate = escapeHTML(releaseDate);

      const clickable = id !== null && id !== undefined && id !== "";

      return `
        <article
          ${
            clickable
              ? `data-album-id="${safeId}" role="link" tabindex="0"`
              : 'aria-disabled="true"'
          }
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${
            clickable ? "cursor-pointer" : "cursor-default"
          }"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-neutral-800 shadow-lg">
            <img
              src="${safeImage}"
              alt="${safeTitle}"
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
            title="${safeTitle}"
          >
            ${safeTitle}
          </h2>

          <p
            class="truncate text-sm text-neutral-400"
            title="${safeArtist}"
          >
            ${safeArtist}
          </p>

          ${
            safeReleaseDate
              ? `
                <p class="mt-1 truncate text-xs text-neutral-500">
                  ${safeReleaseDate}
                </p>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");
}

// =========================
// Render phân trang
// =========================

function renderPagination() {
  const pagination = document.querySelector("#albumsPagination");

  if (!pagination) return;

  const totalPages = Math.ceil(getFilteredAlbums().length / ALBUMS_PER_PAGE);

  // Chỉ hiện phân trang khi có hơn 5 album.
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
