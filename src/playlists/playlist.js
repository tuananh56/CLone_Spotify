import { playTrack } from "../player.js";
import { api } from "../app/api.js";

let currentPlaylist = null;
let currentPlaylistTracks = [];
let activePlaylistId = null;
let searchRequestId = 0;
let detailRequestId = 0;

const fallbackImage = "..`${import.meta.env.BASE_URL}playlist.png`";

// =========================
// Khởi tạo trang Playlist
// =========================

export async function initPlaylistPage(id) {
  const params = new URLSearchParams(window.location.search);

  const resolvedId =
    id ||
    params.get("id") ||
    document.querySelector("[data-playlist-id]")?.dataset.playlistId;

  if (!resolvedId) {
    console.error("[Playlist:init] Không tìm thấy ID playlist");
    return;
  }

  activePlaylistId = String(resolvedId);
  currentPlaylist = null;
  currentPlaylistTracks = [];

  const requestId = ++detailRequestId;
  searchRequestId++;

  document.body.dataset.playlistId = activePlaylistId;

  bindSearchInput();

  await loadPlaylistDetail(activePlaylistId, requestId);
}

// =========================
// Tải chi tiết Playlist
// =========================

async function loadPlaylistDetail(id, requestId = ++detailRequestId) {
  try {
    const res = await api.get(`/api/playlists/${encodeURIComponent(id)}`);

    if (requestId !== detailRequestId) return;

    const playlist = res.data;
    currentPlaylist = playlist;

    const image = document.querySelector("#detailImage");
    const name = document.querySelector("#detailName");
    const desc = document.querySelector("#detailDesc");

    if (image) {
      image.src = playlist.image_url || fallbackImage;
    }

    if (name) {
      name.textContent = playlist.title || playlist.name || "Playlist";
    }

    if (desc) {
      desc.textContent =
        playlist.additional_info?.description || playlist.description || "";
    }

    let currentUser = null;

    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      currentUser = null;
    }

    const currentUserName = currentUser?.name;

    const isOwner =
      playlist.is_owner === true ||
      playlist.owner?.display_name === currentUserName ||
      playlist.additional_info?.creator_name === currentUserName;

    const deleteBtn = document.querySelector("#deleteBtn");

    if (deleteBtn) {
      deleteBtn.classList.toggle("hidden", !isOwner);
    }

    let rawTracks = getPlaylistTracks(playlist);

    if (rawTracks.length === 0) {
      try {
        const tracksRes = await api.get(
          `/api/playlists/${encodeURIComponent(id)}/tracks`,
        );

        if (requestId !== detailRequestId) return;

        const data = tracksRes.data;

        rawTracks = Array.isArray(data)
          ? data
          : (data?.tracks ??
            data?.items ??
            data?.results?.tracks ??
            data?.results ??
            data?.data?.tracks ??
            data?.data?.items ??
            []);

        if (!Array.isArray(rawTracks)) {
          rawTracks = [];
        }
      } catch (trackErr) {
        if (requestId !== detailRequestId) return;

        console.error("[API tracks] Không tải được danh sách:", {
          status: trackErr.response?.status,
          data: trackErr.response?.data,
          message: trackErr.message,
        });
      }
    }

    if (requestId !== detailRequestId) return;

    // Lưu danh sách riêng cho trang playlist.
    // Không ghi đè window.playlist khi chỉ mở trang.
    currentPlaylistTracks = rawTracks.map(normalizeTrack);

    renderTrackList(currentPlaylistTracks, isOwner);

    const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");

    // if (toggleLibraryBtn) {
    //   toggleLibraryBtn.textContent = playlist.is_following
    //     ? "Remove from Your Library"
    //     : "Save to Your Library";
    // }

    initButtons(isOwner);
  } catch (err) {
    if (requestId !== detailRequestId) return;

    console.error("[Playlist:load] Lỗi tải playlist:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
  }
}

// =========================
// Chuẩn hóa dữ liệu
// =========================

function getPlaylistTracks(playlist) {
  const tracks =
    playlist?.tracks ?? playlist?.items ?? playlist?.results?.tracks ?? [];

  if (Array.isArray(tracks)) return tracks;
  if (Array.isArray(tracks?.items)) return tracks.items;
  if (Array.isArray(tracks?.data)) return tracks.data;

  return [];
}

function normalizeTrack(track) {
  const source = track?.track || track || {};

  return {
    id: source.track_id || source.id || source._id || source.trackId || "",
    title: source.track_title || source.title || source.name || "Không rõ tên",
    artist:
      source.artist_name ||
      source.subtitle ||
      source.artist?.name ||
      source.artist ||
      "",
    album: source.album_title || source.album?.name || source.album || "",
    duration: Number(
      source.track_duration ??
        source.duration ??
        (source.duration_ms != null ? source.duration_ms / 1000 : 0),
    ),
    image_url:
      source.track_image_url ||
      source.image_url ||
      source.album_cover_image_url ||
      source.album?.image_url ||
      fallbackImage,
    audio_url:
      source.track_audio_url || source.audio_url || source.preview_url || "",
  };
}

// =========================
// Render danh sách bài hát
// =========================

function renderTrackList(tracks, isOwner = false) {
  const trackList = document.querySelector("#trackList");

  if (!trackList) {
    console.error("[renderTrackList] Không tìm thấy #trackList");
    return;
  }

  if (!tracks.length) {
    trackList.innerHTML = `
      <p class="px-3 py-5 text-sm text-gray-400">
        Playlist này chưa có bài hát nào.
      </p>
    `;
    return;
  }

  trackList.innerHTML = tracks
    .map(
      (track, index) => `
        <div
          class="track-row flex w-full items-center justify-between gap-3 rounded p-3 hover:bg-neutral-800"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            data-track-index="${index}"
          >
            <span class="text-gray-400">${index + 1}</span>

            <img
              src="${escapeHTML(track.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <span class="min-w-0">
              <span class="block truncate text-white">
                ${escapeHTML(track.title)}
              </span>
              <span class="block truncate text-sm text-gray-400">
                ${escapeHTML(track.artist)}
              </span>
            </span>
          </button>

          <span class="shrink-0 text-xs text-gray-400">
            ${formatDuration(track.duration)}
          </span>

          ${
            isOwner
              ? `
                <button
                  type="button"
                  class="remove-track-btn rounded-full px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                  data-track-index="${index}"
                  title="Xóa khỏi playlist"
                  aria-label="Xóa ${escapeHTML(track.title)} khỏi playlist"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `
              : ""
          }
        </div>
      `,
    )
    .join("");

  // Bấm vào bài hát để phát
  trackList
    .querySelectorAll("[data-track-index]:not(.remove-track-btn)")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.trackIndex);
        const track = currentPlaylistTracks[index];

        if (!track) return;

        if (!track.audio_url) {
          console.warn("Bài hát chưa có audio_url hoặc preview_url:", track);
          return;
        }

        window.playlist = currentPlaylistTracks;
        playTrack(index);
      });
    });

  // Xóa bài hát khỏi playlist
  trackList.querySelectorAll(".remove-track-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!isOwner) return;

      const playlistId = activePlaylistId;
      const index = Number(button.dataset.trackIndex);
      const track = currentPlaylistTracks[index];

      if (!playlistId || !track?.id) {
        console.error("Thiếu ID playlist hoặc bài hát", {
          playlistId,
          track,
        });
        return;
      }

      if (
        !window.confirm(
          `Bạn có chắc muốn xóa "${track.title}" khỏi playlist này không?`,
        )
      ) {
        return;
      }

      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      try {
        await api.delete(
          `/api/playlists/${encodeURIComponent(playlistId)}/tracks/${encodeURIComponent(track.id)}`,
        );

        // Tải lại danh sách bài hát sau khi xóa thành công
        if (playlistId === activePlaylistId) {
          await loadPlaylistDetail(playlistId);
        }
      } catch (err) {
        console.error("Lỗi xóa bài hát khỏi playlist:", err);
        console.error("Backend response:", err.response?.data);

        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        window.alert(
          err.response?.data?.message ||
            "Không thể xóa bài hát. Hãy kiểm tra API backend.",
        );
      }
    });
  });
}

// =========================
// Nút Play, Save và Delete
// =========================

function initButtons(isOwner) {
  const playBtn = document.querySelector("#playBtn");
  const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");
  const deleteBtn = document.querySelector("#deleteBtn");

  if (playBtn && playBtn.dataset.initialized !== "true") {
    playBtn.dataset.initialized = "true";

    playBtn.addEventListener("click", () => {
      const tracks = currentPlaylistTracks;

      if (!tracks.length) {
        console.warn("Playlist chưa có bài hát để phát");
        return;
      }

      const firstPlayableIndex = tracks.findIndex((track) =>
        Boolean(track.audio_url),
      );

      if (firstPlayableIndex === -1) {
        console.warn("Không có bài hát nào có audio_url hoặc preview_url");
        return;
      }

      window.playlist = tracks;
      playTrack(firstPlayableIndex);
    });
  }

  if (toggleLibraryBtn && toggleLibraryBtn.dataset.initialized !== "true") {
    toggleLibraryBtn.dataset.initialized = "true";

    toggleLibraryBtn.addEventListener("click", async () => {
      const playlistId = activePlaylistId;
      if (!playlistId) return;

      try {
        if (toggleLibraryBtn.textContent.includes("Save")) {
          await api.post(
            `/api/playlists/${encodeURIComponent(playlistId)}/followers`,
          );

          if (playlistId === activePlaylistId) {
            toggleLibraryBtn.textContent = "Remove from Your Library";
          }
        } else {
          await api.delete(
            `/api/playlists/${encodeURIComponent(playlistId)}/followers`,
          );

          if (playlistId === activePlaylistId) {
            toggleLibraryBtn.textContent = "Save to Your Library";
          }
        }
      } catch (err) {
        console.error("Lỗi cập nhật thư viện:", err);
        console.error("Backend response:", err.response?.data);
      }
    });
  }

  if (deleteBtn && deleteBtn.dataset.initialized !== "true") {
    deleteBtn.dataset.initialized = "true";

    deleteBtn.addEventListener("click", async () => {
      if (!isOwner) return;

      const playlistId = activePlaylistId;
      if (!playlistId) return;

      const confirmed = window.confirm(
        "Bạn có chắc muốn xóa playlist này không?",
      );

      if (!confirmed) return;

      try {
        await api.delete(`/api/playlists/${encodeURIComponent(playlistId)}`);

        if (playlistId === activePlaylistId) {
          if (typeof window.goHome === "function") {
            window.goHome();
          } else {
            window.location.href = "/CLone_Spotify/home.html";
          }
        }
      } catch (err) {
        console.error("Lỗi xóa playlist:", err);
        console.error("Backend response:", err.response?.data);
      }
    });
  }
}

// =========================
// Tìm kiếm bài hát
// =========================

function bindSearchInput() {
  const searchInput = document.querySelector("#playlistTrackSearch");

  if (!searchInput || searchInput.dataset.initialized === "true") {
    return;
  }

  searchInput.dataset.initialized = "true";

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    const requestId = ++searchRequestId;

    if (!query) {
      document.querySelector("#trackSearchResults")?.replaceChildren();
      return;
    }

    try {
      const res = await api.get(
        `/api/search?q=${encodeURIComponent(query)}&type=track`,
      );

      if (requestId !== searchRequestId) return;

      renderSearchResults(getSearchTracks(res.data));
    } catch (err) {
      if (requestId !== searchRequestId) return;

      console.error("Lỗi API tìm kiếm:", err);
      console.error("Backend response:", err.response?.data);
    }
  });
}

function getSearchTracks(data) {
  const results = data?.results;

  if (Array.isArray(results)) return results;

  const candidates = [
    results?.tracks?.items,
    results?.tracks,
    results?.items,
    results?.data?.tracks,
    results?.data?.items,
    data?.tracks?.items,
    data?.tracks,
    data?.items,
  ];

  return candidates.find(Array.isArray) || [];
}

function renderSearchResults(tracks) {
  const container = document.querySelector("#trackSearchResults");

  if (!container) return;

  if (!Array.isArray(tracks) || tracks.length === 0) {
    container.innerHTML = `
      <p class="py-3 text-sm text-gray-400">
        Không tìm thấy bài hát phù hợp.
      </p>
    `;
    return;
  }

  container.innerHTML = tracks
    .map((track, index) => {
      const normalized = normalizeTrack(track);

      const trackId =
        track.track_id ||
        track.id ||
        track._id ||
        track.trackId ||
        track.track?.id ||
        track.track?.track_id ||
        normalized.id ||
        "";

      return `
        <div class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="${escapeHTML(normalized.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-white">
                ${escapeHTML(normalized.title)}
              </p>

              <p class="truncate text-sm text-gray-400">
                ${escapeHTML(normalized.artist)}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="add-track-btn rounded bg-green-600 px-3 py-1 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            data-track-id="${escapeHTML(trackId)}"
          >
            Thêm
          </button>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".add-track-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const playlistId = activePlaylistId;
      const trackId = button.dataset.trackId;

      if (!playlistId || !trackId) {
        console.error("Thiếu ID playlist hoặc bài hát:", {
          playlistId,
          trackId,
        });
        return;
      }

      button.disabled = true;
      button.textContent = "Đang thêm...";

      try {
        await api.post(
          `/api/playlists/${encodeURIComponent(playlistId)}/tracks`,
          { track_id: trackId },
        );

        button.textContent = "Đã thêm";

        if (playlistId === activePlaylistId) {
          await loadPlaylistDetail(playlistId);
        }
      } catch (err) {
        console.error("HTTP status:", err.response?.status);
        console.error("Backend response:", err.response?.data);
        console.error("Track ID:", trackId);
        console.error("Request URL:", err.config?.url);
        console.error("Request body:", err.config?.data);

        button.disabled = false;
        button.textContent = "Thử lại";
      }
    });
  });
}

// =========================
// Hàm tiện ích
// =========================

function formatDuration(seconds) {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);

  return `${min}:${String(sec).padStart(2, "0")}`;
}

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
