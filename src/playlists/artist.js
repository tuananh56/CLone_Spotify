import { api } from "../app/api.js";

// =========================
// Khởi tạo trang nghệ sĩ
// =========================

let currentArtistId = null;
let requestId = 0;

export async function initArtistPage(id) {
  if (!id) {
    showError("Không tìm thấy ID nghệ sĩ.");
    return;
  }

  currentArtistId = String(id);

  // Đánh dấu request để tránh dữ liệu cũ ghi đè trang mới.
  const currentRequestId = ++requestId;

  // Xóa nội dung cũ trước khi tải nghệ sĩ mới.
  const header = document.getElementById("artistHeader");
  const tracksContainer = document.getElementById("artistTracks");
  const albumsContainer = document.getElementById("artistAlbums");

  if (header) {
    header.innerHTML = `
      <p class="text-gray-400">Đang tải thông tin nghệ sĩ...</p>
    `;
  }

  if (tracksContainer) tracksContainer.replaceChildren();
  if (albumsContainer) albumsContainer.replaceChildren();

  await loadArtistView(currentArtistId, currentRequestId);
}

// =========================
// Tải dữ liệu nghệ sĩ
// =========================

async function loadArtistView(artistId, currentRequestId) {
  try {
    // 1. Lấy thông tin nghệ sĩ
    let artistRes;

    try {
      artistRes = await api.get(`/api/artists/${encodeURIComponent(artistId)}`);
    } catch (err) {
      if (currentRequestId !== requestId) return;

      console.error("Lỗi API thông tin nghệ sĩ:", {
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      showError("Không thể tải thông tin nghệ sĩ.");
      return;
    }

    // Bỏ qua kết quả của trang cũ nếu người dùng đã chuyển trang.
    if (currentRequestId !== requestId) return;

    const artist = artistRes.data;

    if (!artist || !artist.name) {
      console.error("Dữ liệu nghệ sĩ không hợp lệ:", artist);
      showError("Thông tin nghệ sĩ không hợp lệ.");
      return;
    }

    renderArtistHeader(artist);

    // 2. Lấy danh sách bài hát và album
    const [tracksResult, albumsResult] = await Promise.allSettled([
      api.get(`/api/artists/${encodeURIComponent(artistId)}/tracks`),
      api.get(`/api/artists/${encodeURIComponent(artistId)}/albums`),
    ]);

    if (currentRequestId !== requestId) return;

    if (tracksResult.status === "fulfilled") {
      const data = tracksResult.value.data;

      renderTracksSection(Array.isArray(data?.tracks) ? data.tracks : []);
    } else {
      console.error("Lỗi API bài hát nghệ sĩ:", tracksResult.reason);
      showSectionError("artistTracks", "Không thể tải danh sách bài hát.");
    }

    if (albumsResult.status === "fulfilled") {
      const data = albumsResult.value.data;

      renderAlbumsSection(Array.isArray(data?.albums) ? data.albums : []);
    } else {
      console.error("Lỗi API album nghệ sĩ:", albumsResult.reason);
      showSectionError("artistAlbums", "Không thể tải danh sách album.");
    }
  } catch (err) {
    if (currentRequestId !== requestId) return;

    console.error("Lỗi tải trang nghệ sĩ:", err);
    showError("Đã xảy ra lỗi khi tải trang nghệ sĩ.");
  }
}

// =========================
// Hiển thị lỗi
// =========================

function showError(message) {
  const header = document.getElementById("artistHeader");

  if (header) {
    header.innerHTML = `
      <p class="text-red-400">${escapeHTML(message)}</p>
    `;
  }
}

function showSectionError(containerId, message) {
  const container = document.getElementById(containerId);

  if (container) {
    container.innerHTML = `
      <p class="text-red-400">${escapeHTML(message)}</p>
    `;
  }
}

// =========================
// Hiển thị thông tin nghệ sĩ
// =========================

function renderArtistHeader(artist) {
  const header = document.getElementById("artistHeader");

  if (!header) return;

  const imageUrl = artist.image_url || "./src/assets/artist.png";
  const artistName = artist.name || "Nghệ sĩ không tên";
  const monthlyListeners = Number(artist.monthly_listeners) || 0;
  const bio = artist.bio || "Chưa có mô tả";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = artistName;
  image.className = "w-48 h-48 object-cover rounded-full shadow-lg";
  image.onerror = () => {
    image.onerror = null;
    image.src = "./src/assets/artist.png";
  };

  header.replaceChildren();

  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col items-center gap-6 md:flex-row";

  const info = document.createElement("div");

  const label = document.createElement("p");
  label.className = "text-sm text-gray-300 mb-2";
  label.innerHTML =
    '<i class="fa-solid fa-circle-check text-blue-400 mr-1"></i> Nghệ sĩ';

  const name = document.createElement("h1");
  name.className = "text-4xl font-bold text-white";
  name.textContent = artistName;

  const listeners = document.createElement("p");
  listeners.className = "text-gray-400 mt-2";
  listeners.textContent = `${monthlyListeners.toLocaleString("vi-VN")} người nghe/tháng`;

  const description = document.createElement("p");
  description.className = "text-gray-300 mt-4";
  description.textContent = bio;

  info.append(label, name, listeners, description);
  wrapper.append(image, info);
  header.appendChild(wrapper);
}

// =========================
// Hiển thị danh sách bài hát
// =========================

function renderTracksSection(tracks = []) {
  const container = document.getElementById("artistTracks");

  if (!container) return;

  if (!Array.isArray(tracks) || tracks.length === 0) {
    container.innerHTML = `
      <p class="text-gray-400">Chưa có bài hát nào.</p>
    `;
    return;
  }

  container.replaceChildren();

  tracks.forEach((track) => {
    const trackId = track.id ?? track.track_id ?? track._id;

    const title = track.title || "Bài hát không tên";
    const albumName = track.album_name || "Đĩa đơn";
    const coverUrl = track.cover_image_url || "..`${import.meta.env.BASE_URL}playlist.png`";

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors w-full text-left";

    const image = document.createElement("img");
    image.src = coverUrl;
    image.alt = title;
    image.className = "w-14 h-14 object-cover rounded";
    image.onerror = () => {
      image.onerror = null;
      image.src = "..`${import.meta.env.BASE_URL}playlist.png`";
    };

    const info = document.createElement("div");
    info.className = "min-w-0";

    const titleElement = document.createElement("p");
    titleElement.className = "text-white font-semibold truncate";
    titleElement.textContent = title;

    const albumElement = document.createElement("p");
    albumElement.className = "text-gray-400 text-sm truncate";
    albumElement.textContent = albumName;

    info.append(titleElement, albumElement);
    button.append(image, info);

    button.addEventListener("click", () => {
      if (trackId == null || trackId === "") {
        console.error("Không tìm thấy ID bài hát:", track);
        return;
      }

      window.openTrack(String(trackId));
    });

    container.appendChild(button);
  });
}

// =========================
// Hiển thị danh sách album
// =========================

function renderAlbumsSection(albums = []) {
  const container = document.getElementById("artistAlbums");

  if (!container) return;

  if (!Array.isArray(albums) || albums.length === 0) {
    container.innerHTML = `
      <p class="text-gray-400">Chưa có album nào.</p>
    `;
    return;
  }

  container.replaceChildren();

  albums.forEach((album) => {
    const albumId = album.id ?? album.album_id ?? album._id;

    const title = album.title || "Album không tên";
    const coverUrl = album.cover_image_url || "..`${import.meta.env.BASE_URL}playlist.png`";
    const releaseYear = album.release_year ?? "";

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "block w-44 flex-shrink-0 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors text-left";

    const image = document.createElement("img");
    image.src = coverUrl;
    image.alt = title;
    image.className = "w-full aspect-square object-cover rounded mb-2";
    image.onerror = () => {
      image.onerror = null;
      image.src = "..`${import.meta.env.BASE_URL}playlist.png`";
    };

    const titleElement = document.createElement("p");
    titleElement.className = "text-white text-sm font-semibold truncate";
    titleElement.textContent = title;

    const yearElement = document.createElement("p");
    yearElement.className = "text-xs text-gray-400 truncate";
    yearElement.textContent = String(releaseYear);

    button.append(image, titleElement, yearElement);

    button.addEventListener("click", () => {
      if (albumId == null || albumId === "") {
        console.error("Không tìm thấy ID album:", album);
        return;
      }

      window.openDetail("album", String(albumId));
    });

    container.appendChild(button);
  });
}

// =========================
// Escape HTML
// =========================

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
