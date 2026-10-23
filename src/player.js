import { api } from "./app/router.js";

const audio = document.getElementById("audio");
const btnPlay = document.getElementById("btnPlay");
const btnNext = document.getElementById("btnNext");
const btnPrev = document.getElementById("btnPrev");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const volumeControl = document.getElementById("volumeControl");
const btnRepeat = document.getElementById("btnRepeat");
const btnShuffle = document.getElementById("btnShuffle");

let currentTrackIndex = 0;
let isRepeat = false;
let isShuffle = false;
let playlist = [];

// Play/Pause
btnPlay.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    audio.pause();
    btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
});

// Next/Previous
btnNext.addEventListener("click", () => playTrack(nextTrackIndex()));
btnPrev.addEventListener("click", () => playTrack(prevTrackIndex()));

// Cập nhật thanh tiến trình
audio.addEventListener("timeupdate", () => {
  if (!audio.duration || isNaN(audio.duration)) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = percent;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration);
  progressBar.style.background = `linear-gradient(to right, #1db954 ${percent}%, #4b5563 ${percent}%)`;
});

// Khi tua
progressBar.addEventListener("input", () => {
  if (!audio.duration || isNaN(audio.duration)) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// Volume control
volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value;
});

// Repeat/Shuffle
btnRepeat.addEventListener("click", () => {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle("text-green-500", isRepeat);
});

btnShuffle.addEventListener("click", () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("text-green-500", isShuffle);
});

// Khi bài hát kết thúc
audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    playTrack(nextTrackIndex());
  }
});

// Hàm phát bài hát
function playTrack(index) {
  currentTrackIndex = index;
  const track = playlist[index];
  if (!track || !track.audio_url) {
    console.warn("Không có audio URL cho bài này");
    return;
  }

  audio.src = track.audio_url;
  document.getElementById("trackImage").src = track.image_url;
  document.getElementById("trackTitle").textContent = track.title;
  document.getElementById("trackArtist").textContent = track.artist;

  audio.play().catch((err) => console.error("Không thể phát nhạc:", err));
  btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// Tính toán next/prev
function nextTrackIndex() {
  if (isShuffle) return Math.floor(Math.random() * playlist.length);
  return (currentTrackIndex + 1) % playlist.length;
}
function prevTrackIndex() {
  return (currentTrackIndex - 1 + playlist.length) % playlist.length;
}

// Format thời gian
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// === Load real data từ API ===
async function loadCurrentTrack() {
  try {
    const res = await api.get("/api/me/player/play"); // đúng endpoint
    const data = res.data;

    if (data && data.item) {
      const track = {
        id: data.item.id,
        title: data.item.name,
        artist: data.item.artists.map((a) => a.name).join(", "),
        image_url:
          data.item.album.images[0]?.url || "/src/assets/placeholder.png",
        audio_url: data.item.preview_url || data.item.audio_url || "",
      };

      playlist = [track];
      playTrack(0);
    } else {
      console.warn("Không có bài hát nào đang phát từ API");
    }
  } catch (err) {
    console.error("Lỗi load track:", err);
  }
}

// Khởi động Player
loadCurrentTrack();
