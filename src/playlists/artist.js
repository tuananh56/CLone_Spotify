import { api } from "../app/router.js";
import { initHeader, updateHeaderUI } from "../layout/header.js";
import { initSidebar } from "../layout/sidebar.js";
import { initLibrary } from "../layout/library.js";


// === Artist View ===
async function loadArtistView() {
  try {
    // Lấy id từ URL
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get("id");
    if (!artistId) {
      console.warn("Không tìm thấy ID nghệ sĩ trong URL");
      return;
    }

    // Gọi API lấy thông tin nghệ sĩ
    const artistRes = await api.get(`/api/artists/${artistId}`);
    const artist = artistRes.data;
    if (!artist || !artist.name) {
      console.warn("Dữ liệu nghệ sĩ không hợp lệ:", artist);
      return;
    }

    // Render thông tin nghệ sĩ
    renderArtistHeader(artist);

    // Gọi API lấy danh sách bài hát của nghệ sĩ
    const tracksRes = await api.get(`/api/artists/${artistId}/tracks`);
    renderTracksSection(tracksRes.data.tracks);

    // Gọi API lấy album của nghệ sĩ
    const albumsRes = await api.get(`/api/artists/${artistId}/albums`);
    renderAlbumsSection(albumsRes.data.albums);
  } catch (err) {
    console.error("Artist view fetch error:", err);
  }
}

function renderArtistHeader(artist) {
  const header = document.getElementById("artistHeader");
  if (!header) return;

  header.innerHTML = `
    <div class="flex items-center gap-6">
      <img src="${artist.image_url || "/src/assets/artist.png"}"
           class="w-48 h-48 object-cover rounded-full shadow-lg" />
      <div>
        <h1 class="text-4xl font-bold text-white">${artist.name}</h1>
        <p class="text-gray-400 mt-2">${artist.monthly_listeners?.toLocaleString() || 0} người nghe/tháng</p>
        <p class="text-gray-300 mt-4">${artist.bio || "Chưa có mô tả"}</p>
      </div>
    </div>
  `;
}

function renderTracksSection(tracks = []) {
  const container = document.getElementById("artistTracks");
  if (!container) return;

  if (!Array.isArray(tracks) || tracks.length === 0) {
    container.innerHTML = `<p class="text-gray-400">Chưa có bài hát nào</p>`;
    return;
  }

  container.innerHTML = tracks
    .map(
      (track) => `
      <div class="flex items-center gap-4 p-3 hover:bg-neutral-800 rounded-lg cursor-pointer"
           onclick="window.location.href='/track.html?id=${track.id}'">
        <img src="${track.cover_image_url || "/src/assets/playlist.png"}"
             class="w-14 h-14 object-cover rounded" />
        <div>
          <p class="text-white font-semibold">${track.title}</p>
          <p class="text-gray-400 text-sm">${track.album_name || ""}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderAlbumsSection(albums = []) {
  const container = document.getElementById("artistAlbums");
  if (!container) return;

  if (!Array.isArray(albums) || albums.length === 0) {
    container.innerHTML = `<p class="text-gray-400">Chưa có album nào</p>`;
    return;
  }

  container.innerHTML = albums
    .map(
      (album) => `
      <div class="w-44 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer"
           onclick="window.location.href='/album.html?id=${album.id}'">
        <img src="${album.cover_image_url || "/src/assets/playlist.png"}"
             class="w-full h-44 object-cover rounded mb-2" />
        <p class="text-white text-sm font-semibold truncate">${album.title}</p>
        <p class="text-xs text-gray-400 truncate">${album.release_year || ""}</p>
      </div>`
    )
    .join("");
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  updateHeaderUI();
  initSidebar();
  initLibrary();
  loadArtistView();
});
