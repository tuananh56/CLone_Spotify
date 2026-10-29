import{i as e,o as t}from"./header-Dh-pTS38.js";import"./main-DfyOE0N9.js";import{t as n}from"./player-B77JGl4t.js";var r=5,i=0,a=0,o=!1,s=[],c=``;function l(){let e=document.querySelector(`#allAlbumsList`);if(!e||e.dataset.initialized===`true`)return;e.dataset.initialized=`true`;let n=document.querySelector(`#btnReloadAlbums`),a=document.querySelector(`#btnGoHome`),s=document.querySelector(`#albumSearchInput`),l=document.querySelector(`#albumsPagination`);n?.addEventListener(`click`,()=>{u()}),a?.addEventListener(`click`,()=>{t(`home`)}),s?.addEventListener(`input`,e=>{c=e.target.value.trim().toLowerCase(),i=0,f()}),l?.addEventListener(`click`,t=>{let n=t.target.closest(`button[data-page]`);if(!n||n.disabled||o)return;let a=Number(n.dataset.page),s=d(),c=Math.ceil(s.length/r);!Number.isInteger(a)||a<0||a>=c||a===i||(i=a,f(),e.scrollIntoView({behavior:`smooth`,block:`start`}))}),e.addEventListener(`click`,n=>{let r=n.target.closest(`[data-album-id]`);if(!r||!e.contains(r))return;let i=r.dataset.albumId;i&&t(`album`,{id:i})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-album-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),u()}async function u(){let t=document.querySelector(`#allAlbumsList`),n=document.querySelector(`#albumCount`),r=document.querySelector(`#btnReloadAlbums`);if(!t||o)return;o=!0;let c=++a;n&&(n.textContent=`Đang tải danh sách album...`),r&&(r.disabled=!0,r.classList.add(`opacity-50`,`cursor-not-allowed`)),t.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách album...</p>
    </div>
  `,m();try{let t=await e.get(`/api/albums?limit=50&offset=0`);if(c!==a)return;let r=t.data,o=Array.isArray(r)?r:Array.isArray(r?.albums)?r.albums:Array.isArray(r?.data?.albums)?r.data.albums:Array.isArray(r?.data)?r.data:null;if(!o)throw console.error(`Response API album không hợp lệ:`,r),Error(`Không đọc được danh sách album từ API.`);s=o,i=0,f(),n&&(n.textContent=`Có ${s.length} album trong thư viện`)}catch(e){if(c!==a)return;console.error(`Lỗi tải danh sách album:`,e.response?.data||e.message||e),t.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách album.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;let r=document.querySelector(`#albumsPagination`);r&&(r.innerHTML=``),n&&(n.textContent=`Tải danh sách album thất bại`)}finally{c===a&&(o=!1,r&&(r.disabled=!1,r.classList.remove(`opacity-50`,`cursor-not-allowed`)),m())}}function d(){return s.filter(e=>{let t=e.title||e.name||e.album_title||``,n=e.artist_name||e.artist||e.artists||``;return`${t} ${Array.isArray(n)?n.map(e=>typeof e==`string`?e:e?.name||e?.artist_name||``).join(` `):typeof n==`object`&&n?n.name||n.artist_name||``:n}`.toLowerCase().includes(c)})}function f(){let e=d(),t=Math.ceil(e.length/r);t===0?i=0:i>=t&&(i=t-1);let n=i*r;p(e.slice(n,n+r)),m();let a=document.querySelector(`#albumCount`);a&&!o&&(a.textContent=c?`Tìm thấy ${e.length} album`:`Có ${s.length} album trong thư viện`)}function p(e){let t=document.querySelector(`#allAlbumsList`);t&&(t.innerHTML=e.length===0?`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-compact-disc text-3xl mb-3"></i>
        <p>
          ${c?`Không tìm thấy album phù hợp.`:`Không tìm thấy album nào.`}
        </p>
      </div>
    `:e.map(e=>{let t=e.id??e._id??e.album_id,n=e.title||e.name||e.album_title||`Chưa có tên album`,r=e.artist_name||e.artist||e.artists||``,i=Array.isArray(r)?r.map(e=>typeof e==`string`?e:e?.name||e?.artist_name||``).filter(Boolean).join(`, `):typeof r==`object`&&r?r.name||r.artist_name||`Nghệ sĩ`:r||`Nghệ sĩ`,a=e.cover_image_url||e.image_url||e.cover_url||e.thumbnail_url||`/CLone_Spotify/playlist.png`,o=e.release_date||``,s=h(t??``),c=h(n),l=h(i),u=h(a),d=h(o),f=t!=null&&t!==``;return`
        <article
          ${f?`data-album-id="${s}" role="link" tabindex="0"`:`aria-disabled="true"`}
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${f?`cursor-pointer`:`cursor-default`}"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-neutral-800 shadow-lg">
            <img
              src="${u}"
              alt="${c}"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png';"
            />

            ${f?`
                  <div
                    class="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-green-500 text-lg text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                `:``}
          </div>

          <h2
            class="mb-1 truncate text-sm font-semibold text-white"
            title="${c}"
          >
            ${c}
          </h2>

          <p
            class="truncate text-sm text-neutral-400"
            title="${l}"
          >
            ${l}
          </p>

          ${d?`
                <p class="mt-1 truncate text-xs text-neutral-500">
                  ${d}
                </p>
              `:``}
        </article>
      `}).join(``))}function m(){let e=document.querySelector(`#albumsPagination`);if(!e)return;let t=Math.ceil(d().length/r);if(t<=1){e.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${i-1}"
        ${i===0||o?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>`
            <button
              type="button"
              data-page="${e}"
              ${o?`disabled`:``}
              aria-current="${e===i?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${e===i?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `).join(``)}

      <button
        type="button"
        data-page="${i+1}"
        ${i>=t-1||o?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function h(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function g(){try{let e=document.getElementById(`player-container`);if(e&&e.dataset.loaded!==`true`){let t=await fetch(`/CLone_Spotify/player.html`);if(!t.ok)throw Error(`Không tải được player.html`);e.innerHTML=await t.text(),e.dataset.loaded=`true`,n(),document.dispatchEvent(new Event(`playerloaded`))}}catch(e){console.error(`Lỗi tải player:`,e)}await l()}g();