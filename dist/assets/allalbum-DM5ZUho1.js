import{i as e,o as t}from"./header-Dh-pTS38.js";import"./main-BdqjAeM5.js";import{t as n}from"./player-B77JGl4t.js";var r=5,i=7,a=0,o=0,s=!1,c=!1,l=[],u=``,d=null;function f(){let e=document.querySelector(`#allAlbumsList`);if(!e)return;if(e.dataset.initialized===`true`){m();return}e.dataset.initialized=`true`;let n=document.querySelector(`#btnReloadAlbums`),i=document.querySelector(`#btnGoHome`),o=document.querySelector(`#albumSearchInput`),s=document.querySelector(`#albumsPagination`);n?.addEventListener(`click`,()=>{p(a)}),i?.addEventListener(`click`,()=>{t(`home`)}),o?.addEventListener(`input`,e=>{u=e.target.value.trim().toLowerCase(),m()}),e.addEventListener(`click`,n=>{let r=n.target.closest(`[data-album-id]`);if(!r||!e.contains(r))return;let i=r.dataset.albumId;i&&t(`album`,{id:i})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-album-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),s?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-page]`);if(!t||t.disabled||c)return;let n=Number(t.dataset.page);!Number.isInteger(n)||n<0||n===a||d===null&&n>a+1||d!==null&&n>=Math.ceil(d/r)||n<Math.ceil(d/r)&&p(n)}),p(0)}async function p(t=0){let n=document.querySelector(`#allAlbumsList`),u=document.querySelector(`#albumCount`),f=document.querySelector(`#btnReloadAlbums`);if(!n||c)return;c=!0;let p=++o,h=t*r;u&&(u.textContent=`Đang tải danh sách album...`),f&&(f.disabled=!0,f.classList.add(`opacity-50`,`cursor-not-allowed`)),g(),n.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách album...</p>
    </div>
  `;try{let n=await e.get(`/api/albums?offset=${h}&limit=${r}`);if(p!==o)return;let c=n.data,f=Array.isArray(c)?c:Array.isArray(c?.albums)?c.albums:Array.isArray(c?.data)?c.data:Array.isArray(c?.data?.albums)?c.data.albums:null;if(!f)throw Error(`Không đọc được danh sách album từ API.`);l=f,a=t,c?.total??c?.totalCount??c?.pagination?.total??c?.data?.total??c?.data?.totalCount,d=i,s=(a+1)*r<i,m(),u&&(u.textContent=d===null?`Trang ${a+1} • ${f.length} album`:`Có ${d} album trong thư viện`)}catch(e){if(p!==o)return;console.error(`Lỗi tải danh sách album:`,e.response?.data||e.message||e),n.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách album.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `,s=!1,u&&(u.textContent=`Tải danh sách album thất bại`)}finally{p===o&&(c=!1,f&&(f.disabled=!1,f.classList.remove(`opacity-50`,`cursor-not-allowed`)),g())}}function m(){h(l.filter(e=>`${e.title||e.name||``} ${e.artist_name||e.artist?.name||(typeof e.artist==`string`?e.artist:``)||(Array.isArray(e.artists)?e.artists.map(e=>e.name).filter(Boolean).join(` `):``)}`.toLowerCase().includes(u)))}function h(e){let t=document.querySelector(`#allAlbumsList`);t&&(t.innerHTML=e.length?e.map(e=>{let t=e.id??e._id,n=e.title||e.name||`Chưa có tên album`,r=e.artist_name||e.artist?.name||(typeof e.artist==`string`?e.artist:``)||(Array.isArray(e.artists)?e.artists.map(e=>e.name).filter(Boolean).join(`, `):``)||`Chưa rõ nghệ sĩ`,i=e.cover_image_url||e.image_url||e.cover_url||`./src/assets/placeholder.png`,a=e.release_date?String(e.release_date).slice(0,4):``,o=_(t??``),s=_(n),c=_(r),l=_(i);return`
        <article
          data-album-id="${o}"
          class="group min-w-0 rounded-lg bg-neutral-900 hover:bg-neutral-800 p-3 cursor-pointer transition"
          ${t==null?`aria-disabled="true"`:`role="link" tabindex="0"`}
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-md bg-neutral-800 shadow-lg">
            <img
              src="${l}"
              alt="${s}"
              loading="lazy"
              class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='./src/assets/placeholder.png';"
            />

            <div
              class="absolute right-2 bottom-2 flex justify-center items-center bg-green-500 rounded-full w-12 h-12 text-black text-lg opacity-0 shadow-xl translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
              aria-hidden="true"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
          </div>

          <h2
            class="mb-1 font-semibold text-white text-sm truncate"
            title="${s}"
          >
            ${s}
          </h2>

          <p
            class="text-neutral-400 text-sm truncate"
            title="${c}"
          >
            ${c}
          </p>

          ${a?`<p class="mt-1 text-neutral-500 text-xs">${_(a)}</p>`:``}
        </article>
      `}).join(``):`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-compact-disc text-3xl mb-3"></i>
        <p>
          ${u?`Không tìm thấy album phù hợp trong trang hiện tại.`:`Không tìm thấy album nào.`}
        </p>
      </div>
    `)}function g(){let e=document.querySelector(`#albumsPagination`);if(!e)return;let t=d===null?a+(s?2:1):Math.ceil(d/r);if(t<=1){e.innerHTML=``;return}let n=[];if(d!==null)for(let e=0;e<t;e++)n.push(e);else a>0&&n.push(a-1),n.push(a),s&&n.push(a+1);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${a-1}"
        ${a===0||c?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>{let t=e===a;return`
            <button
              type="button"
              data-page="${e}"
              ${c?`disabled`:``}
              aria-current="${t?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${t?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `}).join(``)}

      <button
        type="button"
        data-page="${a+1}"
        ${!s||c?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function _(e){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function v(){try{let e=document.getElementById(`player-container`);if(e&&e.dataset.loaded!==`true`){let t=await fetch(`/CLone_Spotify/player.html`);if(!t.ok)throw Error(`Không tải được player.html`);e.innerHTML=await t.text(),e.dataset.loaded=`true`,n(),document.dispatchEvent(new Event(`playerloaded`))}}catch(e){console.error(`Lỗi tải player:`,e)}await f()}v();