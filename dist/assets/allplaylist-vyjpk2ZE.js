import{i as e,o as t}from"./header-Dh-pTS38.js";import"./main-DfyOE0N9.js";import{t as n}from"./player-B77JGl4t.js";var r=12,i=20,a=[],o=0,s=``,c=!1,l=!1,u=0,d=`/CLone_Spotify/playlist.png`;function f(){let e=document.querySelector(`#allPlaylistsList`);if(!e||l)return;l=!0;let n=document.querySelector(`#playlistSearchInput`),i=document.querySelector(`#btnReloadPlaylists`),a=document.querySelector(`#btnGoHome`),u=document.querySelector(`#playlistsPagination`);n?.addEventListener(`input`,e=>{s=e.target.value.trim().toLowerCase(),o=0,h()}),i?.addEventListener(`click`,()=>{p()}),a?.addEventListener(`click`,()=>{t(`home`)}),u?.addEventListener(`click`,t=>{let n=t.target.closest(`button[data-page]`);if(!n||n.disabled||c)return;let i=Number(n.dataset.page),a=m(),s=Math.ceil(a.length/r);!Number.isInteger(i)||i<0||i>=s||i===o||(o=i,h(),e.scrollIntoView({behavior:`smooth`,block:`start`}))}),e.addEventListener(`click`,n=>{let r=n.target.closest(`[data-playlist-id]`);if(!r||!e.contains(r))return;let i=r.dataset.playlistId;i&&t(`playlist`,{id:i})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-playlist-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),p()}async function p(){let t=document.querySelector(`#allPlaylistsList`),n=document.querySelector(`#playlistCount`),r=document.querySelector(`#btnReloadPlaylists`);if(!t||c)return;c=!0;let s=++u;n&&(n.textContent=`Đang tải danh sách playlist...`),r&&(r.disabled=!0,r.classList.add(`opacity-50`,`cursor-not-allowed`)),t.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách playlist...</p>
    </div>
  `;try{let t=await e.get(`/api/playlists?limit=${i}&offset=0`);if(s!==u)return;let r=t.data,c=Array.isArray(r)?r:Array.isArray(r?.playlists)?r.playlists:Array.isArray(r?.data?.playlists)?r.data.playlists:Array.isArray(r?.data)?r.data:null;if(!c)throw console.error(`Response API playlist không hợp lệ:`,r),Error(`Không đọc được danh sách playlist từ API.`);a=c,o=0,h(),n&&(n.textContent=`Có ${a.length} playlist trong thư viện`),console.log(`Đã tải playlist:`,a.length)}catch(e){if(s!==u)return;console.error(`Lỗi tải danh sách playlist:`,e.response?.data||e.message||e),t.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách playlist.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;let r=document.querySelector(`#playlistsPagination`);r&&(r.innerHTML=``),n&&(n.textContent=`Tải danh sách playlist thất bại`)}finally{s===u&&(c=!1,r&&(r.disabled=!1,r.classList.remove(`opacity-50`,`cursor-not-allowed`)),_())}}function m(){return s?a.filter(e=>`${e.name||e.title||``} ${e.description||``} ${e.owner?.name||e.owner?.username||e.username||``}`.toLowerCase().includes(s)):a}function h(){let e=m(),t=Math.ceil(e.length/r);t===0?o=0:o>=t&&(o=t-1);let n=o*r;g(e.slice(n,n+r)),_();let i=document.querySelector(`#playlistCount`);i&&!c&&(i.textContent=s?`Tìm thấy ${e.length} playlist`:`Có ${a.length} playlist trong thư viện`)}function g(e){let t=document.querySelector(`#allPlaylistsList`);t&&(t.innerHTML=e.length===0?`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-music text-3xl mb-3"></i>
        <p>
          ${s?`Không tìm thấy playlist phù hợp.`:`Chưa có playlist nào.`}
        </p>
      </div>
    `:e.map(e=>{let t=e.id??e._id??e.playlist_id,n=e.name||e.title||`Playlist chưa có tên`,r=e.description||e.owner?.name||e.username||`Playlist`,i=e.image_url||e.cover_image_url||e.cover_url||e.thumbnail_url||e.imageUrl||e.image||e.cover?.url||e.images?.[0]?.url||e.images?.[0]||d,a=v(t??``),o=v(n),s=v(r),c=v(i),l=t!=null&&t!==``;return`
        <article
          ${l?`data-playlist-id="${a}" role="link" tabindex="0"`:`aria-disabled="true"`}
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${l?`cursor-pointer`:`cursor-default`}"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-md bg-neutral-800 shadow-lg">
            <img
              src="${c}"
              alt="${o}"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='${d}';"
            />

            <div
              class="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-green-500 text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"
              aria-hidden="true"
            >
              <i class="fa-solid fa-play"></i>
            </div>
          </div>

          <h2
            class="mb-1 truncate text-sm font-semibold text-white"
            title="${o}"
          >
            ${o}
          </h2>

          <p
            class="truncate text-sm text-neutral-400"
            title="${s}"
          >
            ${s}
          </p>
        </article>
      `}).join(``))}function _(){let e=document.querySelector(`#playlistsPagination`);if(!e)return;let t=Math.ceil(m().length/r);if(t<=1){e.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${o-1}"
        ${o===0||c?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>`
            <button
              type="button"
              data-page="${e}"
              ${c?`disabled`:``}
              aria-current="${e===o?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${e===o?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `).join(``)}

      <button
        type="button"
        data-page="${o+1}"
        ${o>=t-1||c?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function v(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function y(){try{let e=await fetch(`/CLone_Spotify/player.html`);if(!e.ok)throw Error(`Không tải được player.html`);let t=await e.text(),r=document.getElementById(`player-container`);if(!r)throw Error(`Không tìm thấy #player-container`);r.innerHTML=t,n(),document.dispatchEvent(new Event(`playerloaded`))}catch(e){console.error(`Lỗi tải player:`,e)}}f(),y(),document.querySelector(`#clearPlaylistSearchBtn`)?.addEventListener(`click`,()=>{let e=document.querySelector(`#playlistSearchInput`);e&&(e.value=``,e.dispatchEvent(new Event(`input`,{bubbles:!0})),e.focus())});