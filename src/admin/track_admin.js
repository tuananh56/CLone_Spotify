import { api } from "../app/api.js";

const TRACK_API = "/api/tracks";
const ARTIST_API = "/api/artists";

// API hỗ trợ limit = 20
const API_LIMIT = 50;
const TRACK_LIMIT = 10;

let initialized = false;
let currentPage = 1;
let allTracks = [];
let currentTracks = [];
let searchKeyword = "";
let editingTrackId = null;

// =========================
// LẤY ELEMENT HTML
// =========================

function getElements() {
  return {
    uploadProgress: document.getElementById("trackUploadProgress"),
    uploadStatus: document.getElementById("trackUploadStatus"),
    uploadPercent: document.getElementById("trackUploadPercent"),
    uploadBar: document.getElementById("trackUploadBar"),
    uploadIcon: document.getElementById("trackUploadIcon"),

    tableBody: document.getElementById("trackTableBody"),
    total: document.getElementById("trackTotal"),
    pagination: document.getElementById("trackPagination"),
    paginationInfo: document.getElementById("trackPaginationInfo"),
    searchInput: document.getElementById("trackSearchInput"),
    refreshBtn: document.getElementById("trackRefreshBtn"),

    modal: document.getElementById("createTrackModal"),
    form: document.getElementById("createTrackForm"),
    openBtn: document.getElementById("addTrackBtn"),
    closeBtn: document.getElementById("closeCreateTrackBtn"),
    cancelBtn: document.getElementById("cancelCreateTrackBtn"),

    title: document.getElementById("newTrackTitle"),
    artist: document.getElementById("newTrackArtist"),
    album: document.getElementById("newTrackAlbum"),
    trackNumber: document.getElementById("newTrackNumber"),

    image: document.getElementById("newTrackImage"),
    imagePreview: document.getElementById("newTrackImagePreview"),
    audio: document.getElementById("newTrackAudio"),

    // Tên thuộc tính phải thống nhất với handleSubmit()
    submitBtn: document.getElementById("submitCreateTrackBtn"),
  };
}

// =========================
// TIỆN ÍCH
// =========================

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function showMessage(message) {
  alert(message);
}

function formatDuration(seconds) {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(
    2,
    "0",
  )}`;
}

// =========================
// XỬ LÝ RESPONSE
// =========================

function getTracks(data) {
  if (Array.isArray(data?.tracks)) return data.tracks;
  if (Array.isArray(data?.data?.tracks)) return data.data.tracks;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
}

function getTotal(data) {
  const total =
    data?.pagination?.total ??
    data?.data?.pagination?.total ??
    data?.total ??
    data?.data?.total;

  if (total === undefined || total === null) {
    return null;
  }

  const value = Number(total);

  return Number.isFinite(value) ? value : null;
}

function getArtistList(data) {
  if (Array.isArray(data?.artists)) return data.artists;
  if (Array.isArray(data?.data?.artists)) return data.data.artists;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;

  return [];
}

function getTrack(data) {
  return data?.track || data?.data?.track || data?.data || data;
}

// =========================
// DANH SÁCH NGHỆ SĨ
// =========================

async function loadArtistOptions(selectedArtistId = null) {
  const { artist } = getElements();

  if (!artist) return;

  artist.innerHTML = `
    <option value="">Đang tải danh sách nghệ sĩ...</option>
  `;

  try {
    let artists = [];
    let offset = 0;
    let total = null;

    while (true) {
      const res = await api.get(ARTIST_API, {
        params: {
          limit: API_LIMIT,
          offset,
        },
      });

      const pageArtists = getArtistList(res.data);

      if (total === null) {
        total = getTotal(res.data);
      }

      if (!pageArtists.length) break;

      artists.push(...pageArtists);
      offset += pageArtists.length;

      if (total !== null && artists.length >= total) break;
      if (pageArtists.length < API_LIMIT) break;
    }

    const uniqueArtists = [
      ...new Map(
        artists
          .filter((item) => item?.id != null)
          .map((item) => [String(item.id), item]),
      ).values(),
    ];

    artist.innerHTML = `
      <option value="">Ẩn danh</option>

      ${uniqueArtists
        .map((item) => {
          const id = String(item.id);
          const name =
            item.name || item.artist_name || item.title || "Chưa có tên";

          return `
            <option
              value="${escapeHTML(id)}"
              ${String(selectedArtistId ?? "") === id ? "selected" : ""}
            >
              ${escapeHTML(name)}
            </option>
          `;
        })
        .join("")}
    `;

    if (
      selectedArtistId &&
      !uniqueArtists.some(
        (item) => String(item.id) === String(selectedArtistId),
      )
    ) {
      artist.value = "";
    }
  } catch (error) {
    console.error("Lỗi tải nghệ sĩ:", error);

    artist.innerHTML = `
      <option value="">Ẩn danh</option>
    `;

    showMessage("Không thể tải danh sách nghệ sĩ.");
  }
}

// =========================
// DANH SÁCH TRACK
// =========================

async function loadTracks() {
  const { tableBody, total } = getElements();

  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
        Đang tải danh sách bài hát...
      </td>
    </tr>
  `;

  try {
    let tracks = [];
    let offset = 0;
    let totalFromServer = null;

    while (true) {
      const res = await api.get(TRACK_API, {
        params: {
          limit: API_LIMIT,
          offset,
        },
      });

      const pageTracks = getTracks(res.data);

      if (totalFromServer === null) {
        totalFromServer = getTotal(res.data);
      }

      if (!pageTracks.length) break;

      tracks.push(...pageTracks);
      offset += pageTracks.length;

      if (totalFromServer !== null && tracks.length >= totalFromServer) {
        break;
      }

      if (pageTracks.length < API_LIMIT) break;
    }

    allTracks = [
      ...new Map(
        tracks
          .filter((track) => track?.id != null)
          .map((track) => [String(track.id), track]),
      ).values(),
    ];

    currentPage = 1;
    filterTracks();

    if (total) {
      total.textContent = `${allTracks.length.toLocaleString("vi-VN")} bài hát`;
    }
  } catch (error) {
    console.error("Lỗi tải danh sách track:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-red-400">
          Không thể tải danh sách bài hát.

          <button
            id="retryTrackBtn"
            type="button"
            class="underline ml-2"
          >
            Thử lại
          </button>
        </td>
      </tr>
    `;

    document
      .getElementById("retryTrackBtn")
      ?.addEventListener("click", loadTracks);

    if (total) {
      total.textContent = "Lỗi tải dữ liệu";
    }
  }
}

// =========================
// TÌM KIẾM TRACK
// =========================

function filterTracks() {
  const keyword = searchKeyword.toLowerCase();

  currentTracks = allTracks.filter((track) => {
    return [track.title, track.artist_name, track.album_title].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword),
    );
  });

  currentPage = 1;

  renderTracks();
  renderPagination();

  const { total } = getElements();

  if (total) {
    total.textContent = `${currentTracks.length.toLocaleString(
      "vi-VN",
    )} bài hát`;
  }
}

// =========================
// HIỂN THỊ TRACK
// =========================

function renderTracks() {
  const { tableBody } = getElements();

  if (!tableBody) return;

  const startIndex = (currentPage - 1) * TRACK_LIMIT;

  const tracks = currentTracks.slice(startIndex, startIndex + TRACK_LIMIT);

  if (!tracks.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-gray-400">
          Không tìm thấy bài hát.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML = tracks
    .map(
      (track, index) => `
        <tr class="border-t border-neutral-700 hover:bg-neutral-700/50">
          <td class="px-5 py-4 text-gray-400">
            ${startIndex + index + 1}
          </td>

          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <img
                src="${escapeHTML(track.image_url || "./playlist.png")}"
                class="w-12 h-12 rounded object-cover"
                alt=""
                onerror="this.src='./playlist.png'"
              />

              <span class="font-medium">
                ${escapeHTML(track.title || "Chưa có tên")}
              </span>
            </div>
          </td>

          <td class="px-5 py-4 text-gray-300">
            ${escapeHTML(track.artist_name || "Ẩn danh")}
          </td>

          <td class="px-5 py-4 text-gray-300">
            ${escapeHTML(track.album_title || "Single")}
          </td>

          <td class="px-5 py-4 text-gray-400">
            ${Number(track.play_count || 0).toLocaleString("vi-VN")}
          </td>

          <td class="px-5 py-4 text-right whitespace-nowrap">
            <button
              type="button"
              data-detail-track="${escapeHTML(track.id)}"
              class="text-blue-400 hover:text-blue-300 mr-3"
              title="Chi tiết"
            >
              <i class="fa-solid fa-eye"></i>
            </button>

            <button
              type="button"
              data-edit-track="${escapeHTML(track.id)}"
              class="text-yellow-400 hover:text-yellow-300 mr-3"
              title="Chỉnh sửa"
            >
              <i class="fa-solid fa-pen"></i>
            </button>

            <button
              type="button"
              data-delete-track="${escapeHTML(track.id)}"
              class="text-red-400 hover:text-red-300"
              title="Xóa"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

// =========================
// PHÂN TRANG
// =========================

function renderPagination() {
  const { pagination, paginationInfo } = getElements();

  if (!pagination) return;

  const totalItems = currentTracks.length;
  const totalPages = Math.ceil(totalItems / TRACK_LIMIT);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  const start = totalItems ? (currentPage - 1) * TRACK_LIMIT + 1 : 0;

  const end = Math.min(currentPage * TRACK_LIMIT, totalItems);

  if (paginationInfo) {
    paginationInfo.textContent = `Hiển thị ${start} - ${end} trong ${totalItems} bài hát`;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
    <button
      type="button"
      data-page="${currentPage - 1}"
      ${currentPage <= 1 ? "disabled" : ""}
      class="px-3 py-2 rounded-lg bg-neutral-700 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <span class="px-3">
      ${currentPage} / ${totalPages}
    </span>

    <button
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage >= totalPages ? "disabled" : ""}
      class="px-3 py-2 rounded-lg bg-neutral-700 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

// =========================
// CHI TIẾT TRACK
// =========================

async function viewTrack(id) {
  try {
    const res = await api.get(`${TRACK_API}/${encodeURIComponent(id)}`);

    const track = getTrack(res.data);

    if (!track || !track.id) {
      showMessage("Không tìm thấy bài hát.");
      return;
    }

    showMessage(
      `Tên bài hát: ${track.title || "Chưa có"}\n` +
        `Nghệ sĩ: ${track.artist_name || "Ẩn danh"}\n` +
        `Album: ${track.album_title || "Single"}\n` +
        `Thời lượng: ${formatDuration(track.duration)}\n` +
        `Lượt nghe: ${track.play_count || 0}\n` +
        `Track ID: ${track.id}`,
    );
  } catch (error) {
    console.error("Lỗi xem track:", error);
    showMessage("Không thể lấy thông tin bài hát.");
  }
}

// =========================
// XÓA TRACK
// =========================

async function deleteTrack(id) {
  const confirmed = confirm("Bạn có chắc chắn muốn xóa bài hát này không?");

  if (!confirmed) return;

  try {
    await api.delete(`${TRACK_API}/${encodeURIComponent(id)}`);

    allTracks = allTracks.filter((track) => String(track.id) !== String(id));

    showMessage("Xóa bài hát thành công!");

    filterTracks();

    const totalPages = Math.ceil(currentTracks.length / TRACK_LIMIT);

    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    renderTracks();
    renderPagination();
  } catch (error) {
    console.error("Lỗi xóa track:", error);

    showMessage(error.response?.data?.message || "Không thể xóa bài hát.");
  }
}

// =========================
// MODAL THÊM TRACK
// =========================

async function openModal() {
  const { modal, form, imagePreview, submitBtn, image, uploadProgress } =
    getElements();

  if (!modal) return;

  editingTrackId = null;

  form?.reset();

  if (imagePreview) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
  }

  if (image) {
    image.value = "";
  }

  if (submitBtn) {
    submitBtn.textContent = "Tạo bài hát";
    submitBtn.disabled = false;
  }

  uploadProgress?.classList.add("hidden");

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  await loadArtistOptions();
}

function closeModal() {
  const { modal, form, imagePreview, uploadProgress, submitBtn } =
    getElements();

  if (!modal) return;

  modal.classList.add("hidden");
  document.body.style.overflow = "";

  form?.reset();

  if (imagePreview) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
  }

  uploadProgress?.classList.add("hidden");

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Tạo bài hát";
  }

  editingTrackId = null;
}

// =========================
// CHỈNH SỬA TRACK
// =========================

async function editTrack(id) {
  try {
    const res = await api.get(`${TRACK_API}/${encodeURIComponent(id)}`);

    const track = getTrack(res.data);

    if (!track || !track.id) {
      showMessage("Không tìm thấy bài hát.");
      return;
    }

    const elements = getElements();

    editingTrackId = id;

    elements.form?.reset();

    if (elements.title) {
      elements.title.value = track.title || "";
    }

    if (elements.album) {
      elements.album.value = track.album_id || "";
    }

    if (elements.trackNumber) {
      elements.trackNumber.value = track.track_number || 1;
    }

    if (elements.image) {
      elements.image.value = "";
    }

    if (elements.imagePreview) {
      if (track.image_url) {
        elements.imagePreview.src = track.image_url;
        elements.imagePreview.classList.remove("hidden");
      } else {
        elements.imagePreview.src = "";
        elements.imagePreview.classList.add("hidden");
      }
    }

    elements.modal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    await loadArtistOptions(track.artist_id || null);

    if (elements.submitBtn) {
      elements.submitBtn.textContent = "Lưu thay đổi";
      elements.submitBtn.disabled = false;
    }
  } catch (error) {
    console.error("Lỗi lấy track để chỉnh sửa:", error);

    showMessage("Không thể lấy thông tin bài hát để chỉnh sửa.");
  }
}

// =========================
// XEM TRƯỚC ẢNH
// =========================

function handleImagePreview() {
  const { image, imagePreview } = getElements();

  if (!image || !imagePreview) return;

  image.addEventListener("change", () => {
    const file = image.files?.[0];

    if (!file) {
      imagePreview.src = "";
      imagePreview.classList.add("hidden");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showMessage("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");

      image.value = "";
      imagePreview.src = "";
      imagePreview.classList.add("hidden");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Ảnh không được vượt quá 5MB.");

      image.value = "";
      imagePreview.src = "";
      imagePreview.classList.add("hidden");

      return;
    }

    imagePreview.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");
  });
}

// =========================
// VALIDATE FORM
// =========================

function validateForm() {
  const elements = getElements();

  if (
    !elements.title ||
    !elements.artist ||
    !elements.album ||
    !elements.trackNumber ||
    !elements.audio
  ) {
    showMessage("Không tìm thấy đầy đủ các trường trong form HTML.");
    return false;
  }

  const title = elements.title.value.trim();
  const artistId = elements.artist.value;
  const albumId = elements.album.value;
  const number = Number(elements.trackNumber.value);
  const audioFile = elements.audio.files?.[0];
  const imageFile = elements.image?.files?.[0] || null;

  if (!title) {
    showMessage("Vui lòng nhập tên bài hát.");
    elements.title.focus();
    return false;
  }

  if (elements.trackNumber.value && (!Number.isInteger(number) || number < 1)) {
    showMessage("Số thứ tự bài hát phải lớn hơn 0.");
    elements.trackNumber.focus();
    return false;
  }

  if (!editingTrackId && !audioFile) {
    showMessage("Vui lòng chọn file nhạc.");
    elements.audio.focus();
    return false;
  }

  if (audioFile && !audioFile.type.startsWith("audio/")) {
    showMessage("File được chọn không phải file âm thanh.");
    elements.audio.value = "";
    return false;
  }

  if (imageFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      showMessage("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      elements.image.value = "";
      return false;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      showMessage("Ảnh không được vượt quá 5MB.");
      elements.image.value = "";
      return false;
    }
  }

  return {
    title,
    artist_id: artistId || null,
    album_id: albumId || null,
    track_number: number || 1,
    image: imageFile,
    audio: audioFile || null,
  };
}

// =========================
// LẤY THỜI LƯỢNG AUDIO
// =========================

async function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      const duration = Math.round(audio.duration);

      URL.revokeObjectURL(objectUrl);

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Không xác định được thời lượng audio."));
        return;
      }

      resolve(duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(new Error("Không thể đọc thời lượng file audio."));
    };

    audio.src = objectUrl;
  });
}

// =========================
// LẤY ID TRACK VỪA TẠO
// =========================

function getCreatedTrackId(data) {
  return (
    data?.id ||
    data?.track?.id ||
    data?.data?.id ||
    data?.data?.track?.id ||
    data?.result?.id ||
    null
  );
}

// =========================
// UPLOAD AUDIO
// =========================

async function uploadTrackAudio(trackId, file) {
  const audioData = new FormData();

  audioData.append("audio", file);

  return api.post(
    `/api/upload/track/${encodeURIComponent(trackId)}/audio`,
    audioData,
    {
      onUploadProgress(progressEvent) {
        if (!progressEvent.total) return;

        const percent = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100,
        );

        updateUploadProgress(
          percent,
          `Đang upload audio... ${percent}%`,
          "upload",
        );
      },
    },
  );
}

// =========================
// SUBMIT FORM
// =========================

async function handleSubmit(event) {
  event.preventDefault();

  const elements = getElements();
  const formData = validateForm();

  if (!formData) return;

  const isEditing = Boolean(editingTrackId);

  // SỬA LỖI: getElements() khai báo submitBtn,
  // không phải submitCreateTrackBtn.
  const submitBtn = elements.submitBtn;

  if (submitBtn?.disabled) return;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    updateUploadProgress(0, "Đang chuẩn bị...", "upload");

    let duration = null;

    if (formData.audio) {
      updateUploadProgress(5, "Đang đọc thời lượng audio...", "upload");

      duration = await getAudioDuration(formData.audio);
    }

    const payload = {
      title: formData.title,
      artist_id: formData.artist_id,
      album_id: formData.album_id,
      track_number: formData.track_number,
    };

    if (duration !== null) {
      payload.duration = duration;
    }

    let trackId = editingTrackId;

    if (isEditing) {
      // CẬP NHẬT TRACK
      updateUploadProgress(15, "Đang cập nhật thông tin bài hát...", "upload");

      await api.put(`${TRACK_API}/${encodeURIComponent(trackId)}`, payload);
    } else {
      // TẠO TRACK TRƯỚC ĐỂ LẤY ID
      updateUploadProgress(15, "Đang tạo bài hát...", "upload");

      const response = await api.post(TRACK_API, payload);

      trackId = getCreatedTrackId(response.data);

      if (!trackId) {
        console.error("Response tạo track không có ID:", response.data);

        throw new Error(
          "Không tìm thấy ID bài hát trong response API. Hãy kiểm tra response POST /api/tracks.",
        );
      }
    }

    // UPLOAD AUDIO
    if (formData.audio) {
      updateUploadProgress(30, "Đang upload audio...", "upload");

      await uploadTrackAudio(trackId, formData.audio);
    }

    // UPLOAD ẢNH BÌA
    if (formData.image) {
      updateUploadProgress(75, "Đang upload ảnh bài hát...", "upload");

      await uploadTrackImage(trackId, formData.image);
    }

    updateUploadProgress(100, "Hoàn tất!", "success");

    await loadTracks();

    showMessage(
      isEditing ? "Cập nhật bài hát thành công!" : "Tạo bài hát thành công!",
    );

    setTimeout(() => {
      closeModal();
    }, 700);
  } catch (error) {
    console.error("Lỗi xử lý bài hát:", error);

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Không thể xử lý bài hát.";

    updateUploadProgress(0, message, "error");

    showMessage(message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
}

// =========================
// GẮN SỰ KIỆN
// =========================

function bindEvents() {
  const elements = getElements();

  elements.openBtn?.addEventListener("click", openModal);

  elements.closeBtn?.addEventListener("click", closeModal);

  elements.cancelBtn?.addEventListener("click", closeModal);

  elements.modal?.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  elements.form?.addEventListener("submit", handleSubmit);

  elements.refreshBtn?.addEventListener("click", loadTracks);

  elements.searchInput?.addEventListener("input", () => {
    searchKeyword = elements.searchInput.value.trim();

    filterTracks();
  });

  elements.pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");

    if (!button || button.disabled) return;

    const page = Number(button.dataset.page);

    const totalPages = Math.ceil(currentTracks.length / TRACK_LIMIT);

    if (page < 1 || page > totalPages) return;

    currentPage = page;

    renderTracks();
    renderPagination();
  });

  elements.tableBody?.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-detail-track]");

    const editButton = event.target.closest("[data-edit-track]");

    const deleteButton = event.target.closest("[data-delete-track]");

    if (detailButton) {
      viewTrack(detailButton.dataset.detailTrack);
      return;
    }

    if (editButton) {
      editTrack(editButton.dataset.editTrack);
      return;
    }

    if (deleteButton) {
      deleteTrack(deleteButton.dataset.deleteTrack);
    }
  });

  handleImagePreview();
}

// =========================
// KHỞI TẠO
// =========================

export function initTrackAdmin() {
  if (initialized) return;

  const elements = getElements();

  if (!elements.tableBody) return;

  initialized = true;

  bindEvents();
  loadTracks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTrackAdmin, { once: true });
} else {
  initTrackAdmin();
}

// =========================
// THANH TIẾN TRÌNH UPLOAD
// =========================

function updateUploadProgress(percent, status, type = "upload") {
  const elements = getElements();

  const { uploadProgress, uploadStatus, uploadPercent, uploadBar, uploadIcon } =
    elements;

  if (!uploadProgress) return;

  uploadProgress.classList.remove("hidden");

  const value = Math.min(100, Math.max(0, percent));

  if (uploadStatus) {
    uploadStatus.textContent = status;
  }

  if (uploadPercent) {
    uploadPercent.textContent = `${value}%`;
  }

  if (uploadBar) {
    uploadBar.style.width = `${value}%`;

    uploadBar.className = "rounded-full h-full transition-all duration-300";

    if (type === "success") {
      uploadBar.classList.add("bg-green-500");
    } else if (type === "error") {
      uploadBar.classList.add("bg-red-500");
    } else {
      uploadBar.classList.add("bg-green-500");
    }
  }

  if (uploadIcon) {
    uploadIcon.className = "fa-solid";

    if (type === "success") {
      uploadIcon.classList.add("fa-circle-check", "text-green-400");
    } else if (type === "error") {
      uploadIcon.classList.add("fa-circle-xmark", "text-red-400");
    } else {
      uploadIcon.classList.add("fa-cloud-arrow-up", "text-green-400");
    }
  }

  if (uploadPercent) {
    uploadPercent.className =
      type === "error"
        ? "font-semibold text-red-400 text-sm"
        : "font-semibold text-green-400 text-sm";
  }
}
async function uploadTrackImage(trackId, file) {
  const imageData = new FormData();
  imageData.append("image", file);

  return api.post(
    `/api/upload/track/${encodeURIComponent(trackId)}/image`,
    imageData,
  );
}
