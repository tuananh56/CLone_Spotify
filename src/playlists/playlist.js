import { api } from "../app/api.js";
import { playTrack } from "../player.js";

let currentPlaylist = null;
let activePlaylistId = null;
let searchRequestId = 0;

const fallbackImage = "/src/assets/playlist.png";

// =========================
// Khởi tạo trang Playlist
// =========================

export async function initPlaylistPage(id) {
  const params = new URLSearchParams(window.location.search);

  const resolvedId =
    id ||
    params.get("id") ||
    document.querySelector("[data-playlist-id]")?.dataset.playlistId;

  console.log("[Playlist:init] Bắt đầu khởi tạo", {
    receivedId: id,
    urlId: params.get("id"),
    dataPlaylistId:
      document.querySelector("[data-playlist-id]")?.dataset.playlistId,
    resolvedId,
    url: window.location.href,
    trackListExists: !!document.querySelector("#trackList"),
  });

  if (!resolvedId) {
    console.error("[Playlist:init] Không tìm thấy ID playlist");
    return;
  }

  activePlaylistId = String(resolvedId);
  currentPlaylist = null;
  searchRequestId++;

  document.body.dataset.playlistId = activePlaylistId;

  console.log("[Playlist:init] Đã gán activePlaylistId:", activePlaylistId);

  await loadPlaylistDetail(activePlaylistId);
}

// =========================
// Tải chi tiết Playlist
// =========================

async function loadPlaylistDetail(id) {
  console.group("[Playlist:load] Tải chi tiết playlist");

  console.log("Playlist ID:", id);
  console.log("activePlaylistId:", activePlaylistId);
  console.log("URL hiện tại:", window.location.href);
  console.log("#trackList tồn tại:", !!document.querySelector("#trackList"));

  try {
    const res = await api.get(`/api/playlists/${encodeURIComponent(id)}`);

    const playlist = res.data;
    currentPlaylist = playlist;

    console.log("[API detail] HTTP status:", res.status);
    console.log("[API detail] Dữ liệu trả về:", playlist);
    console.log("[API detail] Các key:", Object.keys(playlist || {}));

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

    // Kiểm tra danh sách bài hát trong API chi tiết
    let rawTracks = getPlaylistTracks(playlist);

    console.log("[API detail] Tracks lấy được:", rawTracks);
    console.log("[API detail] Số bài hát:", rawTracks.length);

    // Nếu API chi tiết không có bài hát, gọi API /tracks
    if (rawTracks.length === 0) {
      console.warn("[Playlist:load] Tracks rỗng, gọi API /tracks");

      try {
        const tracksRes = await api.get(
          `/api/playlists/${encodeURIComponent(id)}/tracks`,
        );

        const data = tracksRes.data;

        console.log("[API tracks] HTTP status:", tracksRes.status);
        console.log("[API tracks] Dữ liệu trả về:", data);
        console.log(
          "[API tracks] Kiểu dữ liệu:",
          Array.isArray(data) ? "Array" : typeof data,
        );

        rawTracks = Array.isArray(data)
          ? data
          : (data?.tracks ??
            data?.items ??
            data?.results?.tracks ??
            data?.results ??
            data?.data?.tracks ??
            data?.data?.items ??
            []);

        console.log("[API tracks] Danh sách đã trích xuất:", rawTracks);
        console.log("[API tracks] Số bài hát:", rawTracks.length);
      } catch (trackErr) {
        console.error("[API tracks] Không tải được danh sách:", {
          status: trackErr.response?.status,
          data: trackErr.response?.data,
          message: trackErr.message,
        });
      }
    }

    window.playlist = rawTracks.map(normalizeTrack);

    console.log("[Playlist:load] Danh sách sau normalize:", window.playlist);
    console.log(
      "[Playlist:load] Số bài hát sau normalize:",
      window.playlist.length,
    );
    console.table(
      window.playlist.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        audio_url: track.audio_url,
        duration: track.duration,
      })),
    );

    renderTrackList(window.playlist);

    console.log(
      "[Playlist:render] HTML trackList:",
      document.querySelector("#trackList")?.innerHTML,
    );
    console.log(
      "[Playlist:render] Số dòng bài hát:",
      document.querySelectorAll("#trackList .track-row").length,
    );

    const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");

    if (toggleLibraryBtn) {
      toggleLibraryBtn.textContent = playlist.is_following
        ? "Remove from Your Library"
        : "Save to Your Library";
    }

    initButtons(id, isOwner);

    console.log("[Playlist:load] Hoàn tất tải playlist");
  } catch (err) {
    console.error("[Playlist:load] Lỗi tải playlist:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      stack: err.stack,
    });
  } finally {
    console.groupEnd();
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
  const source = track.track || track;

  return {
    id: source.track_id || source.id || source._id || source.trackId || "",
    title: source.track_title || source.title || source.name || "Không rõ tên",
    artist: source.artist_name || source.subtitle || source.artist || "",
    album: source.album_title || source.album?.name || "",
    duration: Number(
      source.track_duration ??
        source.duration ??
        (source.duration_ms != null ? source.duration_ms / 1000 : 0),
    ),
    image_url:
      source.track_image_url ||
      source.image_url ||
      source.album_cover_image_url ||
      fallbackImage,
    audio_url:
      source.track_audio_url || source.audio_url || source.preview_url || "",
  };
}

// =========================
// Render danh sách bài hát
// =========================

function renderTrackList(tracks) {
  const trackList = document.querySelector("#trackList");

  console.log("[renderTrackList] Bắt đầu", {
    tracks,
    count: tracks?.length,
    trackListExists: !!trackList,
  });

  if (!trackList) {
    console.error("[renderTrackList] Không tìm thấy #trackList trong DOM");
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
  const playlistId =
    activePlaylistId ||
    document.body.dataset.playlistId ||
    new URLSearchParams(window.location.search).get("id");

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
      console.log("Search track:", track);
      console.log("Resolved trackId:", trackId);
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
        console.error("Thiếu ID khi thêm bài hát:", {
          playlistId,
          activePlaylistId,
          trackId,
        });
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
document.addEventListener("DOMContentLoaded", async () => {
  if (document.querySelector("#trackList")) {
    await initPlaylistPage();
  }
});