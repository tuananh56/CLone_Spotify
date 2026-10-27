import { api } from "/src/app/api.js";
import { navigate } from "/src/app/router.js";

const input = document.getElementById("searchPageInput");
const resultsBox = document.getElementById("searchPageResults");
const clearBtn = document.getElementById("clearSearchBtn");
const shortcut = document.getElementById("searchShortcut");
const browseSection = document.getElementById("browseSection");
const resultsSection = document.getElementById("searchResultsSection");
const resultsTitle = document.getElementById("searchResultsTitle");
const resultGrid = document.getElementById("searchResultGrid");
const backBtn = document.getElementById("backToBrowseBtn");
const categoryGrid = document.getElementById("categoryGrid");

let debounceTimer;
let requestId = 0;

function escapeHTML(value = "") {
  return String(value).replace(
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

function getImage(item) {
  return (
    item.image_url ||
    item.image ||
    item.thumbnail ||
    "/src/assets/placeholder.png"
  );
}

function getName(item) {
  return item.name || item.title || "Chưa có tên";
}

function getSubtitle(item) {
  if (item.type === "track") {
    return (
      item.artists?.map((artist) => artist.name).join(", ") ||
      item.artist ||
      "Bài hát"
    );
  }

  if (item.type === "artist") return "Nghệ sĩ";
  if (item.type === "album") return "Album";
  if (item.type === "playlist") return item.creator || "Playlist";

  return "";
}

function showBrowse() {
  browseSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");
  resultsBox.classList.add("hidden");
}

function renderResults(items, keyword) {
  resultsTitle.textContent = `Kết quả cho "${keyword}"`;
  browseSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
  resultsBox.classList.add("hidden");

  if (!items.length) {
    resultGrid.innerHTML = `
            <p class="col-span-full py-10 text-neutral-400 text-center">
              Không tìm thấy kết quả phù hợp.
            </p>
          `;
    return;
  }

  resultGrid.innerHTML = items
    .map((item) => {
      const type = ["track", "artist", "album", "playlist"].includes(item.type)
        ? item.type
        : "track";

      return `
            <button
              type="button"
              class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg text-left transition search-result-card"
              data-type="${escapeHTML(type)}"
              data-id="${escapeHTML(item.id || "")}"
            >
              <img
                src="${escapeHTML(getImage(item))}"
                alt=""
                loading="lazy"
                class="shadow-lg mb-4 rounded-md w-full object-cover aspect-square"
                onerror="this.onerror=null;this.src='/src/assets/placeholder.png'"
              />
              <h3 class="mb-1 font-bold truncate">${escapeHTML(getName(item))}</h3>
              <p class="text-neutral-400 text-sm truncate">${escapeHTML(getSubtitle(item))}</p>
            </button>
          `;
    })
    .join("");
}

function renderQuickResults(items) {
  if (!items.length) {
    resultsBox.innerHTML = `
            <p class="p-3 text-neutral-400 text-sm">
              Không tìm thấy kết quả.
            </p>
          `;
    resultsBox.classList.remove("hidden");
    return;
  }

  resultsBox.innerHTML = items
    .slice(0, 8)
    .map((item) => {
      const type = ["track", "artist", "album", "playlist"].includes(item.type)
        ? item.type
        : "track";

      return `
            <button
              type="button"
              class="flex items-center gap-3 hover:bg-neutral-800 p-2 rounded-md w-full text-left transition quick-result"
              data-type="${escapeHTML(type)}"
              data-id="${escapeHTML(item.id || "")}"
            >
              <img
                src="${escapeHTML(getImage(item))}"
                alt=""
                class="rounded w-12 h-12 object-cover"
                onerror="this.onerror=null;this.src='/src/assets/placeholder.png'"
              />
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-sm truncate">${escapeHTML(getName(item))}</span>
                <span class="block text-neutral-400 text-xs truncate">${escapeHTML(getSubtitle(item))}</span>
              </span>
              <i class="fa-arrow-up-right-from-square text-neutral-500 text-xs fa-solid"></i>
            </button>
          `;
    })
    .join("");

  resultsBox.classList.remove("hidden");
}

async function searchMusic(keyword, showPage = false) {
  const currentRequest = ++requestId;

  try {
    const response = await api.get(
      `/api/search?q=${encodeURIComponent(keyword)}&type=all&limit=20&offset=0`,
    );

    if (currentRequest !== requestId) return;

    const data = response.data.results || {};
    const items = [
      ...(data.tracks || []),
      ...(data.artists || []),
      ...(data.albums || []),
      ...(data.playlists || []),
    ];

    if (showPage) {
      renderResults(items, keyword);
    } else {
      renderQuickResults(items);
    }
  } catch (error) {
    if (currentRequest !== requestId) return;

    // console.error("Lỗi tìm kiếm:", error);

    if (showPage) {
      renderResults([], keyword);
      resultGrid.innerHTML = `
              <p class="col-span-full py-10 text-red-400 text-center">
                Không thể tải kết quả. Vui lòng thử lại.
              </p>
            `;
    } else {
      resultsBox.innerHTML = `
              <p class="p-3 text-red-400 text-sm">
                Lỗi khi tìm kiếm. Vui lòng thử lại.
              </p>
            `;
      resultsBox.classList.remove("hidden");
    }
  }
}

input.addEventListener("input", () => {
  const keyword = input.value.trim();

  clearTimeout(debounceTimer);
  clearBtn.classList.toggle("hidden", !keyword);
  shortcut.classList.toggle("hidden", Boolean(keyword));

  if (!keyword) {
    requestId++;
    resultsBox.classList.add("hidden");
    showBrowse();
    return;
  }

  resultsBox.innerHTML = `
          <p class="p-3 text-neutral-400 text-sm">
            Đang tìm kiếm...
          </p>
        `;
  resultsBox.classList.remove("hidden");

  debounceTimer = setTimeout(() => {
    searchMusic(keyword, false);
  }, 350);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const keyword = input.value.trim();
    if (!keyword) return;

    clearTimeout(debounceTimer);
    searchMusic(keyword, true);
  }

  if (event.key === "Escape") {
    input.value = "";
    clearBtn.classList.add("hidden");
    shortcut.classList.remove("hidden");
    resultsBox.classList.add("hidden");
    showBrowse();
    input.blur();
  }
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  clearBtn.classList.add("hidden");
  shortcut.classList.remove("hidden");
  resultsBox.classList.add("hidden");
  showBrowse();
  input.focus();
});

backBtn.addEventListener("click", showBrowse);

document.addEventListener("click", (event) => {
  if (
    !event.target.closest("#searchPageInput") &&
    !event.target.closest("#searchPageResults")
  ) {
    resultsBox.classList.add("hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.code === "KeyL") {
    event.preventDefault();
    input.focus();
  }
});

function openResult(type, id) {
  if (!id) return;
  if (!["track", "artist", "album", "playlist"].includes(type)) return;

  navigate(type, { id });
}

resultsBox.addEventListener("click", (event) => {
  const button = event.target.closest(".quick-result");
  if (!button) return;
  openResult(button.dataset.type, button.dataset.id);
});

resultGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".search-result-card");
  if (!button) return;
  openResult(button.dataset.type, button.dataset.id);
});

categoryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  const keyword = button.dataset.category;
  input.value = keyword;
  clearBtn.classList.remove("hidden");
  shortcut.classList.add("hidden");
  searchMusic(keyword, true);
});

// Hiển thị đúng trạng thái đăng nhập.
const user = localStorage.getItem("user");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const avatar = document.getElementById("userAvatar");
const avatarLetter = document.getElementById("avatarLetter");
const premiumLink = document.getElementById("premiumLink");
const appInstallLink = document.getElementById("appInstallLink");

if (user) {
  try {
    const parsedUser = JSON.parse(user);

    loginBtn.classList.add("hidden");
    signupBtn.classList.add("hidden");
    premiumLink.classList.remove("hidden");
    appInstallLink.classList.remove("hidden");

    avatarLetter.textContent = parsedUser.email?.charAt(0).toUpperCase() || "U";
    avatar.classList.remove("hidden");
    avatar.classList.add("flex");
  } catch {
    localStorage.removeItem("user");
  }
} else {
  loginBtn.classList.remove("hidden");
  signupBtn.classList.remove("hidden");
}

loginBtn.addEventListener("click", () => {
  window.location.href = "/login.html";
});

signupBtn.addEventListener("click", () => {
  window.location.href = "/register.html";
});

// Nếu dự án có xử lý đăng xuất trong header.js, hãy dùng chung hàm đó.
avatar.addEventListener("click", async () => {
  try {
    const { handleLogout } = await import("/src/auth/logout.js");
    handleLogout();
  } catch (error) {
    // console.error("Không thể đăng xuất:", error);
  }
});
