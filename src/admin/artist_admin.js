
import { api } from "../app/api.js";

const ARTIST_API = "/api/artists";
const API_LIMIT = 20;
const PAGE_LIMIT = 10;

let initialized = false;
let allArtists = [];
let filteredArtists = [];
let currentPage = 1;
let editingArtistId = null;
let searchKeyword = "";

function getElements() {
  return {
    tableBody: document.getElementById("artistTableBody"),
    total: document.getElementById("artistTotal"),
    pagination: document.getElementById("artistPagination"),
    paginationInfo: document.getElementById("artistPaginationInfo"),
    searchInput: document.getElementById("artistSearchInput"),
    refreshBtn: document.getElementById("artistRefreshBtn"),

    modal: document.getElementById("artistModal"),
    modalTitle: document.getElementById("artistModalTitle"),
    form: document.getElementById("artistForm"),
    openBtn: document.getElementById("addArtistBtn"),
    closeBtn: document.getElementById("closeArtistModalBtn"),
    cancelBtn: document.getElementById("cancelArtistBtn"),

    name: document.getElementById("artistName"),
    imageUrl: document.getElementById("artistImageUrl"),
    imagePreview: document.getElementById("artistImagePreview"),
    saveBtn: document.getElementById("saveArtistBtn"),
  };
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function getArtistList(data) {
  if (Array.isArray(data?.artists)) return data.artists;
  if (Array.isArray(data?.data?.artists)) return data.data.artists;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function getArtistTotal(data, artists) {
  const value =
    data?.pagination?.total ??
    data?.data?.pagination?.total ??
    data?.total ??
    data?.data?.total;

  return Number.isFinite(Number(value)) ? Number(value) : artists.length;
}

function getArtist(data) {
  return data?.artist || data?.data?.artist || data?.data || data;
}

function showMessage(message) {
  alert(message);
}

// =========================
// TẢI TOÀN BỘ NGHỆ SĨ
// =========================

async function loadArtists() {
  const { tableBody, total } = getElements();

  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
        Đang tải danh sách nghệ sĩ...
      </td>
    </tr>
  `;

  try {
    let artists = [];
    let offset = 0;
    let totalFromServer = null;

    while (true) {
      const res = await api.get(ARTIST_API, {
        params: {
          limit: API_LIMIT,
          offset,
        },
      });

      const pageArtists = getArtistList(res.data);

      if (totalFromServer === null) {
        totalFromServer = getArtistTotal(res.data, pageArtists);
      }

      if (!pageArtists.length) break;

      artists.push(...pageArtists);
      offset += pageArtists.length;

      if (
        artists.length >= totalFromServer ||
        pageArtists.length < API_LIMIT
      ) {
        break;
      }
    }

    // Tránh trùng ID nếu API trả dữ liệu bất thường.
    const uniqueArtists = new Map();

    artists.forEach((artist) => {
      if (artist?.id) uniqueArtists.set(String(artist.id), artist);
    });

    allArtists = Array.from(uniqueArtists.values());

    filterArtists();

    if (total) {
      total.textContent = `${allArtists.length.toLocaleString("vi-VN")} nghệ sĩ`;
    }
  } catch (error) {
    console.error("Load artists error:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-12 text-center text-red-400">
          Không thể tải danh sách nghệ sĩ.
          <button id="retryArtistBtn" class="ml-2 underline">
            Thử lại
          </button>
        </td>
      </tr>
    `;

    document
      .getElementById("retryArtistBtn")
      ?.addEventListener("click", loadArtists);

    if (total) total.textContent = "Lỗi tải dữ liệu";
  }
}

// =========================
// TÌM KIẾM
// =========================

function filterArtists() {
  const keyword = searchKeyword.toLowerCase();

  filteredArtists = allArtists.filter((artist) => {
    const name = String(
      artist.name || artist.artist_name || artist.title || "",
    ).toLowerCase();

    return name.includes(keyword);
  });

  currentPage = 1;
  renderArtists();
  renderPagination();
}

// =========================
// HIỂN THỊ DANH SÁCH
// =========================

function renderArtists() {
  const { tableBody } = getElements();

  if (!tableBody) return;

  const startIndex = (currentPage - 1) * PAGE_LIMIT;
  const artists = filteredArtists.slice(
    startIndex,
    startIndex + PAGE_LIMIT,
  );

  if (!artists.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-12 text-center text-gray-400">
          Không tìm thấy nghệ sĩ.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = artists.map((artist, index) => {
    const id = String(artist.id ?? "");
    const name = artist.name || artist.artist_name || artist.title || "Chưa có tên";
    const image =
      artist.image_url ||
      artist.avatar_url ||
      artist.image ||
      "./playlist.png";

    return `
      <tr class="border-t border-neutral-700 hover:bg-neutral-800/70">
        <td class="px-5 py-4 text-gray-400">
          ${startIndex + index + 1}
        </td>

        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <img
              src="${escapeHTML(image)}"
              alt=""
              class="h-12 w-12 rounded-full object-cover bg-neutral-700"
              onerror="this.onerror=null;this.src='./playlist.png'"
            />
            <span class="font-medium">
              ${escapeHTML(name)}
            </span>
          </div>
        </td>

        <td class="px-5 py-4 text-gray-400">
          <span class="break-all">${escapeHTML(id)}</span>
        </td>

        <td class="px-5 py-4 text-right whitespace-nowrap">
          <button
            type="button"
            data-detail-artist="${escapeHTML(id)}"
            class="mr-3 text-blue-400 hover:text-blue-300"
            title="Chi tiết"
          >
            <i class="fa-solid fa-eye"></i>
          </button>

          <button
            type="button"
            data-edit-artist="${escapeHTML(id)}"
            class="mr-3 text-yellow-400 hover:text-yellow-300"
            title="Chỉnh sửa"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            type="button"
            data-delete-artist="${escapeHTML(id)}"
            class="text-red-400 hover:text-red-300"
            title="Xóa"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// =========================
// PHÂN TRANG
// =========================

function renderPagination() {
  const { pagination, paginationInfo } = getElements();

  if (!pagination) return;

  const total = filteredArtists.length;
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const start = total ? (currentPage - 1) * PAGE_LIMIT + 1 : 0;
  const end = Math.min(currentPage * PAGE_LIMIT, total);

  if (paginationInfo) {
    paginationInfo.textContent =
      `Hiển thị ${start} - ${end} trong ${total} nghệ sĩ`;
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
      class="rounded-lg bg-neutral-700 px-3 py-2 hover:bg-neutral-600 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <span class="px-3 text-sm">
      ${currentPage} / ${totalPages}
    </span>

    <button
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage >= totalPages ? "disabled" : ""}
      class="rounded-lg bg-neutral-700 px-3 py-2 hover:bg-neutral-600 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

// =========================
// MODAL
// =========================

function openModal() {
  const elements = getElements();

  editingArtistId = null;
  elements.form?.reset();

  if (elements.modalTitle) {
    elements.modalTitle.textContent = "Thêm nghệ sĩ";
  }

  if (elements.saveBtn) {
    elements.saveBtn.textContent = "Thêm nghệ sĩ";
  }

  if (elements.imagePreview) {
    elements.imagePreview.src = "";
    elements.imagePreview.classList.add("hidden");
  }

  elements.modal?.classList.remove("hidden");
  elements.modal?.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const elements = getElements();

  elements.modal?.classList.add("hidden");
  elements.modal?.classList.remove("flex");

  document.body.style.overflow = "";
  editingArtistId = null;
}

// =========================
// XEM CHI TIẾT
// =========================

async function viewArtist(id) {
  try {
    const res = await api.get(
      `${ARTIST_API}/${encodeURIComponent(id)}`,
    );

    const artist = getArtist(res.data);

    if (!artist || !artist.id) {
      showMessage("Không tìm thấy nghệ sĩ.");
      return;
    }

    const name = artist.name || artist.artist_name || "Chưa có tên";
    const image = artist.image_url || artist.avatar_url || "Chưa có ảnh";

    showMessage(
      `Tên nghệ sĩ: ${name}\n` +
      `Artist ID: ${artist.id}\n` +
      `Ảnh: ${image}`,
    );
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
      "Không thể lấy thông tin nghệ sĩ.",
    );
  }
}

// =========================
// CHỈNH SỬA
// =========================

async function editArtist(id) {
  try {
    const res = await api.get(
      `${ARTIST_API}/${encodeURIComponent(id)}`,
    );

    const artist = getArtist(res.data);

    if (!artist || !artist.id) {
      showMessage("Không tìm thấy nghệ sĩ.");
      return;
    }

    const elements = getElements();

    editingArtistId = id;

    elements.name.value =
      artist.name || artist.artist_name || artist.title || "";

    elements.imageUrl.value =
      artist.image_url || artist.avatar_url || artist.image || "";

    if (elements.imagePreview && elements.imageUrl.value) {
      elements.imagePreview.src = elements.imageUrl.value;
      elements.imagePreview.classList.remove("hidden");
    } else {
      elements.imagePreview?.classList.add("hidden");
    }

    if (elements.modalTitle) {
      elements.modalTitle.textContent = "Chỉnh sửa nghệ sĩ";
    }

    if (elements.saveBtn) {
      elements.saveBtn.textContent = "Lưu thay đổi";
    }

    elements.modal?.classList.remove("hidden");
    elements.modal?.classList.add("flex");
    document.body.style.overflow = "hidden";
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
      "Không thể lấy thông tin nghệ sĩ.",
    );
  }
}

// =========================
// THÊM / CẬP NHẬT
// =========================

async function handleSubmit(event) {
  event.preventDefault();

  const elements = getElements();

  const name = elements.name.value.trim();
  const imageUrl = elements.imageUrl.value.trim();

  if (!name) {
    showMessage("Vui lòng nhập tên nghệ sĩ.");
    elements.name.focus();
    return;
  }

  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch {
      showMessage("URL ảnh không hợp lệ.");
      elements.imageUrl.focus();
      return;
    }
  }

  const payload = {
    name,
    image_url: imageUrl || null,
  };

  try {
    elements.saveBtn.disabled = true;
    elements.saveBtn.textContent = "Đang lưu...";

    if (editingArtistId) {
      await api.put(
        `${ARTIST_API}/${encodeURIComponent(editingArtistId)}`,
        payload,
      );

      showMessage("Cập nhật nghệ sĩ thành công!");
    } else {
      await api.post(ARTIST_API, payload);

      showMessage("Thêm nghệ sĩ thành công!");
    }

    closeModal();
    await loadArtists();
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể lưu nghệ sĩ. Hãy kiểm tra API backend.",
    );
  } finally {
    elements.saveBtn.disabled = false;
    elements.saveBtn.textContent = editingArtistId
      ? "Lưu thay đổi"
      : "Thêm nghệ sĩ";
  }
}

// =========================
// XÓA
// =========================

async function deleteArtist(id) {
  const artist = allArtists.find(
    (item) => String(item.id) === String(id),
  );

  const name =
    artist?.name || artist?.artist_name || "nghệ sĩ này";

  if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" không?`)) {
    return;
  }

  try {
    await api.delete(
      `${ARTIST_API}/${encodeURIComponent(id)}`,
    );

    showMessage("Xóa nghệ sĩ thành công!");
    await loadArtists();
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể xóa nghệ sĩ.",
    );
  }
}

// =========================
// XEM TRƯỚC ẢNH
// =========================

function bindImagePreview() {
  const { imageUrl, imagePreview } = getElements();

  imageUrl?.addEventListener("input", () => {
    const url = imageUrl.value.trim();

    if (!url) {
      imagePreview?.classList.add("hidden");
      return;
    }

    if (imagePreview) {
      imagePreview.src = url;
      imagePreview.classList.remove("hidden");
    }
  });

  imagePreview?.addEventListener("error", () => {
    imagePreview.classList.add("hidden");
  });

  imagePreview?.addEventListener("load", () => {
    imagePreview.classList.remove("hidden");
  });
}

// =========================
// EVENTS
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

  elements.refreshBtn?.addEventListener("click", loadArtists);

  elements.searchInput?.addEventListener("input", () => {
    searchKeyword = elements.searchInput.value.trim();
    filterArtists();
  });

  elements.pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");

    if (!button || button.disabled) return;

    const page = Number(button.dataset.page);
    const totalPages = Math.ceil(filteredArtists.length / PAGE_LIMIT);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderArtists();
    renderPagination();
  });

  elements.tableBody?.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-detail-artist]");
    const editButton = event.target.closest("[data-edit-artist]");
    const deleteButton = event.target.closest("[data-delete-artist]");

    if (detailButton) {
      viewArtist(detailButton.dataset.detailArtist);
    } else if (editButton) {
      editArtist(editButton.dataset.editArtist);
    } else if (deleteButton) {
      deleteArtist(deleteButton.dataset.deleteArtist);
    }
  });

  bindImagePreview();
}

// =========================
// INIT
// =========================

export function initArtistAdmin() {
  if (initialized) return;

  const elements = getElements();

  if (!elements.tableBody) return;

  initialized = true;
  bindEvents();
  loadArtists();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArtistAdmin);
} else {
  initArtistAdmin();
}
