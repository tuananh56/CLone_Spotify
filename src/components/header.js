import { navigate } from "../app/router.js";
import { handleLogout } from "../auth/logout.js";
import { api } from "../app/api.js";

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function initHeader() {
  const searchInput = document.querySelector("#searchInput");
  const searchResults = document.querySelector("#searchResults");

  // Nếu không có searchInput (trang không có header đầy đủ) → bỏ qua
  if (!searchInput || !searchResults) return;

  if (searchInput.dataset.initialized === "true") return;
  searchInput.dataset.initialized = "true";

  // Nhập từ khóa → gọi Universal Search (debounce)
  searchInput.addEventListener(
    "input",
    debounce(async (e) => {
      const keyword = e.target.value.trim();
      if (!keyword) {
        searchResults.classList.add("hidden");
        return;
      }

      searchResults.innerHTML = `
        <div class="p-2 text-gray-400 text-sm italic animate-pulse">
          Đang tìm kiếm...
        </div>`;
      searchResults.classList.remove("hidden");

      try {
        const res = await api.get(
          `/api/search?q=${keyword}&type=all&limit=20&offset=0`,
        );
        const results = res.data.results || {};
        const data = [
          ...(results.tracks || []),
          ...(results.artists || []),
          ...(results.albums || []),
          ...(results.playlists || []),
        ];
        renderSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
        searchResults.innerHTML = `<div class="p-2 text-red-400">Lỗi khi tìm kiếm</div>`;
      }
    }, 500),
  );

  function renderSearchResults(results) {
    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div class="p-2 text-gray-400 text-sm italic">
          Không có kết quả phù hợp
        </div>`;
      return;
    }

    searchResults.innerHTML = results
      .map((item) => {
        const displayName = item.name || item.title || "Không rõ tên";
        const imageSrc =
          item.image_url ||
          item.image ||
          item.thumbnail ||
          "./src/assets/placeholder.png";
        const subLabel =
          item.type === "track"
            ? item.artists?.[0]?.name
            : item.creator || item.artist || "";
        const tagLabel =
          item.type === "artist"
            ? "Nghệ sĩ"
            : item.type === "playlist"
              ? "Danh sách phát"
              : item.type === "album"
                ? "Album"
                : "Bài hát";

        return `
          <div class="flex justify-between items-center p-2 hover:bg-neutral-800 transition-colors duration-200 cursor-pointer search-item rounded-md" data-type="${item.type}" data-id="${item.id}">
            <div class="flex items-center space-x-3">
              <img src="${imageSrc}" alt="${displayName}" class="w-12 h-12 rounded-md object-cover" />
              <div>
                <p class="text-sm font-semibold text-white">${displayName}</p>
                <span class="text-xs text-gray-400">${subLabel}</span>
              </div>
            </div>
            <span class="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded">${tagLabel}</span>
          </div>`;
      })
      .join("");

    searchResults.classList.remove("hidden");
  }

  // Click kết quả → chuyển trang chi tiết
  // Click kết quả → chuyển trang bằng SPA router
  searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (!item) return;

    const type = item.dataset.type;
    const id = item.dataset.id;

    if (!id) return;

    const allowedTypes = ["track", "artist", "album", "playlist"];

    if (!allowedTypes.includes(type)) return;

    navigate(type, { id });
    searchResults.classList.add("hidden");
  });
  // Ctrl + Shift + L → focus ô tìm kiếm
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyL") {
      event.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.classList.add("ring-2", "ring-white");
        setTimeout(
          () => searchInput.classList.remove("ring-2", "ring-white"),
          1000,
        );
      }
    }
  });
}

export function updateHeaderUI() {
  const user = localStorage.getItem("user");

  const mobileUserInfo = document.querySelector("#mobileUserInfo");
  const mobileUserEmail = document.querySelector("#mobileUserEmail");

  const signupBtn = document.querySelector("#signupBtn");
  const loginBtn = document.querySelector("#loginBtn");
  const avatar = document.querySelector("#userAvatar");
  const avatarLetter = document.querySelector("#avatarLetter");

  const mobileAvatar = document.querySelector("#mobileUserAvatar");
  const mobileAvatarLetter = document.querySelector("#mobileAvatarLetter");
  const mobileLoginBtn = document.querySelector("#mobileLoginBtn");
  const mobileSignupBtn = document.querySelector("#mobileSignupBtn");

  const premiumLink = document.querySelector("#premiumLink");
  const supportLink = document.querySelector("#supportLink");
  const downloadLink = document.querySelector("#downloadLink");
  const appInstallLink = document.querySelector("#appInstallLink");
  const signupLink = document.querySelector("#signupLink");

  let parsedUser = null;

  if (user) {
    try {
      parsedUser = JSON.parse(user);
    } catch (error) {
      console.error("Dữ liệu user không hợp lệ:", error);
      localStorage.removeItem("user");
    }
  }

  if (parsedUser) {
    const firstLetter = parsedUser.email?.charAt(0).toUpperCase() || "A";

    // Desktop avatar
    if (avatar && avatarLetter) {
      avatarLetter.textContent = firstLetter;
      avatar.classList.remove("hidden");
    }

    // Desktop email
    let emailDisplay = document.querySelector("#userEmail");

    if (avatar && !emailDisplay) {
      emailDisplay = document.createElement("span");
      emailDisplay.id = "userEmail";
      emailDisplay.className = "ml-2 text-sm text-gray-300";
      avatar.parentNode.insertBefore(emailDisplay, avatar.nextSibling);
    }

    if (emailDisplay) {
      emailDisplay.textContent = parsedUser.email || "";
      emailDisplay.classList.toggle("hidden", !parsedUser.email);
    }

    // Mobile avatar + email
    mobileUserInfo?.classList.remove("hidden");
    mobileUserInfo?.classList.add("flex");

    if (mobileAvatarLetter) {
      mobileAvatarLetter.textContent = firstLetter;
    }

    if (mobileUserEmail) {
      mobileUserEmail.textContent = parsedUser.email || "";
    }

    // Ẩn nút đăng nhập / đăng ký mobile
    mobileLoginBtn?.classList.add("hidden");
    mobileSignupBtn?.classList.add("hidden");

    // Ẩn nút đăng nhập / đăng ký desktop
    signupBtn?.classList.add("hidden");
    loginBtn?.classList.add("hidden");

    supportLink?.classList.add("hidden");
    downloadLink?.classList.add("hidden");
    signupLink?.classList.add("hidden");

    premiumLink?.classList.remove("hidden");
    appInstallLink?.classList.remove("hidden");
  } else {
    // Desktop
    avatar?.classList.add("hidden");
    document.querySelector("#userEmail")?.classList.add("hidden");

    signupBtn?.classList.remove("hidden");
    loginBtn?.classList.remove("hidden");

    // Mobile: ẩn thông tin người dùng
    mobileUserInfo?.classList.add("hidden");
    mobileUserInfo?.classList.remove("flex");

    // Hiện nút đăng nhập / đăng ký
    mobileLoginBtn?.classList.remove("hidden");
    mobileSignupBtn?.classList.remove("hidden");

    // Menu mặc định
    premiumLink?.classList.remove("hidden");
    supportLink?.classList.remove("hidden");
    downloadLink?.classList.remove("hidden");
    appInstallLink?.classList.remove("hidden");
    signupLink?.classList.remove("hidden");
  }
}

// === Các sự kiện riêng cho login/register/logout ===
// === Khởi tạo sự kiện Header ===
let headerEventsInitialized = false;

export function initHeaderEvents() {
  if (headerEventsInitialized) return;

  headerEventsInitialized = true;
  // console.log("Header events đã khởi tạo");

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");

    if (target.closest("#mobileMenuBtn")) {
      // console.log("Đã click hamburger");
      // console.log("Menu trước khi click:", menu?.className);

      event.preventDefault();

      if (!menu) return;

      const isOpening = menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !isOpening);

      // console.log("Menu sau khi click:", menu.className);

      return;
    }

    // Giữ nguyên các xử lý đăng xuất, đăng nhập, đăng ký...
  });
}
// export function checkHamburgerMenu() {
//   const menuBtn = document.getElementById("mobileMenuBtn");
//   const menu = document.getElementById("mobileMenu");

//   console.log("===== CHECK HAMBURGER =====");
//   console.log("Nút hamburger:", menuBtn);
//   console.log("Menu:", menu);
//   console.log("Menu đang ẩn:", menu?.classList.contains("hidden"));
//   console.log("Sự kiện đã khởi tạo:", headerEventsInitialized);
// }
