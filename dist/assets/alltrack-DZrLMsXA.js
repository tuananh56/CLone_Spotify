import{i as e}from"./header-Dh-pTS38.js";import"./main-BZjr6fch.js";import{n as t,t as n}from"./player-B77JGl4t.js";var r=0,i=!1,a=[],o=``;async function s(){if(!document.getElementById(`allTracksList`)){console.error(`Không tìm thấy phần tử #allTracksList`);return}d(),f();let t=++r;try{let n=await e.get(`/api/tracks?offset=0&limit=40`);if(t!==r)return;let i=n.data,o=c(i);if(!o)throw console.error(`Cấu trúc dữ liệu API không hợp lệ:`,i),Error(`Không đọc được danh sách bài hát từ API.`);let s=o.map(l);console.table(s.map(({id:e,title:t})=>({id:e,title:t}))),a=s,window.playlist=s,y=1,p(u()),x(),b()}catch(e){if(t!==r)return;console.error(`Lỗi tải danh sách bài hát:`,e.response?.data||e.message||e),m(e)}}function c(e){if(Array.isArray(e))return e;let t=[e?.tracks,e?.tracks?.items,e?.items,e?.data,e?.data?.tracks,e?.data?.items,e?.results];for(let e of t){if(Array.isArray(e))return e;if(Array.isArray(e?.items))return e.items}return null}function l(e){let t=e.artist_name??e.artist?.name??(typeof e.artist==`string`?e.artist:null)??e.artists?.map(e=>e.name).filter(Boolean).join(`, `)??`Chưa rõ nghệ sĩ`,n=e.album_title??e.album?.title??e.album?.name??(typeof e.album==`string`?e.album:null)??`Chưa rõ album`;return{id:String(e.id??e._id??``),title:e.title??e.name??`Chưa có tên`,artist:t,album:n,duration:e.duration??e.duration_seconds??0,image_url:e.image_url??e.cover_image_url??e.album?.image_url??e.album?.cover_image_url??e.album?.image??`/CLone_Spotify/playlist.png`,audio_url:e.audio_url??e.audioUrl??e.preview_url??e.url??``}}function u(){return a.filter(e=>[e.title,e.artist,e.album].join(` `).toLowerCase().includes(o))}function d(){if(i)return;let e=document.getElementById(`allTracksList`);e&&(i=!0,document.getElementById(`btnReloadTracks`)?.addEventListener(`click`,s),document.getElementById(`btnRetryTracks`)?.addEventListener(`click`,s),document.getElementById(`trackSearchInput`)?.addEventListener(`input`,e=>{o=e.target.value.trim().toLowerCase(),y=1,p(u()),b()}),document.getElementById(`btnPlayAllTracks`)?.addEventListener(`click`,()=>{window.playlist?.length&&t(0)}),e.addEventListener(`click`,e=>{let n=e.target.closest(`.play-track-btn`);if(n){let e=Number(n.dataset.index);Number.isInteger(e)&&e>=0&&e<(window.playlist?.length??0)&&t(e);return}let r=e.target.closest(`.open-track-btn`);if(r){let e=r.dataset.id;if(console.log(`Bài hát được chọn:`,{id:e,title:r.textContent.trim()}),!e){console.error(`Bài hát này không có ID hợp lệ.`);return}let t=new URL(`track.html`,window.location.href);t.searchParams.set(`id`,e),window.location.href=t.href}}),document.getElementById(`btnGoHome`)?.addEventListener(`click`,()=>{window.location.href=`/CLone_Spotify/home.html`}))}function f(){let e=document.getElementById(`allTracksList`),t=document.getElementById(`trackCount`);e&&(e.innerHTML=`
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-spinner fa-spin mb-3 text-2xl"></i>
        <p>Đang tải danh sách bài hát...</p>
      </div>
    `),t&&(t.textContent=`Đang tải danh sách bài hát...`)}function p(e){let t=document.getElementById(`allTracksList`),n=document.getElementById(`trackCount`);t&&(t.innerHTML=e.length===0?`
    <div
      id="trackMessage"
      class="px-4 py-10 text-center text-neutral-400"
    >
      <i class="fa-solid fa-music mb-3 text-2xl"></i>
      <p>
        ${o?`Không tìm thấy bài hát phù hợp.`:`Chưa có bài hát nào.`}
      </p>
    </div>
  `:e.map(e=>{let t=a.indexOf(e);return`
      <div
        class="track-row group grid grid-cols-[40px_minmax(0,1fr)_100px] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 md:grid-cols-[40px_minmax(0,1fr)_minmax(100px,0.7fr)_100px]"
      >
        <div class="flex items-center justify-center">
          <span class="track-number group-hover:hidden">
            ${t+1}
          </span>

          <button
            type="button"
            class="play-track-btn hidden text-white group-hover:block"
            data-index="${t}"
            aria-label="Phát ${g(e.title)}"
            title="Phát bài hát"
          >
            <i class="fa-solid fa-play"></i>
          </button>
        </div>

        <div class="flex min-w-0 items-center gap-3">
          <img
            src="${g(e.image_url)}"
            alt=""
            class="h-10 w-10 shrink-0 rounded object-cover"
            onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png'"
          />

          <button
            type="button"
            class="open-track-btn min-w-0 text-left"
            data-id="${g(e.id)}"
            title="Xem chi tiết bài hát"
          >
            <span class="block truncate font-medium text-white hover:underline">
              ${g(e.title)}
            </span>
            <span class="block truncate text-xs text-neutral-400">
              ${g(e.artist)}
            </span>
          </button>
        </div>

        <span class="hidden truncate md:block">
          ${g(e.album)}
        </span>

        <span class="text-right tabular-nums">
          ${_(e.duration)}
        </span>
      </div>
    `}).join(``),n&&(n.textContent=o?`Tìm thấy ${e.length} bài hát`:`${e.length} bài hát`))}function m(e){let t=document.getElementById(`allTracksList`),n=document.getElementById(`trackCount`);t&&(t.innerHTML=`
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-circle-exclamation mb-3 text-2xl"></i>
        <p class="mb-2">Không thể tải danh sách bài hát.</p>
        <p class="mb-4 text-sm">
          ${g(h(e))}
        </p>
        <button
          type="button"
          id="btnRetryTracks"
          class="rounded-full bg-white px-4 py-2 font-semibold text-black hover:scale-105"
        >
          Thử lại
        </button>
      </div>
    `,t.querySelector(`#btnRetryTracks`)?.addEventListener(`click`,s)),n&&(n.textContent=`Không tải được bài hát`)}function h(e){return e.response?`Máy chủ trả về lỗi ${e.response.status}.`:e.request?`Không nhận được phản hồi từ máy chủ. Hãy kiểm tra kết nối mạng.`:e.message||`Đã xảy ra lỗi không xác định.`}function g(e=``){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function _(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}var v=10,y=1;function b(){let e=document.getElementById(`allTracksList`),t=document.getElementById(`tracksPagination`);if(!e||!t)return;let n=Array.from(e.querySelectorAll(`.track-row`)),r=n.length,i=Math.ceil(r/v);if(i<=1){n.forEach(e=>{e.classList.remove(`hidden`)}),t.innerHTML=``;return}y=Math.min(Math.max(y,1),i);let a=(y-1)*v,o=a+v;n.forEach((e,t)=>{e.classList.toggle(`hidden`,t<a||t>=o)}),t.innerHTML=`
    <button
      type="button"
      data-page="${y-1}"
      ${y===1?`disabled`:``}
      class="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    ${Array.from({length:i},(e,t)=>{let n=t+1,r=n===y;return`
        <button
          type="button"
          data-page="${n}"
          aria-current="${r?`page`:`false`}"
          class="w-10 h-10 rounded-full font-semibold transition
                 ${r?`bg-green-500 text-black`:`bg-neutral-800 hover:bg-neutral-700 text-white`}"
        >
          ${n}
        </button>
      `}).join(``)}

    <button
      type="button"
      data-page="${y+1}"
      ${y===i?`disabled`:``}
      class="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}function x(){let e=document.getElementById(`tracksPagination`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-page]`);t&&!t.disabled&&(y=Number(t.dataset.page),b(),document.getElementById(`mainContent`)?.scrollTo({top:0,behavior:`smooth`}))}))}async function S(){try{let e=await fetch(`/CLone_Spotify/player.html`);if(!e.ok)throw Error(`Không tải được player.html`);let t=await e.text();document.getElementById(`player-container`).innerHTML=t,n(),document.dispatchEvent(new Event(`playerloaded`))}catch(e){console.error(`Lỗi tải player:`,e)}await s()}S();