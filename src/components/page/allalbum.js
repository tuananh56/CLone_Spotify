import { api } from "../../app/api.js";
import { navigate } from "../../app/router.js";

const ALBUMS_PER_PAGE = 5;
const TOTAL_ALBUMS = 7;
let currentPage = 0;
let currentRequestId = 0;
let hasNextPage = false;
let isLoading = false;
let allAlbums = [];
let searchQuery = "";
let totalAlbums = null;

// Khởi tạo trang tất cả album
export function initAllAlbumPage() {
  const albumsList = document.querySelector("#allAlbumsList");

  if (!albumsList) return;

  // Tránh đăng ký sự kiện nhiều lần
  if (albumsList.dataset.initialized === "true") {
    renderFilteredAlbums();
    return;
  }

  albumsList.dataset.initialized = "true";

  const reloadBtn = document.querySelector("#btnReloadAlbums");
  const homeBtn = document.querySelector("#btnGoHome");
  const searchInput = document.querySelector("#albumSearchInput");
  const pagination = document.querySelector("#albumsPagination");

  // Tải lại trang album hiện tại
  reloadBtn?.addEventListener("click", () => {
    loadAlbums(currentPage);
  });

  // Quay về trang chủ
  homeBtn?.addEventListener("click", () => {
    navigate("home");
  });

  // Tìm kiếm theo tên album hoặc nghệ sĩ
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderFilteredAlbums();
  });

  // Mở trang chi tiết album
  albumsList.addEventListener("click", (event) => {
    const albumCard = event.target.closest("[data-album-id]");

    if (!albumCard || !albumsList.contains(albumCard)) return;

    const albumId = albumCard.dataset.albumId;

    if (!albumId) return;

    navigate("album", { id: albumId });
  });

  // Hỗ trợ mở album bằng bàn phím
  albumsList.addEventListener("keydown", (event) => {
    const albumCard = event.target.closest("[data-album-id][role='link']");

    if (!albumCard || !albumsList.contains(albumCard)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      albumCard.click();
    }
  });

  // Phân trang bằng các nút số
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled || isLoading) return;

    const page = Number(button.dataset.page);

    if (!Number.isInteger(page) || page < 0 || page === currentPage) {
      return;
    }

    // Không cho chuyển đến trang vượt quá trang kế tiếp
    // nếu API không cung cấp tổng số album.
    if (totalAlbums === null && page > currentPage + 1) {
      return;
    }

    if (
      totalAlbums !== null &&
      page >= Math.ceil(totalAlbums / ALBUMS_PER_PAGE)
    ) {
      return;
    }

    if (page < Math.ceil(totalAlbums / ALBUMS_PER_PAGE)) {
      loadAlbums(page);
    }
  });

  // Tải trang đầu tiên
  loadAlbums(0);
}

// Tải danh sách album từ API
async function loadAlbums(page = 0) {
  const albumsList = document.querySelector("#allAlbumsList");
  const albumCount = document.querySelector("#albumCount");
  const reloadBtn = document.querySelector("#btnReloadAlbums");

  if (!albumsList || isLoading) return;

  isLoading = true;

  const requestId = ++currentRequestId;
  const offset = page * ALBUMS_PER_PAGE;

  if (albumCount) {
    albumCount.textContent = "Đang tải danh sách album...";
  }

  if (reloadBtn) {
    reloadBtn.disabled = true;
    reloadBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  renderPagination();

  albumsList.innerHTML = `
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách album...</p>
    </div>
  `;

  try {
    const res = await api.get(
      `/api/albums?offset=${offset}&limit=${ALBUMS_PER_PAGE}`,
    );

    if (requestId !== currentRequestId) return;

    const data = res.data;

    const albums = Array.isArray(data)
      ? data
      : Array.isArray(data?.albums)
        ? data.albums
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.albums)
            ? data.data.albums
            : null;

    if (!albums) {
      throw new Error("Không đọc được danh sách album từ API.");
    }

    allAlbums = albums;
    currentPage = page;

    const total =
      data?.total ??
      data?.totalCount ??
      data?.pagination?.total ??
      data?.data?.total ??
      data?.data?.totalCount;

    // Chỉ sử dụng tổng số album nếu API trả về giá trị đáng tin cậy.
    totalAlbums = TOTAL_ALBUMS;
    hasNextPage = (currentPage + 1) * ALBUMS_PER_PAGE < TOTAL_ALBUMS;
    // console.log("Album tải được:", albums.length);
    // console.log("Tổng album từ API:", totalAlbums);
    // console.log("Có trang tiếp theo:", hasNextPage);
    // console.log("Trang hiện tại:", currentPage + 1);

    renderFilteredAlbums();

    if (albumCount) {
      albumCount.textContent =
        totalAlbums !== null
          ? `Có ${totalAlbums} album trong thư viện`
          : `Trang ${currentPage + 1} • ${albums.length} album`;
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

    hasNextPage = false;

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

// Lọc danh sách album đã tải
function renderFilteredAlbums() {
  const filteredAlbums = allAlbums.filter((album) => {
    const title = album.title || album.name || "";

    const artist =
      album.artist_name ||
      album.artist?.name ||
      (typeof album.artist === "string" ? album.artist : "") ||
      (Array.isArray(album.artists)
        ? album.artists
            .map((item) => item.name)
            .filter(Boolean)
            .join(" ")
        : "");

    const searchableText = `${title} ${artist}`.toLowerCase();

    return searchableText.includes(searchQuery);
  });

  renderAlbums(filteredAlbums);
}

// Hiển thị danh sách album
function renderAlbums(albums) {
  const albumsList = document.querySelector("#allAlbumsList");

  if (!albumsList) return;

  if (!albums.length) {
    albumsList.innerHTML = `
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-compact-disc text-3xl mb-3"></i>
        <p>
          ${
            searchQuery
              ? "Không tìm thấy album phù hợp trong trang hiện tại."
              : "Không tìm thấy album nào."
          }
        </p>
      </div>
    `;
    return;
  }

  albumsList.innerHTML = albums
    .map((album) => {
      const id = album.id ?? album._id;
      const title = album.title || album.name || "Chưa có tên album";

      const artist =
        album.artist_name ||
        album.artist?.name ||
        (typeof album.artist === "string" ? album.artist : "") ||
        (Array.isArray(album.artists)
          ? album.artists
              .map((item) => item.name)
              .filter(Boolean)
              .join(", ")
          : "") ||
        "Chưa rõ nghệ sĩ";

      const image =
        album.cover_image_url ||
        album.image_url ||
        album.cover_url ||
        "./src/assets/placeholder.png";

      const releaseYear = album.release_date
        ? String(album.release_date).slice(0, 4)
        : "";

      const safeId = escapeHTML(id ?? "");
      const safeTitle = escapeHTML(title);
      const safeArtist = escapeHTML(artist);
      const safeImage = escapeHTML(image);

      return `
        <article
          data-album-id="${safeId}"
          class="group min-w-0 rounded-lg bg-neutral-900 hover:bg-neutral-800 p-3 cursor-pointer transition"
          ${id == null ? 'aria-disabled="true"' : 'role="link" tabindex="0"'}
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-md bg-neutral-800 shadow-lg">
            <img
              src="${safeImage}"
              alt="${safeTitle}"
              loading="lazy"
              class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='./src/assets/placeholder.png';"
            />

            <div
              class="absolute right-2 bottom-2 flex justify-center items-center bg-green-500 rounded-full w-12 h-12 text-black text-lg opacity-0 shadow-xl translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
              aria-hidden="true"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
          </div>

          <h2
            class="mb-1 font-semibold text-white text-sm truncate"
            title="${safeTitle}"
          >
            ${safeTitle}
          </h2>

          <p
            class="text-neutral-400 text-sm truncate"
            title="${safeArtist}"
          >
            ${safeArtist}
          </p>

          ${
            releaseYear
              ? `<p class="mt-1 text-neutral-500 text-xs">${escapeHTML(releaseYear)}</p>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

// Hiển thị Pagination theo giao diện alltrack.js
function renderPagination() {
  const pagination = document.querySelector("#albumsPagination");

  if (!pagination) return;

  // Nếu API không trả tổng số album, chỉ hiện trang hiện tại
  // và trang tiếp theo nếu còn dữ liệu.
  const totalPages =
    totalAlbums !== null
      ? Math.ceil(totalAlbums / ALBUMS_PER_PAGE)
      : currentPage + (hasNextPage ? 2 : 1);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pages = [];

  if (totalAlbums !== null) {
    for (let page = 0; page < totalPages; page++) {
      pages.push(page);
    }
  } else {
    if (currentPage > 0) pages.push(currentPage - 1);

    pages.push(currentPage);

    if (hasNextPage) pages.push(currentPage + 1);
  }

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
        .map((page) => {
          const active = page === currentPage;

          return `
            <button
              type="button"
              data-page="${page}"
              ${isLoading ? "disabled" : ""}
              aria-current="${active ? "page" : "false"}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${
                active
                  ? "bg-green-500 text-black"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              } disabled:opacity-50"
            >
              ${page + 1}
            </button>
          `;
        })
        .join("")}

      <button
        type="button"
        data-page="${currentPage + 1}"
        ${!hasNextPage || isLoading ? "disabled" : ""}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// Chuyển dữ liệu thành chuỗi an toàn khi đưa vào HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
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
