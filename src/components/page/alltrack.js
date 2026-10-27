import { playTrack } from "../../player.js";
import { api } from "../../app/api.js";

let currentRequestId = 0;
let eventsInitialized = false;

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

    // Cập nhật playlist dùng chung với player.
    window.playlist = normalizedTracks;

    currentTrackPage = 1;

    renderAllTracks(normalizedTracks);

    initTrackPaginationEvents();
    renderTrackPagination();
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
    id: track.id ?? track._id ?? "",
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
      "../src/assets/playlist.png",
    audio_url:
      track.audio_url ?? track.audioUrl ?? track.preview_url ?? track.url ?? "",
  };
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

  document.getElementById("btnPlayAllTracks")?.addEventListener("click", () => {
    if (window.playlist?.length) {
      playTrack(0);
    }
  });

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

    if (trackButton?.dataset.id) {
      window.location.href = `/pages/track.html?id=${encodeURIComponent(trackButton.dataset.id)}`;
    }
  });

  // Vì alltrack.html không nằm trong routes của router.js,
  // quay về Home bằng điều hướng trang thông thường.
  document.getElementById("btnGoHome")?.addEventListener("click", () => {
    window.location.href = "/pages/home.html";
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
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-music mb-3 text-2xl"></i>
        <p>Chưa có bài hát nào.</p>
      </div>
    `;
  } else {
    container.innerHTML = tracks
      .map(
        (track, index) => `
          <div
            class="group grid grid-cols-[40px_minmax(0,1fr)_100px] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 md:grid-cols-[40px_minmax(0,1fr)_minmax(100px,0.7fr)_100px]"
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
                onerror="this.onerror=null;this.src='../src/assets/playlist.png'"
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
        `,
      )
      .join("");
  }

  if (count) {
    count.textContent = `${tracks.length} bài hát`;
  }
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

function renderTrackPagination() {
  const list = document.getElementById("allTracksList");
  const pagination = document.getElementById("tracksPagination");

  if (!list || !pagination) return;

  // Lấy các hàng bài hát đã được render
  const rows = Array.from(list.children).filter(
    (element) => element.id !== "trackMessage",
  );

  const totalTracks = rows.length;
  const totalPages = Math.ceil(totalTracks / TRACKS_PER_PAGE);

  if (totalPages <= 1) {
    rows.forEach((row) => {
      row.classList.remove("hidden");
    });

    pagination.innerHTML = "";
    return;
  }

  // Giữ trang hiện tại trong giới hạn hợp lệ
  currentTrackPage = Math.min(Math.max(currentTrackPage, 1), totalPages);

  const startIndex = (currentTrackPage - 1) * TRACKS_PER_PAGE;
  const endIndex = startIndex + TRACKS_PER_PAGE;

  // Chỉ hiển thị 10 bài thuộc trang hiện tại
  rows.forEach((row, index) => {
    row.classList.toggle("hidden", index < startIndex || index >= endIndex);
  });

  // Tạo các nút chuyển trang
  pagination.innerHTML = `
    <button
      type="button"
      data-page="${currentTrackPage - 1}"
      ${currentTrackPage === 1 ? "disabled" : ""}
      class="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    ${Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      const active = page === currentTrackPage;

      return `
        <button
          type="button"
          data-page="${page}"
          aria-current="${active ? "page" : "false"}"
          class="w-10 h-10 rounded-full font-semibold transition
                 ${
                   active
                     ? "bg-green-500 text-black"
                     : "bg-neutral-800 hover:bg-neutral-700 text-white"
                 }"
        >
          ${page}
        </button>
      `;
    }).join("")}

    <button
      type="button"
      data-page="${currentTrackPage + 1}"
      ${currentTrackPage === totalPages ? "disabled" : ""}
      class="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700
             disabled:opacity-40 disabled:cursor-not-allowed"
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
