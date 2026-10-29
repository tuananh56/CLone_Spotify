let audio = null;
let btnPlay = null;
let btnNext = null;
let btnPrev = null;
let progressBar = null;
let currentTimeEl = null;
let totalTimeEl = null;
let volumeControl = null;
let btnRepeat = null;
let btnShuffle = null;

let currentTrackIndex = 0;
let isRepeat = false;
let isShuffle = false;
let initialized = false;

window.playlist ??= [];

export function initPlayer() {
  audio = document.getElementById("audio");
  btnPlay = document.getElementById("btnPlay");
  btnNext = document.getElementById("btnNext");
  btnPrev = document.getElementById("btnPrev");
  progressBar = document.getElementById("progressBar");
  currentTimeEl = document.getElementById("currentTime");
  totalTimeEl = document.getElementById("totalTime");
  volumeControl = document.getElementById("volumeControl");
  btnRepeat = document.getElementById("btnRepeat");
  btnShuffle = document.getElementById("btnShuffle");

  if (!audio || !btnPlay) {
    console.error("Không tìm thấy audio hoặc nút Play trong player.html");
    return;
  }

  // Tránh đăng ký sự kiện nhiều lần
  if (initialized) return;
  initialized = true;

  btnPlay.addEventListener("click", togglePlay);
  btnNext?.addEventListener("click", () => {
    if (window.playlist.length) {
      playTrack(nextTrackIndex());
    }
  });
  btnPrev?.addEventListener("click", () => {
    if (window.playlist.length) {
      playTrack(prevTrackIndex());
    }
  });

  audio.addEventListener("play", updatePlayButton);
  audio.addEventListener("pause", updatePlayButton);

  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const percent = (audio.currentTime / audio.duration) * 100;

    if (progressBar) {
      progressBar.value = percent;
      progressBar.style.background = `linear-gradient(to right, #1ed760 ${percent}%, #535353 ${percent}%)`;
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
    if (totalTimeEl) {
      totalTimeEl.textContent = formatTime(audio.duration);
    }
  });

  progressBar?.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
    }
  });

  volumeControl?.addEventListener("input", () => {
    audio.volume = Number(volumeControl.value);
  });

  btnRepeat?.addEventListener("click", () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle("text-green-500", isRepeat);
  });

  btnShuffle?.addEventListener("click", () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle("text-green-500", isShuffle);
  });

  audio.addEventListener("ended", () => {
    if (!window.playlist.length) return;

    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    } else {
      playTrack(nextTrackIndex());
    }
  });

  // Khôi phục giao diện player theo bài hiện tại nếu có
  const track = window.playlist[currentTrackIndex];
  if (track) updatePlayerUI(track);
}

function togglePlay() {
  if (!audio) return;

  if (audio.paused) {
    audio.play().catch((err) => console.error("Không thể phát nhạc:", err));
  } else {
    audio.pause();
  }
}

function updatePlayButton() {
  if (!btnPlay || !audio) return;

  btnPlay.innerHTML = audio.paused
    ? '<i class="fa-solid fa-play"></i>'
    : '<i class="fa-solid fa-pause"></i>';
}

export function playTrack(index) {
  if (!audio) {
    console.error("Player chưa được khởi tạo. Hãy gọi initPlayer() trước.");
    return;
  }

  const playlist = window.playlist ?? [];
  const track = playlist[index];

  if (!track || !track.audio_url) {
    console.warn("Không có bài hát hoặc audio URL cho bài này");
    return;
  }

  currentTrackIndex = index;
  audio.src = track.audio_url;
  audio.load();

  updatePlayerUI(track);

  // Cập nhật thông tin trên trang chi tiết nếu các phần tử tồn tại
  setText("trackTitleHeader", track.title);
  setText("trackArtistHeader", track.artist);
  setText("trackAlbum", track.album);
  setText("trackDuration", formatTime(track.duration));

  const headerImage = document.getElementById("trackImageHeader");
  if (headerImage) {
    headerImage.src =
      track.image_url || `${import.meta.env.BASE_URL}playlist.png`;
  }

  audio
    .play()
    .then(updatePlayButton)
    .catch((err) => console.error("Không thể phát nhạc:", err));
}

function updatePlayerUI(track) {
  setText("trackTitlePlayer", track.title);
  setText("trackArtistPlayer", track.artist);

  const image = document.getElementById("trackImagePlayer");
  if (image) {
    image.src = track.image_url || `${import.meta.env.BASE_URL}playlist.png`;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "";
}

function nextTrackIndex() {
  const length = window.playlist?.length ?? 0;
  if (!length) return 0;

  if (isShuffle && length > 1) {
    let next;
    do {
      next = Math.floor(Math.random() * length);
    } while (next === currentTrackIndex);

    return next;
  }

  return (currentTrackIndex + 1) % length;
}

function prevTrackIndex() {
  const length = window.playlist?.length ?? 0;
  if (!length) return 0;

  return (currentTrackIndex - 1 + length) % length;
}

function formatTime(seconds) {
  const sec = Number(seconds);
  if (!Number.isFinite(sec) || sec < 0) return "0:00";

  const minutes = Math.floor(sec / 60);
  const remainder = Math.floor(sec % 60);

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
