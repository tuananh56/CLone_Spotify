import { handleLogout } from "../auth/logout.js";
import { api } from "../app/router.js";

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

  // // Focus → hiển thị trending
  // searchInput.addEventListener("focus", async () => {
  //   const res = await api.get("/api/search/trending");
  //   const data = Array.isArray(res.data)
  //     ? res.data
  //     : res.data.trending_searches || [];
  //   renderSearchResults(data);
  // });

  // Nhập từ khóa → gọi Universal Search (debounce)
  searchInput.addEventListener(
    "input",
    debounce(async (e) => {
      const keyword = e.target.value.trim();
      if (!keyword) {
        searchResults.classList.add("hidden");
        return;
      }

      // Hiển thị trạng thái loading
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
        let tagLabel = "";
        let displayName = item.name || item.title || "Không rõ tên";
        let subLabel = "";
        let imageSrc =
          item.image || item.thumbnail || "/src/assets/placeholder.png";

        switch (item.type) {
          case "artist":
            tagLabel = "Nghệ sĩ";
            subLabel = item.name ;
            break;
          case "playlist":
            tagLabel = "Danh sách phát";
            subLabel = item.creator ;
            break;
          case "album":
            tagLabel = "Album";
            subLabel = item.artist ;
            break;
          case "track":
            tagLabel = "Bài hát";
            subLabel = item.artists?.[0]?.name ;
            break;
          default:
            tagLabel = "Khác";
        }

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
  searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (!item) return;
    const type = item.dataset.type;
    const id = item.dataset.id;
    window.location.href = `/${type}.html?id=${id}`;
  });

  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyL") {
      event.preventDefault(); // chặn Bing search
      const input = document.getElementById("searchInput");
      if (input) {
        input.focus();
        // thêm hiệu ứng highlight viền trắng khi focus
        input.classList.add("ring-2", "ring-white");
        setTimeout(() => input.classList.remove("ring-2", "ring-white"), 1000);
      }
    }
  });
}
export function updateHeaderUI() {
  const user = localStorage.getItem("user");
  const signupBtn = document.querySelector("#signupBtn");
  const loginBtn = document.querySelector("#loginBtn");
  const avatar = document.querySelector("#userAvatar");
  const avatarLetter = document.querySelector("#avatarLetter");

  if (!avatar || !avatarLetter) return;

  let emailDisplay = document.querySelector("#userEmail");
  if (!emailDisplay) {
    emailDisplay = document.createElement("span");
    emailDisplay.id = "userEmail";
    emailDisplay.className = "ml-2 text-sm text-gray-300";
    avatar.parentNode.insertBefore(emailDisplay, avatar.nextSibling);
  }

  // Nếu phần tử không tồn tại (trang không có header đầy đủ) thì bỏ qua
  // if (!signupBtn || !loginBtn || !avatar || !avatarLetter) return;

  if (user) {
    const parsedUser = JSON.parse(user);
    signupBtn.style.display = "none";
    loginBtn.style.display = "none";

    const firstLetter = parsedUser.email?.charAt(0).toUpperCase() || "A";
    avatarLetter.textContent = firstLetter;

    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    avatar.style.backgroundColor = randomColor;

    avatar.classList.remove("hidden");
    emailDisplay.textContent = parsedUser.email;
    emailDisplay.classList.remove("hidden");
  } else {
    signupBtn.style.display = "inline-block";
    loginBtn.style.display = "inline-block";
    avatar.classList.add("hidden");
    emailDisplay.classList.add("hidden");
  }
}

updateHeaderUI();

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "/login.html";
    });
  }
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      window.location.href = "/register.html";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const avatar = document.querySelector("#userAvatar");
  if (avatar) {
    avatar.addEventListener("click", () => {
      handleLogout();
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("registerPassword");
  const toggleBtn = document.getElementById("togglePassword");

  toggleBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Đổi icon mắt
    toggleBtn.innerHTML =
      type === "password"
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("loginPassword");
  const toggleBtn = document.getElementById("toggleLoginPassword");

  toggleBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Đổi icon
    toggleBtn.innerHTML =
      type === "password"
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
  });
});
