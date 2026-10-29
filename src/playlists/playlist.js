import { playTrack } from "../player.js";
import { api } from "../app/api.js";

let isFollowingPlaylist = false;
let followRequestPending = false;
let currentPlaylist = null;
let currentPlaylistTracks = [];
let activePlaylistId = null;
let searchRequestId = 0;
let detailRequestId = 0;

const fallbackImage = `${import.meta.env.BASE_URL}playlist.png`;
const TRACKS_PER_PAGE = 10;
let currentTrackPage = 1;
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

  // Reset trạng thái khi mở playlist khác
  isFollowingPlaylist = false;
  updateFollowButton();

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
      const imageUrl =
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

      image.onerror = () => {
        console.error("Không tải được ảnh playlist:", image.src);
        image.onerror = null;
        image.src = fallbackImage;
      };

      image.src = imageUrl;

      // console.log("Playlist detail:", playlist);
      // console.log("Ảnh playlist được chọn:", imageUrl);
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

    const currentUserId = currentUser?.id;

    const isOwner =
      playlist.is_owner === true ||
      (currentUserId != null &&
        [
          playlist.owner?.id,
          playlist.owner_id,
          playlist.user_id,
          playlist.created_by,
        ].some(
          (ownerId) =>
            ownerId != null && String(ownerId) === String(currentUserId),
        ));
    // Hiển thị nút Theo dõi nếu đã đăng nhập và không phải chủ playlist
    const followBtn = document.querySelector("#toggleLibraryBtn");

    if (followBtn) {
      followBtn.classList.toggle("hidden", currentUserId == null || isOwner);
    }

    updateFollowButton();
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

    const trackCount = document.querySelector("#trackCount");

    if (trackCount) {
      const count = currentPlaylistTracks.length;
      trackCount.textContent = `${count} bài hát`;
    }

    // Reset về trang đầu khi tải lại danh sách bài hát
    currentTrackPage = 1;

    renderTrackList(currentPlaylistTracks, isOwner);

    // Khởi tạo sự kiện phân trang
    initPlaylistPaginationEvents();

    // Khởi tạo các nút chỉnh sửa
    initPlaylistEditUI(isOwner);

    document
      .querySelector("#editPlaylistBtn")
      ?.classList.toggle("hidden", !isOwner);

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

    document.querySelector("#trackPagination")?.replaceChildren();
    currentTrackPage = 1;
    return;
  }

  trackList.innerHTML = tracks
    .map(
      (track, index) => `
        <div
          class="track-row group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800"
        >
          <!-- Số thứ tự và nút phát -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center">
            <span class="track-number group-hover:hidden">
              ${index + 1}
            </span>

            <button
              type="button"
              class="play-track-btn hidden text-white hover:scale-110 group-hover:block"
              data-track-index="${index}"
              aria-label="Phát ${escapeHTML(track.title)}"
              title="Phát bài hát"
            >
              <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- Ảnh, tên bài hát và nghệ sĩ -->
          <button
            type="button"
            class="open-track-btn flex min-w-0 flex-1 items-center gap-3 text-left"
            data-track-index="${index}"
            title="Phát bài hát"
          >
            <img
              src="${escapeHTML(track.image_url || fallbackImage)}"
              alt=""
              class="h-12 w-12 shrink-0 rounded object-cover"
              onerror="this.onerror=null;this.src='${fallbackImage}'"
            />

            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-white hover:underline">
                ${escapeHTML(track.title)}
              </span>

              <span class="block truncate text-xs text-neutral-400">
                ${escapeHTML(track.artist || "Không rõ nghệ sĩ")}
              </span>
            </span>
          </button>

          <!-- Thời lượng -->
          <span class="w-12 shrink-0 text-right text-xs tabular-nums text-neutral-400">
            ${formatDuration(track.duration)}
          </span>

          <!-- Chỉ chủ playlist mới được xóa bài hát -->
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

  // Bấm nút phát hoặc tên/ảnh bài hát
  trackList.onclick = (event) => {
    // Ưu tiên xử lý nút xóa riêng
    const removeButton = event.target.closest(".remove-track-btn");
    if (removeButton) return;

    const playButton = event.target.closest(".play-track-btn, .open-track-btn");

    if (!playButton) return;

    const index = Number(playButton.dataset.trackIndex);

    const track = currentPlaylistTracks[index];
    if (!track) return;

    if (!track.audio_url) {
      console.warn("Bài hát chưa có audio_url hoặc preview_url:", track);
      return;
    }

    window.playlist = currentPlaylistTracks;
    playTrack(index);
  };

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

  renderPlaylistPagination();
}

// =========================
// Nút Play, Save và Delete
// =========================

function initButtons(isOwner) {
  const playBtn = document.querySelector("#playBtn");
  const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");
  const deleteBtn = document.querySelector("#deleteBtn");

  // =========================
  // Phát playlist
  // =========================
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

  // =========================
  // Theo dõi / Bỏ theo dõi
  // =========================
  if (toggleLibraryBtn && toggleLibraryBtn.dataset.initialized !== "true") {
    toggleLibraryBtn.dataset.initialized = "true";

    toggleLibraryBtn.addEventListener("click", async () => {
      const playlistId = activePlaylistId;

      if (!playlistId || followRequestPending) return;

      const previousState = isFollowingPlaylist;

      followRequestPending = true;
      toggleLibraryBtn.disabled = true;

      try {
        if (previousState) {
          // Bỏ theo dõi
          await api.delete(
            `/api/playlists/${encodeURIComponent(playlistId)}/follow`,
          );

          isFollowingPlaylist = false;
        } else {
          // Theo dõi
          await api.post(
            `/api/playlists/${encodeURIComponent(playlistId)}/follow`,
          );

          isFollowingPlaylist = true;
        }

        updateFollowButton();
      } catch (err) {
        isFollowingPlaylist = previousState;

        console.error("Lỗi theo dõi playlist:", err);
        console.error("Backend response:", err.response?.data);

        window.alert(
          err.response?.data?.message ||
            "Không thể cập nhật trạng thái theo dõi playlist.",
        );
      } finally {
        followRequestPending = false;
        toggleLibraryBtn.disabled = false;
      }
    });
  }

  // =========================
  // Xóa playlist
  // =========================
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

      deleteBtn.disabled = true;

      try {
        await api.delete(`/api/playlists/${encodeURIComponent(playlistId)}`);

        const homeUrl = `${import.meta.env.BASE_URL}home.html`;
        window.location.assign(homeUrl);
      } catch (err) {
        console.error("Lỗi xóa playlist:", err);
        console.error("Backend response:", err.response?.data);

        window.alert(
          err.response?.data?.message ||
            "Không thể xóa playlist. Vui lòng thử lại.",
        );
      } finally {
        deleteBtn.disabled = false;
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

let previewImageUrl = null;
let originalImageUrl = null;

function initPlaylistEditUI(isOwner) {
  const imageBtn = document.querySelector("#changeImageBtn");
  const imageInput = document.querySelector("#playlistImageInput");
  const image = document.querySelector("#detailImage");
  const preview = document.querySelector("#editPlaylistImagePreview");

  const editForm = document.querySelector("#editPlaylistForm");
  const nameInput = document.querySelector("#editPlaylistName");
  const selectImageBtn = document.querySelector("#selectPlaylistImageBtn");
  const saveBtn = document.querySelector("#savePlaylistBtn");

  const cancelBtns = [
    document.querySelector("#cancelEditPlaylistBtn"),
    document.querySelector("#cancelEditPlaylistBtnSecondary"),
  ].filter(Boolean);

  const errorEl = document.querySelector("#editPlaylistError");

  if (!imageBtn || !editForm) return;

  // Chỉ chủ sở hữu mới được mở hộp chỉnh sửa
  imageBtn.classList.toggle("hidden", !isOwner);

  if (!isOwner) {
    editForm.classList.add("hidden");
    return;
  }

  function showError(message = "") {
    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.classList.toggle("hidden", !message);
  }

  function getOriginalName() {
    return currentPlaylist?.title || currentPlaylist?.name || "";
  }

  function getOriginalImage() {
    return (
      currentPlaylist?.image_url ||
      currentPlaylist?.cover_image_url ||
      currentPlaylist?.cover_url ||
      currentPlaylist?.thumbnail_url ||
      currentPlaylist?.imageUrl ||
      currentPlaylist?.image ||
      currentPlaylist?.cover?.url ||
      currentPlaylist?.images?.[0]?.url ||
      currentPlaylist?.images?.[0] ||
      fallbackImage
    );
  }

  function openEditor() {
    if (nameInput) nameInput.value = getOriginalName();

    originalImageUrl = getOriginalImage();

    if (image) image.src = originalImageUrl;
    if (preview) preview.src = originalImageUrl;

    editForm.classList.remove("hidden");
    showError("");
    nameInput?.focus();
  }

  function closeEditor() {
    editForm.classList.add("hidden");

    if (nameInput) nameInput.value = getOriginalName();

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      previewImageUrl = null;
    }

    if (image) image.src = originalImageUrl || getOriginalImage();
    if (preview) preview.src = originalImageUrl || getOriginalImage();

    if (imageInput) imageInput.value = "";

    showError("");
  }

  // Nhấn ảnh playlist để mở hộp chỉnh sửa
  if (imageBtn.dataset.editBound !== "true") {
    imageBtn.dataset.editBound = "true";
    imageBtn.addEventListener("click", openEditor);
  }

  // Nút chọn ảnh trong hộp thoại
  if (selectImageBtn && selectImageBtn.dataset.editBound !== "true") {
    selectImageBtn.dataset.editBound = "true";
    selectImageBtn.addEventListener("click", () => imageInput?.click());
  }

  // Xem trước ảnh mới ngay lập tức
  if (imageInput && imageInput.dataset.editBound !== "true") {
    imageInput.dataset.editBound = "true";

    imageInput.addEventListener("change", () => {
      const file = imageInput.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        showError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
        imageInput.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("Ảnh không được vượt quá 5 MB.");
        imageInput.value = "";
        return;
      }

      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);

      previewImageUrl = URL.createObjectURL(file);

      if (image) image.src = previewImageUrl;
      if (preview) preview.src = previewImageUrl;

      editForm.classList.remove("hidden");
      showError("");
    });
  }

  // Cả hai nút Hủy/Đóng đều hoạt động
  cancelBtns.forEach((button) => {
    if (button.dataset.editBound === "true") return;

    button.dataset.editBound = "true";
    button.addEventListener("click", closeEditor);
  });

  // Lưu hiện chưa gọi API cập nhật

  if (saveBtn && saveBtn.dataset.editBound !== "true") {
    saveBtn.dataset.editBound = "true";

    saveBtn.addEventListener("click", async () => {
      const newName = nameInput?.value.trim() || "";
      const oldName = getOriginalName();
      const selectedFile = imageInput?.files?.[0] || null;

      if (!newName) {
        showError("Vui lòng nhập tên playlist.");
        nameInput?.focus();
        return;
      }

      if (!activePlaylistId) {
        showError("Không tìm thấy ID playlist.");
        return;
      }

      const nameChanged = newName !== oldName;

      if (!nameChanged && !selectedFile) {
        closeEditor();
        return;
      }

      if (saveBtn.disabled) return;

      saveBtn.disabled = true;
      saveBtn.textContent = "Đang lưu...";
      showError("");

      try {
        let imageUrl =
          currentPlaylist?.image_url || currentPlaylist?.imageUrl || "";

        // 1. Upload ảnh mới nếu người dùng đã chọn ảnh
        if (selectedFile) {
          const formData = new FormData();
          formData.append("cover", selectedFile);

          const uploadRes = await api.post(
            `/api/upload/playlist/${encodeURIComponent(activePlaylistId)}/cover`,
            formData,
          );

          console.log(
            "Upload response:",
            JSON.stringify(uploadRes.data, null, 2),
          );

          const uploadData = uploadRes.data;

          // Lấy URL ảnh từ phản hồi upload
          imageUrl =
            uploadData?.image_url ||
            uploadData?.imageUrl ||
            uploadData?.url ||
            uploadData?.data?.image_url ||
            uploadData?.data?.imageUrl ||
            uploadData?.data?.url ||
            uploadData?.file?.url ||
            "";

          if (!imageUrl) {
            throw new Error(
              "Upload thành công nhưng không tìm thấy URL ảnh trong phản hồi.",
            );
          }
          updatePlaylistCover(imageUrl);
        }

        // 2. Cập nhật thông tin playlist
        const payload = {
          name: newName,
        };

        if (selectedFile) {
          payload.image_url = imageUrl;
        }

        const res = await api.put(
          `/api/playlists/${encodeURIComponent(activePlaylistId)}`,
          payload,
        );

        const data = res.data;
        const updated = data?.playlist || data?.data || data;

        currentPlaylist = {
          ...currentPlaylist,
          ...(updated && typeof updated === "object" ? updated : {}),
          name: updated?.name || newName,
        };

        if (selectedFile) {
          currentPlaylist.image_url =
            updated?.image_url || updated?.imageUrl || imageUrl;
        }

        // 3. Cập nhật tên playlist trên giao diện
        const detailName = document.querySelector("#detailName");

        if (detailName) {
          detailName.textContent = currentPlaylist.name;
        }

        if (nameInput) {
          nameInput.value = currentPlaylist.name;
        }

        // 4. Cập nhật ảnh bìa trên giao diện
        const cover = document.querySelector(
          "#playlistCover, #detailImage, #playlistImage",
        );

        if (cover && currentPlaylist.image_url) {
          cover.src = currentPlaylist.image_url;
        }

        // 5. Đóng trình chỉnh sửa khi lưu thành công
        closeEditor();
      } catch (err) {
        console.error("Lỗi lưu playlist:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });

        showError(
          err.response?.data?.error?.message ||
            err.response?.data?.message ||
            err.message ||
            "Không thể cập nhật playlist. Vui lòng thử lại.",
        );
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Lưu";
      }
    });
  }
}
function updatePlaylistCover(imageUrl) {
  if (!imageUrl) return;

  const selectors = ["#playlistCover", "#detailImage", "#playlistImage"];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((img) => {
      img.src = imageUrl;
    });
  });

  // Cập nhật dữ liệu đang dùng trong trang
  if (currentPlaylist) {
    currentPlaylist.image_url = imageUrl;
    currentPlaylist.imageUrl = imageUrl;
  }
}
function updateFollowButton() {
  const button = document.querySelector("#toggleLibraryBtn");
  const text = document.querySelector("#followButtonText");
  const icon = button?.querySelector("i");

  if (!button || !text) return;

  text.textContent = isFollowingPlaylist ? "Bỏ theo dõi" : "Theo dõi";

  if (icon) {
    icon.className = isFollowingPlaylist
      ? "fa-solid fa-check mr-2"
      : "fa-solid fa-plus mr-2";
  }

  // Xóa màu của trạng thái trước
  button.classList.remove(
    "bg-neutral-700",
    "hover:bg-neutral-600",
    "text-white",
    "bg-green-500",
    "hover:bg-green-400",
    "text-black",
  );

  // Thêm màu theo trạng thái
  if (isFollowingPlaylist) {
    button.classList.add("bg-green-500", "hover:bg-green-400", "text-black");
  } else {
    button.classList.add(
      "bg-neutral-700",
      "hover:bg-neutral-600",
      "text-white",
    );
  }
}
// =========================
// Phân trang playlist
// =========================

function renderPlaylistPagination() {
  const trackList = document.querySelector("#trackList");
  const pagination = document.querySelector("#trackPagination");

  if (!trackList || !pagination) return;

  const rows = Array.from(trackList.querySelectorAll(".track-row"));
  const totalTracks = rows.length;
  const totalPages = Math.ceil(totalTracks / TRACKS_PER_PAGE);

  // Không quá 10 bài thì hiển thị tất cả
  if (totalTracks <= TRACKS_PER_PAGE) {
    rows.forEach((row) => row.classList.remove("hidden"));
    pagination.innerHTML = "";
    currentTrackPage = 1;
    return;
  }

  // Đảm bảo trang hiện tại hợp lệ
  currentTrackPage = Math.min(Math.max(currentTrackPage, 1), totalPages);

  const startIndex = (currentTrackPage - 1) * TRACKS_PER_PAGE;
  const endIndex = startIndex + TRACKS_PER_PAGE;

  // Chỉ hiển thị 10 bài của trang hiện tại
  rows.forEach((row, index) => {
    row.classList.toggle("hidden", index < startIndex || index >= endIndex);
  });

  // Render nút phân trang bằng Tailwind
  pagination.innerHTML = `
    <button
      type="button"
      data-page="${currentTrackPage - 1}"
      ${currentTrackPage === 1 ? "disabled" : ""}
      aria-label="Trang trước"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
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
    }).join("")}

    <button
      type="button"
      data-page="${currentTrackPage + 1}"
      ${currentTrackPage === totalPages ? "disabled" : ""}
      aria-label="Trang tiếp theo"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

// Đăng ký sự kiện chuyển trang một lần
function initPlaylistPaginationEvents() {
  const pagination = document.querySelector("#trackPagination");

  if (!pagination || pagination.dataset.initialized === "true") return;

  pagination.dataset.initialized = "true";

  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled) return;

    currentTrackPage = Number(button.dataset.page);

    renderPlaylistPagination();

    document.querySelector("#trackList")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}
