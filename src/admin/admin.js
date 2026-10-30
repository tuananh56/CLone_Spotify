import { api } from "../app/api.js";
import { initTrackAdmin } from "./track_admin.js";

const ADMIN_STATS = [
  {
    key: "albums",
    title: "Tổng số Album",
    endpoint: "/api/albums",
    limit: 20,
    icon: "fa-compact-disc",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    key: "tracks",
    title: "Tổng số Track",
    endpoint: "/api/tracks",
    limit: 50,
    icon: "fa-music",
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  {
    key: "users",
    title: "Tổng số User",
    endpoint: "/api/admin/users",
    limit: 20,
    icon: "fa-users",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    key: "playlists",
    title: "Tổng số Playlist",
    endpoint: "/api/playlists",
    limit: 20,
    icon: "fa-list",
    color: "text-pink-400",
    bg: "bg-pink-500/20",
  },
];

let isInitializing = false;
let isLoadingStats = false;
let isAdminVerified = false;

// Lấy tổng số từ response
function getTotal(data) {
  const values = [
    data?.pagination?.total,
    data?.meta?.total,
    data?.total,
    data?.data?.pagination?.total,
    data?.data?.meta?.total,
    data?.data?.total,
    data?.pagination?.totalItems,
    data?.meta?.totalItems,
  ];

  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

// Lấy mảng dữ liệu
function getItems(data, key) {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return null;
}

// Lấy tổng số bản ghi của từng API
async function fetchTotal(config) {
  const { endpoint, limit, key } = config;

  const firstResponse = await api.get(endpoint, {
    params: {
      limit,
      offset: 0,
    },
  });

  const firstData = firstResponse.data;

  // Ưu tiên total từ Backend
  const total = getTotal(firstData);

  if (total !== null) {
    return total;
  }

  // Nếu không có total thì phân trang để đếm
  const firstItems = getItems(firstData, key);

  if (!firstItems) {
    throw new Error("Không tìm thấy danh sách dữ liệu từ API.");
  }

  let count = firstItems.length;
  let offset = limit;
  let currentItems = firstItems;

  while (currentItems.length === limit) {
    const response = await api.get(endpoint, {
      params: {
        limit,
        offset,
      },
    });

    currentItems = getItems(response.data, key);

    if (!currentItems || currentItems.length === 0) {
      break;
    }

    count += currentItems.length;
    offset += limit;
  }

  return count;
}

// Render thống kê
function renderStats(results) {
  const container = document.getElementById("adminStats");

  if (!container) return;

  container.innerHTML = ADMIN_STATS.map((item) => {
    const result = results[item.key];

    return `
      <div class="bg-neutral-800 hover:bg-neutral-700 p-5 rounded-xl transition">
        <div class="flex justify-between items-center mb-5">
          <div class="${item.bg} flex justify-center items-center rounded-xl w-12 h-12">
            <i class="fa-solid ${item.icon} ${item.color} text-xl"></i>
          </div>

          <span class="text-gray-500 text-xs">
            ${result.success ? "Đã cập nhật" : "Lỗi"}
          </span>
        </div>

        <p class="mb-2 text-gray-400 text-sm">
          ${item.title}
        </p>

        <h3 class="font-bold text-3xl ${
          result.success ? "text-white" : "text-red-400"
        }">
          ${result.success ? result.total.toLocaleString("vi-VN") : "--"}
        </h3>

        ${
          !result.success
            ? `<p class="mt-2 text-red-400 text-xs">${result.error}</p>`
            : ""
        }
      </div>
    `;
  }).join("");
}

// Gọi 4 API thống kê
async function loadAdminStats() {
  if (isLoadingStats) return;

  isLoadingStats = true;

  const refreshBtn = document.getElementById("adminRefreshBtn");
  const errorBox = document.getElementById("adminStatsError");
  const updatedText = document.getElementById("adminStatsUpdated");

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `
      <i class="mr-2 fa-solid fa-spinner fa-spin"></i>
      Đang tải...
    `;
  }

  errorBox?.classList.add("hidden");

  try {
    const entries = await Promise.all(
      ADMIN_STATS.map(async (item) => {
        try {
          const total = await fetchTotal(item);

          return [
            item.key,
            {
              success: true,
              total,
            },
          ];
        } catch (error) {
          return [
            item.key,
            {
              success: false,
              error:
                error.response?.data?.message ||
                error.message ||
                "Không thể tải dữ liệu.",
            },
          ];
        }
      }),
    );

    const results = Object.fromEntries(entries);

    renderStats(results);

    const failed = ADMIN_STATS.filter((item) => !results[item.key].success);

    if (failed.length > 0 && errorBox) {
      errorBox.textContent = failed
        .map((item) => `${item.title}: ${results[item.key].error}`)
        .join(" | ");

      errorBox.classList.remove("hidden");
    }

    if (updatedText) {
      updatedText.textContent =
        "Cập nhật lúc: " + new Date().toLocaleString("vi-VN");
    }
  } finally {
    isLoadingStats = false;

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `
        <i class="mr-2 fa-solid fa-rotate"></i>
        Làm mới
      `;
    }
  }
}

// Khởi tạo Dashboard sau khi xác thực
function initDashboard() {
  if (!isAdminVerified) return;

  initTrackAdmin();
  loadAdminStats();

  document
    .getElementById("adminRefreshBtn")
    ?.addEventListener("click", loadAdminStats);

  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = `${import.meta.env.BASE_URL}login.html`;
  });
}

// Kiểm tra quyền Admin
export async function initAdmin() {
  if (isInitializing || isAdminVerified) return;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = `${import.meta.env.BASE_URL}login.html`;
    return;
  }

  isInitializing = true;

  try {
    // Backend xác nhận quyền Admin
    await api.get("/api/admin/stats");

    isAdminVerified = true;

    initDashboard();
  } catch (error) {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = `${import.meta.env.BASE_URL}login.html`;

      return;
    }

    if (status === 403) {
      alert("Bạn không có quyền truy cập trang quản trị!");

      window.location.href = `${import.meta.env.BASE_URL}home.html`;

      return;
    }

    const container = document.getElementById("adminContent");

    if (container) {
      container.innerHTML = `
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          <h2 class="font-bold text-lg mb-2">
            Không thể xác minh quyền Admin
          </h2>

          <p class="text-sm">
            ${
              error.response?.data?.message ||
              "Vui lòng kiểm tra kết nối và thử lại."
            }
          </p>

          <button
            id="retryAdminBtn"
            type="button"
            class="mt-4 bg-white text-black px-4 py-2 rounded-full font-semibold"
          >
            Thử lại
          </button>
        </div>
      `;

      document
        .getElementById("retryAdminBtn")
        ?.addEventListener("click", initAdmin);
    }
  } finally {
    isInitializing = false;
  }
}

// Khởi chạy
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdmin);
} else {
  initAdmin();
}
