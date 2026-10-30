
import { api } from "../app/api.js";

const STAT_CARDS = [
  {
    key: "users",
    title: "Người dùng",
    icon: "fa-users",
    color: "text-blue-400",
    aliases: [
      "total_users",
      "totalUsers",
      "user_count",
      "userCount",
      "users",
    ],
  },
  {
    key: "tracks",
    title: "Bài hát",
    icon: "fa-music",
    color: "text-green-400",
    aliases: [
      "total_tracks",
      "totalTracks",
      "track_count",
      "trackCount",
      "tracks",
      "songs",
    ],
  },
  {
    key: "artists",
    title: "Nghệ sĩ",
    icon: "fa-microphone",
    color: "text-purple-400",
    aliases: [
      "total_artists",
      "totalArtists",
      "artist_count",
      "artistCount",
      "artists",
    ],
  },
  {
    key: "albums",
    title: "Album",
    icon: "fa-compact-disc",
    color: "text-orange-400",
    aliases: [
      "total_albums",
      "totalAlbums",
      "album_count",
      "albumCount",
      "albums",
    ],
  },
];

// Lấy giá trị thống kê từ nhiều cấu trúc Response khác nhau
function findStatValue(data, aliases) {
  if (!data || typeof data !== "object") return null;

  const normalizedAliases = aliases.map((key) =>
    key.toLowerCase().replace(/[_-]/g, ""),
  );

  const search = (obj, depth = 0) => {
    if (!obj || typeof obj !== "object" || depth > 4) {
      return null;
    }

    for (const [key, value] of Object.entries(obj)) {
      const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");

      if (normalizedAliases.includes(normalizedKey)) {
        if (Array.isArray(value)) return value.length;

        if (value && typeof value === "object") {
          const count = value.total ?? value.count ?? value.length;
          if (count !== undefined) return count;
        }

        if (typeof value === "number" || typeof value === "string") {
          return value;
        }
      }
    }

    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        const result = search(value, depth + 1);
        if (result !== null) return result;
      }
    }

    return null;
  };

  return search(data);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("vi-VN")
    : String(value);
}

// Hiển thị các thẻ thống kê
function renderStats(data) {
  const container = document.getElementById("adminStats");

  if (!container) return;

  container.innerHTML = STAT_CARDS.map((item) => {
    const value = findStatValue(data, item.aliases);

    return `
      <div class="bg-neutral-800 border border-neutral-700
                  rounded-xl p-5 hover:border-neutral-500
                  transition duration-200">

        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-400 text-sm">${item.title}</p>

          <i class="fa-solid ${item.icon} ${item.color} text-xl"></i>
        </div>

        <h3 class="text-3xl font-bold text-white">
          ${formatNumber(value)}
        </h3>
      </div>
    `;
  }).join("");
}

// Cập nhật thời gian tải dữ liệu
function updateLastUpdated() {
  const element = document.getElementById("adminStatsUpdated");

  if (element) {
    element.textContent =
      "Cập nhật lúc " +
      new Date().toLocaleTimeString("vi-VN");
  }
}

// Hiển thị lỗi
function renderError(message) {
  const errorElement = document.getElementById("adminStatsError");

  if (!errorElement) return;

  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Ẩn lỗi
function hideError() {
  document.getElementById("adminStatsError")?.classList.add("hidden");
}

// Lấy dữ liệu thống kê
async function loadAdminStats(button = null) {
  const refreshBtn = button ||
    document.getElementById("adminRefreshBtn");

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  hideError();

  const container = document.getElementById("adminStats");

  if (container && !container.children.length) {
    container.innerHTML = `
      <div class="col-span-full text-center text-gray-400 py-10">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
    `;
  }

  try {
    const res = await api.get("/api/admin/stats");

    // API có thể trả dữ liệu trong data hoặc stats
    const responseData = res.data?.data ?? res.data;

    renderStats(responseData);
    updateLastUpdated();

  } catch (error) {
    console.error("Load admin stats error:", error);

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      renderError(
        status === 401
          ? "Phiên đăng nhập hết hạn."
          : "Tài khoản không có quyền Admin.",
      );

      return;
    }

    renderError(
      error.response?.data?.message ||
      "Không thể tải dữ liệu thống kê.",
    );

  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove(
        "opacity-50",
        "cursor-not-allowed",
      );
    }
  }
}

// Khởi tạo Dashboard
export function initAdminDashboard(initialData = null) {
  const container = document.getElementById("adminStats");

  if (!container) {
    console.error("Không tìm thấy #adminStats");
    return;
  }

  // Nếu admin.js đã xác thực và có dữ liệu thì hiển thị luôn
  if (initialData) {
    const responseData = initialData.data ?? initialData;

    renderStats(responseData);
    updateLastUpdated();
  }

  // Nút tải lại thống kê
  const refreshBtn = document.getElementById("adminRefreshBtn");

  if (refreshBtn && refreshBtn.dataset.initialized !== "true") {
    refreshBtn.dataset.initialized = "true";

    refreshBtn.addEventListener("click", () => {
      loadAdminStats(refreshBtn);
    });
  }
}
