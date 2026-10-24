import { api } from "../app/api.js";
import { playTrack } from "../player.js";

const params = new URLSearchParams(window.location.search);
const playlistId = params.get("id");

let currentPlaylist = null;
let searchRequestId = 0;

const fallbackImage = "/src/assets/playlist.png";

// =========================
// Khởi tạo trang Playlist
// =========================

if (playlistId) {
  loadPlaylistDetail(playlistId);
} else {
  console.error("Không tìm thấy ID playlist trong URL");
}

// =========================
// Tải chi tiết Playlist
// =========================

async function loadPlaylistDetail(id) {
  try {
    const res = await api.get(`/api/playlists/${encodeURIComponent(id)}`);

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

    // Lấy danh sách bài hát trong playlist
    let rawTracks = getPlaylistTracks(playlist);

    if (rawTracks.length === 0) {
      try {
        const tracksRes = await api.get(
          `/api/playlists/${encodeURIComponent(id)}/tracks`,
        );

        const data = tracksRes.data;

        rawTracks = Array.isArray(data)
          ? data
          : (data.tracks ??
            data.items ??
            data.results?.tracks ??
            data.results ??
            []);
      } catch (trackErr) {
        console.error(
          "Không lấy được danh sách bài hát:",
          trackErr.response?.status,
          trackErr.response?.data || trackErr.message,
        );
      }
    }

    window.playlist = rawTracks.map(normalizeTrack);
    renderTrackList(window.playlist);

    // Cập nhật nút lưu thư viện
    const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");

    if (toggleLibraryBtn) {
      toggleLibraryBtn.textContent = playlist.is_following
        ? "Remove from Your Library"
        : "Save to Your Library";
    }

    initButtons(id, isOwner);
  } catch (err) {
    console.error("Lỗi load playlist:", err);
    console.error("Backend response:", err.response?.data);
  }
}

function getPlaylistTracks(playlist) {
  const tracks =
    playlist.tracks ?? playlist.items ?? playlist.results?.tracks ?? [];

  if (Array.isArray(tracks)) {
    return tracks;
  }

  if (Array.isArray(tracks.items)) {
    return tracks.items;
  }

  if (Array.isArray(tracks.data)) {
    return tracks.data;
  }

  return [];
}

function normalizeTrack(track) {
  return {
    id: track.track_id || track.id || "",
    title: track.track_title || track.title || track.name || "Không rõ tên",
    artist: track.artist_name || track.subtitle || track.artist || "",
    album: track.album_title || track.album?.name || "",
    duration: Number(
      track.track_duration ?? track.duration ?? track.duration_ms / 1000 ?? 0,
    ),
    image_url:
      track.track_image_url ||
      track.image_url ||
      track.album_cover_image_url ||
      fallbackImage,
    audio_url:
      track.track_audio_url || track.audio_url || track.preview_url || "",
  };
}

// =========================
// Render danh sách bài hát
// =========================

function renderTrackList(tracks) {
  const trackList = document.querySelector("#trackList");

  if (!trackList) return;

  if (!tracks.length) {
    trackList.innerHTML = `
      <p class="text-gray-400 text-sm italic">
        Playlist này chưa có bài hát nào.
      </p>
    `;
    return;
  }

  trackList.innerHTML = tracks
    .map(
      (track, index) => `
        <button
          type="button"
          class="track-row flex w-full items-center justify-between rounded p-3 text-left hover:bg-neutral-800"
          data-track-index="${index}"
        >
          <span class="flex min-w-0 items-center gap-3">
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
          </span>

          <span class="ml-4 text-xs text-gray-400">
            ${formatDuration(track.duration)}
          </span>
        </button>
      `,
    )
    .join("");

  trackList.querySelectorAll(".track-row").forEach((row) => {
    row.addEventListener("click", () => {
      const index = Number(row.dataset.trackIndex);
      const track = window.playlist[index];

      if (!track) return;

      if (!track.audio_url) {
        console.warn("Bài hát chưa có audio_url hoặc preview_url:", track);
        return;
      }

      playTrack(index);
    });
  });
}

// =========================
// Nút Play, Save và Delete
// =========================

function initButtons(id, isOwner) {
  const playBtn = document.querySelector("#playBtn");
  const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");
  const deleteBtn = document.querySelector("#deleteBtn");

  if (playBtn && !playBtn.dataset.initialized) {
    playBtn.dataset.initialized = "true";

    playBtn.addEventListener("click", () => {
      const tracks = window.playlist || [];

      if (!tracks.length) {
        console.warn("Playlist chưa có bài hát để phát");
        return;
      }

      const firstPlayableIndex = tracks.findIndex((track) =>
        Boolean(track.audio_url),
      );

      if (firstPlayableIndex === -1) {
        console.warn("Không có bài hát nào chứa audio_url hoặc preview_url");
        return;
      }

      playTrack(firstPlayableIndex);
    });
  }

  if (toggleLibraryBtn && !toggleLibraryBtn.dataset.initialized) {
    toggleLibraryBtn.dataset.initialized = "true";

    toggleLibraryBtn.addEventListener("click", async () => {
      try {
        if (toggleLibraryBtn.textContent.includes("Save")) {
          await api.post(`/api/playlists/${id}/followers`);
          toggleLibraryBtn.textContent = "Remove from Your Library";
        } else {
          await api.delete(`/api/playlists/${id}/followers`);
          toggleLibraryBtn.textContent = "Save to Your Library";
        }
      } catch (err) {
        console.error("Lỗi cập nhật thư viện:", err);
        console.error("Backend response:", err.response?.data);
      }
    });
  }

  if (isOwner && deleteBtn && !deleteBtn.dataset.initialized) {
    deleteBtn.dataset.initialized = "true";

    deleteBtn.addEventListener("click", async () => {
      const confirmed = window.confirm(
        "Bạn có chắc muốn xóa playlist này không?",
      );

      if (!confirmed) return;

      try {
        await api.delete(`/api/playlists/${id}`);
        window.location.href = "/home.html";
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

const searchInput = document.querySelector("#playlistTrackSearch");

if (searchInput) {
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

      const tracks = getSearchTracks(res.data);
      renderSearchResults(tracks);
    } catch (err) {
      if (requestId !== searchRequestId) return;

      console.error("Lỗi API tìm kiếm:", err);
      console.error("Backend response:", err.response?.data);
    }
  });
}

function getSearchTracks(data) {
  const results = data?.results;

  if (Array.isArray(results)) {
    return results;
  }

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
        track.id || track.track_id || track._id || track.trackId || "";

      return `
        <div
          class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800"
        >
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
            data-result-index="${index}"
          >
            Thêm
          </button>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".add-track-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const trackId = button.dataset.trackId;

      if (!playlistId || !trackId) {
        console.error("Thiếu playlistId hoặc trackId");
        return;
      }

      button.disabled = true;
      button.textContent = "Đang thêm...";

      try {
        await api.post(
          `/api/playlists/${encodeURIComponent(playlistId)}/tracks`,
          {
            track_id: trackId,
          },
        );

        button.textContent = "Đã thêm";

        await loadPlaylistDetail(playlistId);
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
