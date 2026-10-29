import { navigate } from "../../app/router.js";
import { playTrack } from "../../player.js";
import { api } from "../../app/api.js";

let currentRequestId = 0;
let eventsInitialized = false;
let allTracks = [];
let searchQuery = "";
/**
 * Khởi tạo trang danh sách tất cả bài hát.
 */
export async function initAllTrackPage() {
  const container = document.getElementById("allTracksList");

  if (!container) {
    console.error("Không tìm thấy phần tử #allTracksList");
    return;
  }

  initAllTrackEvents();
  renderLoading();

  const requestId = ++currentRequestId;

  try {
    const res = await api.get("/api/tracks?offset=0&limit=40");

    // Bỏ qua kết quả của request cũ.
    if (requestId !== currentRequestId) return;

    const data = res.data;
    const tracks = extractTracks(data);

    if (!tracks) {
      console.error("Cấu trúc dữ liệu API không hợp lệ:", data);
      throw new Error("Không đọc được danh sách bài hát từ API.");
    }

    const normalizedTracks = tracks.map(normalizeTrack);
    // console.table(normalizedTracks.map(({ id, title }) => ({ id, title })));

    // Lưu danh sách gốc để tìm kiếm và phát đúng bài hát.
    allTracks = normalizedTracks;
    window.playlist = normalizedTracks;

    currentTrackPage = 1;

    renderAllTracks(getFilteredTracks());

    initTrackPaginationEvents();
  } catch (error) {
    if (requestId !== currentRequestId) return;

    console.error(
      "Lỗi tải danh sách bài hát:",
      error.response?.data || error.message || error,
    );

    renderError(error);
  }
}

/**
 * Đọc danh sách bài hát từ các cấu trúc JSON thường gặp.
 */
function extractTracks(data) {
  if (Array.isArray(data)) {
    return data;
  }

  const candidates = [
    data?.tracks,
    data?.tracks?.items,
    data?.items,
    data?.data,
    data?.data?.tracks,
    data?.data?.items,
    data?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (Array.isArray(candidate?.items)) {
      return candidate.items;
    }
  }

  return null;
}

/**
 * Chuẩn hóa dữ liệu theo định dạng player.js đang sử dụng.
 */
function normalizeTrack(track) {
  const artist =
    track.artist_name ??
    track.artist?.name ??
    (typeof track.artist === "string" ? track.artist : null) ??
    track.artists
      ?.map((item) => item.name)
      .filter(Boolean)
      .join(", ") ??
    "Chưa rõ nghệ sĩ";

  const album =
    track.album_title ??
    track.album?.title ??
    track.album?.name ??
    (typeof track.album === "string" ? track.album : null) ??
    "Chưa rõ album";

  return {
    id: String(track.id ?? track._id ?? ""),
    title: track.title ?? track.name ?? "Chưa có tên",
    artist,
    album,
    duration: track.duration ?? track.duration_seconds ?? 0,
    image_url:
      track.image_url ??
      track.cover_image_url ??
      track.album?.image_url ??
      track.album?.cover_image_url ??
      track.album?.image ??
      `${import.meta.env.BASE_URL}playlist.png`,
    audio_url:
      track.audio_url ?? track.audioUrl ?? track.preview_url ?? track.url ?? "",
  };
}
/**
 * Lọc bài hát theo tên bài hát, nghệ sĩ và album.
 */
function getFilteredTracks() {
  return allTracks.filter((track) => {
    const searchableText = [track.title, track.artist, track.album]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });
}
/**
 * Đăng ký sự kiện một lần.
 */
function initAllTrackEvents() {
  if (eventsInitialized) return;

  const container = document.getElementById("allTracksList");

  if (!container) return;

  eventsInitialized = true;

  document
    .getElementById("btnReloadTracks")
    ?.addEventListener("click", initAllTrackPage);

  document
    .getElementById("btnRetryTracks")
    ?.addEventListener("click", initAllTrackPage);

  // Tìm kiếm bài hát
  document
    .getElementById("trackSearchInput")
    ?.addEventListener("input", (event) => {
      searchQuery = event.target.value.trim().toLowerCase();

      currentTrackPage = 1;

      renderAllTracks(getFilteredTracks());
      renderTrackPagination();
    });

  // Phát tất cả bài hát
  document.getElementById("btnPlayAllTracks")?.addEventListener("click", () => {
    if (window.playlist?.length) {
      playTrack(0);
    }
  });

  // Xử lý click trong danh sách bài hát
  container.addEventListener("click", (event) => {
    const playButton = event.target.closest(".play-track-btn");

    if (playButton) {
      const index = Number(playButton.dataset.index);

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < (window.playlist?.length ?? 0)
      ) {
        playTrack(index);
      }

      return;
    }

    const trackButton = event.target.closest(".open-track-btn");

    if (trackButton) {
      const trackId = trackButton.dataset.id;

      console.log("Bài hát được chọn:", {
        id: trackId,
        title: trackButton.textContent.trim(),
      });

      if (!trackId) {
        console.error("Bài hát này không có ID hợp lệ.");
        return;
      }

      navigate("track", { id: trackId });
    }
  });

  // Quay về Home
  document.getElementById("btnGoHome")?.addEventListener("click", () => {
    window.location.href = "/CLone_Spotify/home.html";
  });
}

/**
 * Hiển thị trạng thái đang tải.
 */
function renderLoading() {
  const container = document.getElementById("allTracksList");
  const count = document.getElementById("trackCount");

  if (container) {
    container.innerHTML = `
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-spinner fa-spin mb-3 text-2xl"></i>
        <p>Đang tải danh sách bài hát...</p>
      </div>
    `;
  }

  if (count) {
    count.textContent = "Đang tải danh sách bài hát...";
  }
}

/**
 * Hiển thị danh sách bài hát.
 */
function renderAllTracks(tracks) {
  const container = document.getElementById("allTracksList");
  const count = document.getElementById("trackCount");

  if (!container) return;

  if (tracks.length === 0) {
    container.innerHTML = `
    <div
      id="trackMessage"
      class="px-4 py-10 text-center text-neutral-400"
    >
      <i class="fa-solid fa-music mb-3 text-2xl"></i>
      <p>
        ${
          searchQuery
            ? "Không tìm thấy bài hát phù hợp."
            : "Chưa có bài hát nào."
        }
      </p>
    </div>
  `;
  } else {
    container.innerHTML = tracks
      .map((track) => {
        const index = allTracks.indexOf(track);

        return `
      <div
        class="track-row group grid grid-cols-[40px_minmax(0,1fr)_100px] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 md:grid-cols-[40px_minmax(0,1fr)_minmax(100px,0.7fr)_100px]"
      >
        <div class="flex items-center justify-center">
          <span class="track-number group-hover:hidden">
            ${index + 1}
          </span>

          <button
            type="button"
            class="play-track-btn hidden text-white group-hover:block"
            data-index="${index}"
            aria-label="Phát ${escapeHTML(track.title)}"
            title="Phát bài hát"
          >
            <i class="fa-solid fa-play"></i>
          </button>
        </div>

        <div class="flex min-w-0 items-center gap-3">
          <img
            src="${escapeHTML(track.image_url)}"
            alt=""
            class="h-10 w-10 shrink-0 rounded object-cover"
            onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png'"
          />

          <button
            type="button"
            class="open-track-btn min-w-0 text-left"
            data-id="${escapeHTML(track.id)}"
            title="Xem chi tiết bài hát"
          >
            <span class="block truncate font-medium text-white hover:underline">
              ${escapeHTML(track.title)}
            </span>
            <span class="block truncate text-xs text-neutral-400">
              ${escapeHTML(track.artist)}
            </span>
          </button>
        </div>

        <span class="hidden truncate md:block">
          ${escapeHTML(track.album)}
        </span>

        <span class="text-right tabular-nums">
          ${formatDuration(track.duration)}
        </span>
      </div>
    `;
      })
      .join("");
  }

  if (count) {
    count.textContent = searchQuery
      ? `Tìm thấy ${tracks.length} bài hát`
      : `${tracks.length} bài hát`;
  }
  renderTrackPagination();
}

/**
 * Hiển thị lỗi và nút thử lại.
 */
function renderError(error) {
  const container = document.getElementById("allTracksList");
  const count = document.getElementById("trackCount");

  if (container) {
    container.innerHTML = `
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-circle-exclamation mb-3 text-2xl"></i>
        <p class="mb-2">Không thể tải danh sách bài hát.</p>
        <p class="mb-4 text-sm">
          ${escapeHTML(getErrorMessage(error))}
        </p>
        <button
          type="button"
          id="btnRetryTracks"
          class="rounded-full bg-white px-4 py-2 font-semibold text-black hover:scale-105"
        >
          Thử lại
        </button>
      </div>
    `;

    // Gắn sự kiện cho nút thử lại vừa được render.
    container
      .querySelector("#btnRetryTracks")
      ?.addEventListener("click", initAllTrackPage);
  }

  if (count) {
    count.textContent = "Không tải được bài hát";
  }
}

function getErrorMessage(error) {
  if (error.response) {
    return `Máy chủ trả về lỗi ${error.response.status}.`;
  }

  if (error.request) {
    return "Không nhận được phản hồi từ máy chủ. Hãy kiểm tra kết nối mạng.";
  }

  return error.message || "Đã xảy ra lỗi không xác định.";
}

/**
 * Tránh chèn HTML không an toàn.
 */
function escapeHTML(value = "") {
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

/**
 * Chuyển số giây thành phút:giây.
 */
function formatDuration(seconds) {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);

  return `${min}:${String(sec).padStart(2, "0")}`;
}
const TRACKS_PER_PAGE = 10;
let currentTrackPage = 1;

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
function renderTrackPagination() {
  const list = document.getElementById("allTracksList");
  const pagination = document.getElementById("tracksPagination");

  if (!list || !pagination) return;

  const rows = Array.from(list.querySelectorAll(".track-row"));
  const totalTracks = rows.length;

  // Không quá 10 bài thì hiển thị tất cả, không phân trang
  if (totalTracks <= TRACKS_PER_PAGE) {
    rows.forEach((row) => row.classList.remove("hidden"));
    pagination.innerHTML = "";
    currentTrackPage = 1;
    return;
  }

  const totalPages = Math.ceil(totalTracks / TRACKS_PER_PAGE);

  currentTrackPage = Math.min(Math.max(currentTrackPage, 1), totalPages);

  const startIndex = (currentTrackPage - 1) * TRACKS_PER_PAGE;
  const endIndex = startIndex + TRACKS_PER_PAGE;

  // Chỉ hiển thị 10 bài của trang hiện tại
  rows.forEach((row, index) => {
    row.classList.toggle("hidden", index < startIndex || index >= endIndex);
  });

  // Render nút phân trang
  pagination.innerHTML = `
    <button
      type="button"
      data-page="${currentTrackPage - 1}"
      ${currentTrackPage === 1 ? "disabled" : ""}
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

  ${getVisiblePages(currentTrackPage, totalPages)
    .map((page) => {
      if (page === "...") {
        return `
        <span class="px-2 text-neutral-400 select-none">...</span>
      `;
      }

      const active = page === currentTrackPage;

      return `
      <button
        type="button"
        data-page="${page}"
        aria-current="${active ? "page" : "false"}"
        class="h-10 w-10 rounded-full font-semibold transition
          ${
            active
              ? "bg-green-500 text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }"
      >
        ${page}
      </button>
    `;
    })
    .join("")}

    <button
      type="button"
      data-page="${currentTrackPage + 1}"
      ${currentTrackPage === totalPages ? "disabled" : ""}
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

// Đăng ký sự kiện chuyển trang
function initTrackPaginationEvents() {
  const pagination = document.getElementById("tracksPagination");

  if (!pagination || pagination.dataset.initialized === "true") return;

  pagination.dataset.initialized = "true";

  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled) return;

    currentTrackPage = Number(button.dataset.page);

    renderTrackPagination();

    document.getElementById("mainContent")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
