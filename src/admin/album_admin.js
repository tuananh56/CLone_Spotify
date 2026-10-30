import Swal from "sweetalert2";
import { api } from "../app/api.js";

const ALBUM_API = "/api/albums";
const ARTIST_API = "/api/artists";
const TRACK_API = "/api/tracks";

const API_LIMIT = 20;
const ALBUMS_PER_PAGE = 10;

let allAlbums = [];
let filteredAlbums = [];
let artists = [];
let allTracks = [];

let currentPage = 1;
let editingAlbumId = null;
let currentManagingAlbum = null;

let initialized = false;
let previewObjectUrl = null;

// ======================================
// DOM ELEMENTS
// ======================================

function getElements() {
  return {
    tableBody: document.getElementById("albumsTableBody"),
    searchInput: document.getElementById("albumSearch"),
    searchBtn: document.getElementById("albumSearchBtn"),
    pagination: document.getElementById("albumsPagination"),
    addBtn: document.getElementById("addAlbumBtn"),

    modal: document.getElementById("albumModal"),
    form: document.getElementById("albumForm"),
    modalTitle: document.getElementById("albumModalTitle"),

    title: document.getElementById("albumTitle"),
    artist: document.getElementById("albumArtist"),
    releaseDate: document.getElementById("albumReleaseDate"),
    imageUrl: document.getElementById("albumImageUrl"),
    imageFile: document.getElementById("albumImage"),
    imagePreview: document.getElementById("albumImagePreview"),

    saveBtn: document.getElementById("saveAlbumBtn"),
    cancelBtn: document.getElementById("cancelAlbumBtn"),
    closeBtn: document.getElementById("closeAlbumModal"),

    tracksModal: document.getElementById("albumTracksModal"),
    manageAlbumName: document.getElementById("manageAlbumName"),
    availableTracksSelect: document.getElementById("availableTracksSelect"),
    addTrackBtn: document.getElementById("addTrackToAlbumBtn"),
    albumTracksTableBody: document.getElementById("albumTracksTableBody"),
    closeTracksModal: document.getElementById("closeAlbumTracksModal"),
  };
}

// ======================================
// HELPERS
// ======================================

function getAlbumId(album) {
  return album?.id || album?._id || album?.album_id;
}

function getAlbumTitle(album) {
  return album?.title || album?.name || album?.album_title || "Chưa có tên";
}

function getAlbumImage(album) {
  return (
    album?.cover_image_url ||
    album?.image_url ||
    album?.image ||
    "https://placehold.co/300x300?text=No+Image"
  );
}

function getArtistId(artist) {
  return artist?.id || artist?._id || artist?.artist_id;
}

function getArtistName(album) {
  return (
    album?.artist?.name ||
    album?.artist_name ||
    album?.artist?.title ||
    "Không rõ nghệ sĩ"
  );
}

function getTrackId(track) {
  return track?.id || track?._id || track?.track_id;
}

function getTrackTitle(track) {
  return track?.title || track?.name || track?.track_title || "Không có tên";
}

function getTrackArtist(track) {
  return track?.artist?.name || track?.artist_name || "Không rõ nghệ sĩ";
}

function getTrackAlbumId(track) {
  return track?.album_id || track?.album?.id || track?.album?._id || null;
}

function formatDuration(duration) {
  if (duration === null || duration === undefined || duration === "") {
    return "—";
  }

  const seconds = Number(duration);

  if (!Number.isFinite(seconds)) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return escapeHTML(date);
  }

  return parsedDate.toLocaleDateString("vi-VN");
}

function extractArray(data, key) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data?.data?.[key])) {
    return data.data[key];
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

// ======================================
// LOAD ALL DATA FROM API
// ======================================

async function loadAllPages(endpoint, key) {
  let offset = 0;
  let total = null;
  let result = [];

  const MAX_PAGES = 100;

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await api.get(endpoint, {
      params: {
        limit: API_LIMIT,
        offset,
      },
    });

    const data = response.data;
    const pageData = extractArray(data, key);

    const pagination = data?.pagination || data?.data?.pagination || {};

    if (pagination.total !== undefined) {
      const apiTotal = Number(pagination.total);

      if (Number.isFinite(apiTotal) && apiTotal >= 0) {
        total = apiTotal;
      }
    }

    if (pageData.length === 0) break;

    result = result.concat(pageData);
    offset += pageData.length;

    if (total !== null && result.length >= total) break;

    if (pageData.length < API_LIMIT) break;
  }

  return result;
}

// ======================================
// IMAGE PREVIEW
// ======================================

function releasePreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
}

function handleImagePreview() {
  const elements = getElements();
  const file = elements.imageFile?.files?.[0];

  releasePreviewUrl();

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Lỗi", "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.", "warning");

      elements.imageFile.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "Ảnh không được vượt quá 5MB.", "warning");

      elements.imageFile.value = "";
      return;
    }

    previewObjectUrl = URL.createObjectURL(file);

    if (elements.imagePreview) {
      elements.imagePreview.src = previewObjectUrl;
      elements.imagePreview.classList.remove("hidden");
    }

    return;
  }

  const imageUrl = elements.imageUrl?.value?.trim();

  if (imageUrl && elements.imagePreview) {
    elements.imagePreview.src = imageUrl;
    elements.imagePreview.classList.remove("hidden");
  } else if (elements.imagePreview) {
    elements.imagePreview.src = "";
    elements.imagePreview.classList.add("hidden");
  }
}

// ======================================
// ALBUM MODAL
// ======================================

function showModal() {
  const elements = getElements();

  if (!elements.modal) {
    Swal.fire("Lỗi", "Không tìm thấy albumModal trong HTML.", "error");
    return;
  }

  elements.modal.classList.remove("hidden");
  elements.modal.classList.add("flex");
}

function hideModal() {
  const elements = getElements();

  if (!elements.modal) return;

  elements.modal.classList.add("hidden");
  elements.modal.classList.remove("flex");

  elements.form?.reset();

  releasePreviewUrl();

  if (elements.imagePreview) {
    elements.imagePreview.src = "";
    elements.imagePreview.classList.add("hidden");
  }

  editingAlbumId = null;
}

function openCreateModal() {
  const elements = getElements();

  editingAlbumId = null;

  elements.form?.reset();

  releasePreviewUrl();

  if (elements.modalTitle) {
    elements.modalTitle.textContent = "Thêm album";
  }

  if (elements.saveBtn) {
    elements.saveBtn.textContent = "Lưu album";
    elements.saveBtn.disabled = false;
  }

  if (elements.imagePreview) {
    elements.imagePreview.src = "";
    elements.imagePreview.classList.add("hidden");
  }

  showModal();
}

function openEditModal(albumId) {
  const album = allAlbums.find(
    (item) => String(getAlbumId(item)) === String(albumId),
  );

  if (!album) {
    Swal.fire("Lỗi", "Không tìm thấy album.", "error");
    return;
  }

  const elements = getElements();

  editingAlbumId = albumId;

  releasePreviewUrl();

  if (elements.title) {
    elements.title.value = getAlbumTitle(album);
  }

  if (elements.artist) {
    elements.artist.value =
      album.artist_id || album.artist?.id || album.artist?._id || "";
  }

  if (elements.releaseDate) {
    elements.releaseDate.value = album.release_date
      ? String(album.release_date).slice(0, 10)
      : "";
  }

  if (elements.imageUrl) {
    elements.imageUrl.value = getAlbumImage(album);
  }

  if (elements.imageFile) {
    elements.imageFile.value = "";
  }

  if (elements.imagePreview) {
    const image = getAlbumImage(album);

    elements.imagePreview.src = image;
    elements.imagePreview.classList.toggle("hidden", !image);
  }

  if (elements.modalTitle) {
    elements.modalTitle.textContent = "Chỉnh sửa album";
  }

  if (elements.saveBtn) {
    elements.saveBtn.textContent = "Cập nhật album";
    elements.saveBtn.disabled = false;
  }

  showModal();
}

// ======================================
// LOAD ARTISTS
// ======================================

async function loadArtists() {
  const elements = getElements();

  try {
    artists = await loadAllPages(ARTIST_API, "artists");

    renderArtistOptions();
  } catch (error) {
    console.error("Lỗi tải nghệ sĩ:", error);

    artists = [];

    if (elements.artist) {
      elements.artist.innerHTML =
        '<option value="">Không thể tải nghệ sĩ</option>';
    }
  }
}

function renderArtistOptions() {
  const elements = getElements();

  if (!elements.artist) return;

  elements.artist.innerHTML = `
    <option value="">-- Chọn nghệ sĩ --</option>

    ${artists
      .map((artist) => {
        const id = getArtistId(artist);
        const name = artist.name || artist.title || "Không tên";

        return `
          <option value="${escapeHTML(id)}">
            ${escapeHTML(name)}
          </option>
        `;
      })
      .join("")}
  `;
}

// ======================================
// LOAD ALBUMS
// ======================================

async function loadAlbums() {
  const elements = getElements();

  if (elements.tableBody) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-6 text-gray-400">
          Đang tải dữ liệu album...
        </td>
      </tr>
    `;
  }

  try {
    allAlbums = await loadAllPages(ALBUM_API, "albums");

    filteredAlbums = [...allAlbums];
    currentPage = 1;

    renderAlbums();
  } catch (error) {
    console.error("Lỗi tải album:", error);

    if (elements.tableBody) {
      elements.tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6 text-red-400">
            Không thể tải danh sách album.
          </td>
        </tr>
      `;
    }

    Swal.fire(
      "Lỗi",
      error.response?.data?.message || "Không thể tải danh sách album.",
      "error",
    );
  }
}

// ======================================
// RENDER ALBUMS
// ======================================

function renderAlbums() {
  const elements = getElements();

  if (!elements.tableBody) return;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE),
  );

  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * ALBUMS_PER_PAGE;

  const currentAlbums = filteredAlbums.slice(
    startIndex,
    startIndex + ALBUMS_PER_PAGE,
  );

  if (currentAlbums.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-gray-400">
          Không tìm thấy album nào.
        </td>
      </tr>
    `;

    renderPagination();
    return;
  }

  elements.tableBody.innerHTML = currentAlbums
    .map((album, index) => {
      const id = getAlbumId(album);
      const title = getAlbumTitle(album);
      const image = getAlbumImage(album);
      const artistName = getArtistName(album);
      const releaseDate = formatDate(album.release_date);

      return `
        <tr class="border-b border-neutral-700 hover:bg-neutral-800">

          <td class="px-4 py-3">
            ${startIndex + index + 1}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img
                src="${escapeHTML(image || "playlist.png")}"
                alt="Album"
                class="w-12 h-12 rounded object-cover"
                onerror="this.onerror=null;this.src='playlist.png'"
              />

              <span class="font-medium text-white">
                ${escapeHTML(title)}
              </span>
            </div>
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${escapeHTML(artistName)}
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${releaseDate}
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${escapeHTML(id || "—")}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-3">

              <button
                type="button"
                data-action="manage-tracks"
                data-id="${escapeHTML(id)}"
                class="text-green-400 hover:text-green-300"
                title="Quản lý bài hát"
              >
                <i class="fas fa-music"></i>
              </button>

              <button
                type="button"
                data-action="edit"
                data-id="${escapeHTML(id)}"
                class="text-blue-400 hover:text-blue-300"
                title="Sửa album"
              >
                <i class="fas fa-edit"></i>
              </button>

              <button
                type="button"
                data-action="delete"
                data-id="${escapeHTML(id)}"
                class="text-red-400 hover:text-red-300"
                title="Xóa album"
              >
                <i class="fas fa-trash"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  renderPagination();
}

// ======================================
// PAGINATION
// ======================================

function renderPagination() {
  const elements = getElements();

  if (!elements.pagination) return;

  const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  let html = `
    <button
      type="button"
      data-page="${currentPage - 1}"
      ${currentPage === 1 ? "disabled" : ""}
      class="px-3 py-2 rounded bg-neutral-700 disabled:opacity-40"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  for (let page = 1; page <= totalPages; page++) {
    html += `
      <button
        type="button"
        data-page="${page}"
        class="px-3 py-2 rounded ${
          page === currentPage
            ? "bg-green-500 text-black"
            : "bg-neutral-700 text-white"
        }"
      >
        ${page}
      </button>
    `;
  }

  html += `
    <button
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage === totalPages ? "disabled" : ""}
      class="px-3 py-2 rounded bg-neutral-700 disabled:opacity-40"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  elements.pagination.innerHTML = html;
}

function handlePaginationClick(event) {
  const button = event.target.closest("button[data-page]");

  if (!button || button.disabled) return;

  const page = Number(button.dataset.page);

  const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderAlbums();
}

// ======================================
// SEARCH
// ======================================

function handleSearch() {
  const elements = getElements();

  const keyword = elements.searchInput?.value?.trim().toLowerCase() || "";

  filteredAlbums = allAlbums.filter((album) => {
    const title = getAlbumTitle(album).toLowerCase();
    const artist = getArtistName(album).toLowerCase();

    return title.includes(keyword) || artist.includes(keyword);
  });

  currentPage = 1;

  renderAlbums();
}

// ======================================
// VALIDATE FORM
// ======================================

function validateForm() {
  const elements = getElements();

  const title = elements.title?.value.trim();
  const artistId = elements.artist?.value;
  const releaseDate = elements.releaseDate?.value;
  const imageUrl = elements.imageUrl?.value.trim();
  const imageFile = elements.imageFile?.files?.[0] || null;

  if (!title) {
    Swal.fire("Thiếu thông tin", "Vui lòng nhập tên album.", "warning");
    return null;
  }

  if (!artistId) {
    Swal.fire("Thiếu thông tin", "Vui lòng chọn nghệ sĩ.", "warning");
    return null;
  }

  if (imageFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      Swal.fire("Lỗi", "File ảnh không hợp lệ.", "warning");
      return null;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "Ảnh không được vượt quá 5MB.", "warning");
      return null;
    }
  }

  return {
    title,
    artist_id: artistId,
    release_date: releaseDate || null,
    image_url: imageUrl || undefined,
    imageFile,
  };
}

// ======================================
// UPLOAD ALBUM COVER
// ======================================

async function uploadAlbumCover(albumId, imageFile) {
  const token = localStorage.getItem("token");

  if (!token || !token.trim()) {
    throw new Error("Không tìm thấy token đăng nhập.");
  }

  if (!albumId || !imageFile) {
    throw new Error("Thiếu ID album hoặc file ảnh.");
  }

  const formData = new FormData();

  // Tên field "image" phải khớp với backend
  formData.append("cover", imageFile);

  try {
    const response = await api.post(
      `/api/upload/album/${encodeURIComponent(albumId)}/cover`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Upload album cover response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Upload album cover error:", {
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
}

// ======================================
// CREATE / UPDATE ALBUM
// ======================================

async function handleSubmit(event) {
  event.preventDefault();

  const elements = getElements();
  const formData = validateForm();

  if (!formData) return;

  const isEditing = Boolean(editingAlbumId);
  const saveButton = elements.saveBtn;

  if (!saveButton) {
    Swal.fire("Lỗi", "Không tìm thấy nút saveAlbumBtn trong HTML.", "error");
    return;
  }

  let albumId = editingAlbumId;

  try {
    saveButton.disabled = true;
    saveButton.textContent = "Đang lưu...";

    const payload = {
      title: formData.title,
      artist_id: formData.artist_id,
      release_date: formData.release_date,
    };

    // Nếu nhập URL ảnh thì gửi cover_image_url
    if (formData.cover_image_url) {
      payload.cover_image_url = formData.cover_image_url;
    }

    // Bước 1: Tạo hoặc cập nhật album
    if (isEditing) {
      await api.put(`${ALBUM_API}/${encodeURIComponent(albumId)}`, payload);
    } else {
      const response = await api.post(ALBUM_API, payload);
      const data = response.data;

      albumId =
        data?.album?.id ||
        data?.data?.album?.id ||
        data?.data?.id ||
        data?.album_id ||
        data?.id ||
        data?._id;

      if (!albumId) {
        throw new Error("Không lấy được ID album từ API.");
      }
    }

    // Bước 2: Upload file ảnh nếu người dùng chọn file
    if (formData.imageFile) {
      await uploadAlbumCover(albumId, formData.imageFile);
    }

    // Bước 3: Tải lại danh sách
    hideModal();
    await loadAlbums();

    await Swal.fire(
      "Thành công",
      isEditing ? "Cập nhật album thành công!" : "Thêm album thành công!",
      "success",
    );
  } catch (error) {
    console.error("Lỗi lưu album:", error);

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Không thể lưu album.";

    Swal.fire("Lỗi", message, "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Lưu album";
  }
}

// ======================================
// DELETE ALBUM
// ======================================

async function deleteAlbum(albumId) {
  const result = await Swal.fire({
    title: "Xóa album?",
    text: "Bạn có chắc chắn muốn xóa album này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#dc2626",
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`${ALBUM_API}/${encodeURIComponent(albumId)}`);

    await loadAlbums();

    Swal.fire({
      icon: "success",
      title: "Đã xóa album",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Lỗi xóa album:", error);

    Swal.fire(
      "Lỗi",
      error.response?.data?.message || "Không thể xóa album.",
      "error",
    );
  }
}

// ======================================
// LOAD ALL TRACKS
// ======================================

async function loadAllTracks() {
  try {
    allTracks = await loadAllPages(TRACK_API, "tracks");
  } catch (error) {
    console.error("Lỗi tải bài hát:", error);

    allTracks = [];

    Swal.fire(
      "Lỗi",
      error.response?.data?.message || "Không thể tải danh sách bài hát.",
      "error",
    );
  }
}

// ======================================
// ALBUM TRACKS MODAL
// ======================================

async function openAlbumTracksModal(albumId) {
  const elements = getElements();

  const album = allAlbums.find(
    (item) => String(getAlbumId(item)) === String(albumId),
  );

  if (!album) {
    Swal.fire("Lỗi", "Không tìm thấy album.", "error");
    return;
  }

  currentManagingAlbum = album;

  if (!elements.tracksModal) {
    Swal.fire("Lỗi", "Không tìm thấy albumTracksModal trong HTML.", "error");
    return;
  }

  if (elements.manageAlbumName) {
    elements.manageAlbumName.textContent = `Album: ${getAlbumTitle(album)}`;
  }

  elements.tracksModal.classList.remove("hidden");
  elements.tracksModal.classList.add("flex");

  if (elements.albumTracksTableBody) {
    elements.albumTracksTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center p-5 text-gray-400">
          Đang tải bài hát...
        </td>
      </tr>
    `;
  }

  if (elements.availableTracksSelect) {
    elements.availableTracksSelect.innerHTML =
      '<option value="">Đang tải bài hát...</option>';
  }

  await loadAllTracks();

  renderAvailableTracks();
  renderAlbumTracks();
}

function closeAlbumTracksModal() {
  const elements = getElements();

  elements.tracksModal?.classList.add("hidden");
  elements.tracksModal?.classList.remove("flex");

  currentManagingAlbum = null;
}

// ======================================
// RENDER AVAILABLE TRACKS
// ======================================

function renderAvailableTracks() {
  const elements = getElements();

  if (!elements.availableTracksSelect) return;
  if (!currentManagingAlbum) return;

  const currentAlbumId = String(getAlbumId(currentManagingAlbum));

  // Chỉ lấy bài hát chưa thuộc album nào
  const tracksToAdd = allTracks.filter((track) => {
    return !getTrackAlbumId(track);
  });

  if (tracksToAdd.length === 0) {
    elements.availableTracksSelect.innerHTML =
      '<option value="">Không còn bài hát chưa thuộc album</option>';
    return;
  }

  elements.availableTracksSelect.innerHTML = `
    <option value="">-- Chọn bài hát --</option>

    ${tracksToAdd
      .map((track) => {
        const id = getTrackId(track);

        return `
          <option value="${escapeHTML(id)}">
            ${escapeHTML(getTrackTitle(track))}
            - ${escapeHTML(getTrackArtist(track))}
          </option>
        `;
      })
      .join("")}
  `;
}

// ======================================
// RENDER ALBUM TRACKS
// ======================================

function renderAlbumTracks() {
  const elements = getElements();

  if (!elements.albumTracksTableBody || !currentManagingAlbum) {
    return;
  }

  const albumId = String(getAlbumId(currentManagingAlbum));

  const albumTracks = allTracks.filter(
    (track) => String(getTrackAlbumId(track) || "") === albumId,
  );

  if (albumTracks.length === 0) {
    elements.albumTracksTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center p-5 text-gray-400">
          Album chưa có bài hát nào.
        </td>
      </tr>
    `;
    return;
  }

  elements.albumTracksTableBody.innerHTML = albumTracks
    .map((track, index) => {
      const id = getTrackId(track);

      return `
        <tr class="border-b border-neutral-700 hover:bg-neutral-800">

          <td class="p-3">
            ${index + 1}
          </td>

          <td class="p-3 font-medium">
            ${escapeHTML(getTrackTitle(track))}
          </td>

          <td class="p-3 text-gray-400">
            ${escapeHTML(getTrackArtist(track))}
          </td>

          <td class="p-3 text-gray-400">
            ${formatDuration(track.duration)}
          </td>

          <td class="p-3">
            <button
              type="button"
              data-action="remove-track"
              data-id="${escapeHTML(id)}"
              class="text-red-400 hover:text-red-300"
              title="Gỡ khỏi album"
            >
              <i class="fas fa-trash"></i>
              Gỡ
            </button>
          </td>

        </tr>
      `;
    })
    .join("");
}

// ======================================
// ADD TRACK TO ALBUM
// ======================================

async function addTrackToAlbum() {
  const elements = getElements();

  if (!currentManagingAlbum) return;

  const trackId = elements.availableTracksSelect?.value;

  if (!trackId) {
    Swal.fire("Thông báo", "Vui lòng chọn bài hát.", "warning");
    return;
  }

  const albumId = getAlbumId(currentManagingAlbum);

  try {
    if (elements.addTrackBtn) {
      elements.addTrackBtn.disabled = true;
      elements.addTrackBtn.textContent = "Đang thêm...";
    }

    await api.put(`${TRACK_API}/${encodeURIComponent(trackId)}`, {
      album_id: albumId,
    });

    await loadAllTracks();

    renderAvailableTracks();
    renderAlbumTracks();

    Swal.fire({
      icon: "success",
      title: "Đã thêm bài hát vào album",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Lỗi thêm bài hát:", error);

    Swal.fire(
      "Lỗi",
      error.response?.data?.message || "Không thể thêm bài hát vào album.",
      "error",
    );
  } finally {
    if (elements.addTrackBtn) {
      elements.addTrackBtn.disabled = false;
      elements.addTrackBtn.innerHTML =
        '<i class="fas fa-plus mr-2"></i>Thêm bài hát';
    }
  }
}

// ======================================
// REMOVE TRACK FROM ALBUM
// ======================================

async function removeTrackFromAlbum(trackId) {
  if (!currentManagingAlbum) return;

  const result = await Swal.fire({
    title: "Gỡ bài hát?",
    text: "Bài hát sẽ không còn thuộc album này.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Gỡ",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#dc2626",
  });

  if (!result.isConfirmed) return;

  try {
    await api.put(`${TRACK_API}/${encodeURIComponent(trackId)}`, {
      album_id: null,
    });

    await loadAllTracks();

    renderAvailableTracks();
    renderAlbumTracks();

    Swal.fire({
      icon: "success",
      title: "Đã gỡ bài hát",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Lỗi gỡ bài hát:", error);

    Swal.fire(
      "Lỗi",
      error.response?.data?.message || "Không thể gỡ bài hát khỏi album.",
      "error",
    );
  }
}

// ======================================
// TABLE EVENTS
// ======================================

function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const action = button.dataset.action;
  const albumId = button.dataset.id;

  if (!albumId) return;

  if (action === "edit") {
    openEditModal(albumId);
  }

  if (action === "delete") {
    deleteAlbum(albumId);
  }

  if (action === "manage-tracks") {
    openAlbumTracksModal(albumId);
  }
}

function handleAlbumTracksClick(event) {
  const button = event.target.closest('button[data-action="remove-track"]');

  if (!button) return;

  const trackId = button.dataset.id;

  if (trackId) {
    removeTrackFromAlbum(trackId);
  }
}

// ======================================
// BIND EVENTS
// ======================================

function bindEvents() {
  const elements = getElements();

  elements.addBtn?.addEventListener("click", openCreateModal);

  elements.searchBtn?.addEventListener("click", handleSearch);

  elements.searchInput?.addEventListener("input", handleSearch);

  elements.form?.addEventListener("submit", handleSubmit);

  elements.cancelBtn?.addEventListener("click", hideModal);

  elements.closeBtn?.addEventListener("click", hideModal);

  elements.imageFile?.addEventListener("change", handleImagePreview);

  elements.imageUrl?.addEventListener("input", handleImagePreview);

  elements.tableBody?.addEventListener("click", handleTableClick);

  elements.pagination?.addEventListener("click", handlePaginationClick);

  elements.closeTracksModal?.addEventListener("click", closeAlbumTracksModal);

  elements.addTrackBtn?.addEventListener("click", addTrackToAlbum);

  elements.albumTracksTableBody?.addEventListener(
    "click",
    handleAlbumTracksClick,
  );
}

// ======================================
// INIT
// ======================================

export async function initAlbumAdmin() {
  if (initialized) {
    await Promise.all([loadArtists(), loadAlbums()]);
    return;
  }

  initialized = true;

  bindEvents();

  await Promise.all([loadArtists(), loadAlbums()]);
}
