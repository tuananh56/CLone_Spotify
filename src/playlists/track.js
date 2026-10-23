import { api } from "../app/router.js";

const params = new URLSearchParams(window.location.search);
const trackId = params.get("id");

if (trackId) {
  loadTrackDetail(trackId);
}

async function loadTrackDetail(id) {
  try {
    const res = await api.get(`/api/tracks/${id}`);
    const track = res.data;

    // Render thông tin chính
    document.querySelector("#trackImage").src =
      track.image_url || "/src/assets/placeholder.png";
    document.querySelector("#trackName").textContent = track.title;
    document.querySelector("#trackArtist").textContent = track.artist_name;
    document.querySelector("#trackAlbum").textContent = track.album_title;
    document.querySelector("#trackDuration").textContent = formatDuration(
      track.duration,
    );

    // Nút Play
    const playBtn = document.querySelector("#playBtn");
    playBtn.addEventListener("click", () => {
      const audio = new Audio(track.audio_url);
      audio.play();
      console.log(`Đang phát: ${track.title}`);
    });
  } catch (err) {
    console.error("Lỗi load track:", err);
  }
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
