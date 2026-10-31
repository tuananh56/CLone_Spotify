import{n as e,r as t,t as n}from"./api-C91Bgm76.js";var r=`/CLone_Spotify/`,i={home:`${r}home.html`,track:`${r}track.html`,playlist:`${r}playlist.html`,artist:`${r}artist.html`,album:`${r}album.html`,allalbum:`${r}allalbum.html`,alltrack:`${r}alltrack.html`,allartist:`${r}allartist.html`,allplaylist:`${r}allplaylist.html`,search:`${r}search.html`,login:`${r}login.html`,register:`${r}register.html`,admin_dashboard:`${r}admin-dashboard.html`,track_admin:`${r}track_admin.html`,artist_admin:`${r}artist_admin.html`},a=0;function o(e){let t=e.replace(/\/+$/,``);for(let[e,n]of Object.entries(i))if(t===new URL(n,window.location.origin).pathname.replace(/\/+$/,``))return e;return`home`}function s(){return Object.fromEntries(new URLSearchParams(window.location.search))}function c(e,t={}){let n=new URL(i[e],window.location.origin);return Object.entries(t).forEach(([e,t])=>{t!=null&&n.searchParams.set(e,String(t))}),n}async function l(e,t={}){if(!i[e]){console.error(`Không tìm thấy trang: ${e}`);return}let n=c(e,t);e===`login`||e===`register`?window.location.href=n.href:await u(e,t,n)&&history.pushState({page:e,params:t},``,n.pathname+n.search)}async function u(e,t={},n=null){let r=i[e];if(!r)return!1;let o=++a;try{let i=await fetch(r);if(!i.ok)throw Error(`Không tải được trang: ${r}`);let s=await i.text(),c=new DOMParser().parseFromString(s,`text/html`).querySelector(`#page-content`),l=document.querySelector(`#page-content`);if(!c||!l)throw Error(`Không tìm thấy #page-content trong trang hiện tại hoặc trang đích.`);return o===a&&(l.replaceWith(c.cloneNode(!0)),document.dispatchEvent(new CustomEvent(`pagechanged`,{detail:{page:e,params:t,url:n?.href??window.location.href}})),!0)}catch(e){return o===a&&console.error(`Lỗi chuyển trang:`,e),!1}}window.addEventListener(`popstate`,async e=>{await u(e.state?.page||o(window.location.pathname),e.state?.params||s())}),window.navigate=l,window.goHome=()=>{l(`home`)};var d=5,f=0,p=0,m=!1,h=[],g=``;function ee(){let e=document.querySelector(`#allAlbumsList`);if(!e||e.dataset.initialized===`true`)return;e.dataset.initialized=`true`;let t=document.querySelector(`#btnReloadAlbums`),n=document.querySelector(`#btnGoHome`),r=document.querySelector(`#albumSearchInput`),i=document.querySelector(`#albumsPagination`);t?.addEventListener(`click`,()=>{te()}),n?.addEventListener(`click`,()=>{l(`home`)}),r?.addEventListener(`input`,e=>{g=e.target.value.trim().toLowerCase(),f=0,re()}),i?.addEventListener(`click`,t=>{let n=t.target.closest(`button[data-page]`);if(!n||n.disabled||m)return;let r=Number(n.dataset.page),i=ne(),a=Math.ceil(i.length/d);!Number.isInteger(r)||r<0||r>=a||r===f||(f=r,re(),e.scrollIntoView({behavior:`smooth`,block:`start`}))}),e.addEventListener(`click`,t=>{let n=t.target.closest(`[data-album-id]`);if(!n||!e.contains(n))return;let r=n.dataset.albumId;r&&l(`album`,{id:r})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-album-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),te()}async function te(){let e=document.querySelector(`#allAlbumsList`),t=document.querySelector(`#albumCount`),r=document.querySelector(`#btnReloadAlbums`);if(!e)return;m=!0;let i=++p;t&&(t.textContent=`Đang tải danh sách album...`),r&&(r.disabled=!0,r.classList.add(`opacity-50`,`cursor-not-allowed`)),e.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách album...</p>
    </div>
  `,ae();try{let e=await n.get(`/api/albums?limit=50&offset=0`);if(i!==p)return;let r=e.data,a=Array.isArray(r)?r:Array.isArray(r?.albums)?r.albums:Array.isArray(r?.data?.albums)?r.data.albums:Array.isArray(r?.data)?r.data:null;if(!a)throw console.error(`Response API album không hợp lệ:`,r),Error(`Không đọc được danh sách album từ API.`);h=a,f=0,re(),t&&(t.textContent=`Có ${h.length} album trong thư viện`)}catch(n){if(i!==p)return;console.error(`Lỗi tải danh sách album:`,n.response?.data||n.message||n),e.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách album.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;let r=document.querySelector(`#albumsPagination`);r&&(r.innerHTML=``),t&&(t.textContent=`Tải danh sách album thất bại`)}finally{i===p&&(m=!1,r&&(r.disabled=!1,r.classList.remove(`opacity-50`,`cursor-not-allowed`)),ae())}}function ne(){return h.filter(e=>{let t=e.title||e.name||e.album_title||``,n=e.artist_name||e.artist||e.artists||``;return`${t} ${Array.isArray(n)?n.map(e=>typeof e==`string`?e:e?.name||e?.artist_name||``).join(` `):typeof n==`object`&&n?n.name||n.artist_name||``:n}`.toLowerCase().includes(g)})}function re(){let e=ne(),t=Math.ceil(e.length/d);t===0?f=0:f>=t&&(f=t-1);let n=f*d;ie(e.slice(n,n+d)),ae();let r=document.querySelector(`#albumCount`);r&&!m&&(r.textContent=g?`Tìm thấy ${e.length} album`:`Có ${h.length} album trong thư viện`)}function ie(e){let t=document.querySelector(`#allAlbumsList`);t&&(t.innerHTML=e.length===0?`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-compact-disc text-3xl mb-3"></i>
        <p>
          ${g?`Không tìm thấy album phù hợp.`:`Không tìm thấy album nào.`}
        </p>
      </div>
    `:e.map(e=>{let t=e.id??e._id??e.album_id,n=e.title||e.name||e.album_title||`Chưa có tên album`,r=e.artist_name||e.artist||e.artists||``,i=Array.isArray(r)?r.map(e=>typeof e==`string`?e:e?.name||e?.artist_name||``).filter(Boolean).join(`, `):typeof r==`object`&&r?r.name||r.artist_name||`Nghệ sĩ`:r||`Nghệ sĩ`,a=e.cover_image_url||e.image_url||e.cover_url||e.thumbnail_url||`/CLone_Spotify/playlist.png`,o=e.release_date||``,s=_(t??``),c=_(n),l=_(i),u=_(a),d=_(o),f=t!=null&&t!==``;return`
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
      `}).join(``))}function ae(){let e=document.querySelector(`#albumsPagination`);if(!e)return;let t=Math.ceil(ne().length/d);if(t<=1){e.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${f-1}"
        ${f===0||m?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>`
            <button
              type="button"
              data-page="${e}"
              ${m?`disabled`:``}
              aria-current="${e===f?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${e===f?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `).join(``)}

      <button
        type="button"
        data-page="${f+1}"
        ${f>=t-1||m?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function _(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var v=5,y=0,oe=0,b=!1,se=[],x=``;function ce(){let e=document.querySelector(`#allArtistsList`);if(!e||e.dataset.initialized===`true`)return;e.dataset.initialized=`true`;let t=document.querySelector(`#btnReloadArtists`),n=document.querySelector(`#btnGoHome`),r=document.querySelector(`#artistSearchInput`),i=document.querySelector(`#artistsPagination`);t?.addEventListener(`click`,()=>{le()}),n?.addEventListener(`click`,()=>{l(`home`)}),r?.addEventListener(`input`,e=>{x=e.target.value.trim().toLowerCase(),y=0,de()}),i?.addEventListener(`click`,t=>{let n=t.target.closest(`button[data-page]`);if(!n||n.disabled||b)return;let r=Number(n.dataset.page),i=ue(),a=Math.ceil(i.length/v);!Number.isInteger(r)||r<0||r>=a||r===y||(y=r,de(),e.scrollIntoView({behavior:`smooth`,block:`start`}))}),e.addEventListener(`click`,t=>{let n=t.target.closest(`[data-artist-id]`);if(!n||!e.contains(n))return;let r=n.dataset.artistId;r&&l(`artist`,{id:r})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-artist-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),le()}async function le(){let e=document.querySelector(`#allArtistsList`),t=document.querySelector(`#artistCount`),r=document.querySelector(`#btnReloadArtists`);if(!e||b)return;b=!0;let i=++oe;t&&(t.textContent=`Đang tải danh sách nghệ sĩ...`),r&&(r.disabled=!0,r.classList.add(`opacity-50`,`cursor-not-allowed`)),e.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách nghệ sĩ...</p>
    </div>
  `,pe();try{let e=await n.get(`/api/artists?limit=50&offset=0`);if(i!==oe)return;let r=e.data,a=Array.isArray(r)?r:Array.isArray(r?.artists)?r.artists:Array.isArray(r?.data?.artists)?r.data.artists:Array.isArray(r?.data)?r.data:null;if(!a)throw console.error(`Response API nghệ sĩ không hợp lệ:`,r),Error(`Không đọc được danh sách nghệ sĩ từ API.`);se=a,y=0,de(),t&&(t.textContent=`Có ${se.length} nghệ sĩ trong thư viện`)}catch(n){if(i!==oe)return;console.error(`Lỗi tải danh sách nghệ sĩ:`,n.response?.data||n.message||n),e.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách nghệ sĩ.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;let r=document.querySelector(`#artistsPagination`);r&&(r.innerHTML=``),t&&(t.textContent=`Tải danh sách nghệ sĩ thất bại`)}finally{i===oe&&(b=!1,r&&(r.disabled=!1,r.classList.remove(`opacity-50`,`cursor-not-allowed`)),pe())}}function ue(){return se.filter(e=>{let t=e.name||e.artist_name||e.title||``;return String(t).toLowerCase().includes(x)})}function de(){let e=ue(),t=Math.ceil(e.length/v);t===0?y=0:y>=t&&(y=t-1);let n=y*v;fe(e.slice(n,n+v)),pe();let r=document.querySelector(`#artistCount`);r&&!b&&(r.textContent=x?`Tìm thấy ${e.length} nghệ sĩ`:`Có ${se.length} nghệ sĩ trong thư viện`)}function fe(e){let t=document.querySelector(`#allArtistsList`);t&&(t.innerHTML=e.length===0?`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-users text-3xl mb-3"></i>
        <p>
          ${x?`Không tìm thấy nghệ sĩ phù hợp.`:`Không tìm thấy nghệ sĩ nào.`}
        </p>
      </div>
    `:e.map(e=>{let t=e.id??e._id??e.artist_id,n=e.name||e.artist_name||e.title||`Chưa có tên nghệ sĩ`,r=e.image_url||e.avatar_url||e.profile_image_url||e.picture_url||`/CLone_Spotify/playlist.png`,i=e.bio||e.description||e.genre||`Nghệ sĩ`,a=me(t??``),o=me(n),s=me(r),c=me(i),l=t!=null&&t!==``;return`
        <article
          ${l?`data-artist-id="${a}" role="link" tabindex="0"`:`aria-disabled="true"`}
          class="group min-w-0 rounded-lg bg-neutral-900 p-3 transition hover:bg-neutral-800 ${l?`cursor-pointer`:`cursor-default`}"
        >
          <div class="relative mb-3 aspect-square overflow-hidden rounded-full bg-neutral-800 shadow-lg">
            <img
              src="${s}"
              alt="${o}"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png';"
            />

            ${l?`
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
            title="${o}"
          >
            ${o}
          </h2>

          <p
            class="truncate text-sm text-neutral-400"
            title="${c}"
          >
            ${c}
          </p>
        </article>
      `}).join(``))}function pe(){let e=document.querySelector(`#artistsPagination`);if(!e)return;let t=Math.ceil(ue().length/v);if(t<=1){e.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${y-1}"
        ${y===0||b?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>`
            <button
              type="button"
              data-page="${e}"
              ${b?`disabled`:``}
              aria-current="${e===y?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${e===y?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `).join(``)}

      <button
        type="button"
        data-page="${y+1}"
        ${y>=t-1||b?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function me(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var S=12,he=20,C=[],w=0,T=``,E=!1,ge=!1,_e=0,ve=`/CLone_Spotify/playlist.png`;function ye(){let e=document.querySelector(`#allPlaylistsList`);if(!e||ge)return;ge=!0;let t=document.querySelector(`#playlistSearchInput`),n=document.querySelector(`#btnReloadPlaylists`),r=document.querySelector(`#btnGoHome`),i=document.querySelector(`#playlistsPagination`);t?.addEventListener(`input`,e=>{T=e.target.value.trim().toLowerCase(),w=0,Se()}),n?.addEventListener(`click`,()=>{be()}),r?.addEventListener(`click`,()=>{l(`home`)}),i?.addEventListener(`click`,t=>{let n=t.target.closest(`button[data-page]`);if(!n||n.disabled||E)return;let r=Number(n.dataset.page),i=xe(),a=Math.ceil(i.length/S);!Number.isInteger(r)||r<0||r>=a||r===w||(w=r,Se(),e.scrollIntoView({behavior:`smooth`,block:`start`}))}),e.addEventListener(`click`,t=>{let n=t.target.closest(`[data-playlist-id]`);if(!n||!e.contains(n))return;let r=n.dataset.playlistId;r&&l(`playlist`,{id:r})}),e.addEventListener(`keydown`,t=>{let n=t.target.closest(`[data-playlist-id][role='link']`);n&&e.contains(n)&&(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),n.click())}),be()}async function be(){let e=document.querySelector(`#allPlaylistsList`),t=document.querySelector(`#playlistCount`),r=document.querySelector(`#btnReloadPlaylists`);if(!e||E)return;E=!0;let i=++_e;t&&(t.textContent=`Đang tải danh sách playlist...`),r&&(r.disabled=!0,r.classList.add(`opacity-50`,`cursor-not-allowed`)),e.innerHTML=`
    <div class="col-span-full py-10 text-center text-neutral-400">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <p>Đang tải danh sách playlist...</p>
    </div>
  `;try{let e=await n.get(`/api/playlists?limit=${he}&offset=0`);if(i!==_e)return;let r=e.data,a=Array.isArray(r)?r:Array.isArray(r?.playlists)?r.playlists:Array.isArray(r?.data?.playlists)?r.data.playlists:Array.isArray(r?.data)?r.data:null;if(!a)throw console.error(`Response API playlist không hợp lệ:`,r),Error(`Không đọc được danh sách playlist từ API.`);C=a,w=0,Se(),t&&(t.textContent=`Có ${C.length} playlist trong thư viện`),console.log(`Đã tải playlist:`,C.length)}catch(n){if(i!==_e)return;console.error(`Lỗi tải danh sách playlist:`,n.response?.data||n.message||n),e.innerHTML=`
      <div class="col-span-full py-10 text-center text-red-400">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-3"></i>
        <p>Không thể tải danh sách playlist.</p>
        <p class="mt-2 text-sm text-neutral-400">
          Vui lòng kiểm tra kết nối và thử lại.
        </p>
      </div>
    `;let r=document.querySelector(`#playlistsPagination`);r&&(r.innerHTML=``),t&&(t.textContent=`Tải danh sách playlist thất bại`)}finally{i===_e&&(E=!1,r&&(r.disabled=!1,r.classList.remove(`opacity-50`,`cursor-not-allowed`)),we())}}function xe(){return T?C.filter(e=>`${e.name||e.title||``} ${e.description||``} ${e.owner?.name||e.owner?.username||e.username||``}`.toLowerCase().includes(T)):C}function Se(){let e=xe(),t=Math.ceil(e.length/S);t===0?w=0:w>=t&&(w=t-1);let n=w*S;Ce(e.slice(n,n+S)),we();let r=document.querySelector(`#playlistCount`);r&&!E&&(r.textContent=T?`Tìm thấy ${e.length} playlist`:`Có ${C.length} playlist trong thư viện`)}function Ce(e){let t=document.querySelector(`#allPlaylistsList`);t&&(t.innerHTML=e.length===0?`
      <div class="col-span-full py-10 text-center text-neutral-400">
        <i class="fa-solid fa-music text-3xl mb-3"></i>
        <p>
          ${T?`Không tìm thấy playlist phù hợp.`:`Chưa có playlist nào.`}
        </p>
      </div>
    `:e.map(e=>{let t=e.id??e._id??e.playlist_id,n=e.name||e.title||`Playlist chưa có tên`,r=e.description||e.owner?.name||e.username||`Playlist`,i=e.image_url||e.cover_image_url||e.cover_url||e.thumbnail_url||e.imageUrl||e.image||e.cover?.url||e.images?.[0]?.url||e.images?.[0]||ve,a=D(t??``),o=D(n),s=D(r),c=D(i),l=t!=null&&t!==``;return`
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
              onerror="this.onerror=null;this.src='${ve}';"
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
      `}).join(``))}function we(){let e=document.querySelector(`#playlistsPagination`);if(!e)return;let t=Math.ceil(xe().length/S);if(t<=1){e.innerHTML=``;return}let n=Array.from({length:t},(e,t)=>t);e.innerHTML=`
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        data-page="${w-1}"
        ${w===0||E?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${n.map(e=>`
            <button
              type="button"
              data-page="${e}"
              ${E?`disabled`:``}
              aria-current="${e===w?`page`:`false`}"
              class="h-10 min-w-10 rounded-full px-3 font-semibold transition ${e===w?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`} disabled:opacity-50"
            >
              ${e+1}
            </button>
          `).join(``)}

      <button
        type="button"
        data-page="${w+1}"
        ${w>=t-1||E?`disabled`:``}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-40"
        aria-label="Trang tiếp theo"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `}function D(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var O=null,k=null,Te=null,Ee=null,A=null,De=null,Oe=null,ke=null,Ae=null,je=null,j=0,Me=!1,Ne=!1,Pe=!1;window.playlist??=[];function Fe(){if(O=document.getElementById(`audio`),k=document.getElementById(`btnPlay`),Te=document.getElementById(`btnNext`),Ee=document.getElementById(`btnPrev`),A=document.getElementById(`progressBar`),De=document.getElementById(`currentTime`),Oe=document.getElementById(`totalTime`),ke=document.getElementById(`volumeControl`),Ae=document.getElementById(`btnRepeat`),je=document.getElementById(`btnShuffle`),!O||!k){console.error(`Không tìm thấy audio hoặc nút Play trong player.html`);return}if(Pe)return;Pe=!0,k.addEventListener(`click`,Ie),Te?.addEventListener(`click`,()=>{window.playlist.length&&M(ze())}),Ee?.addEventListener(`click`,()=>{window.playlist.length&&M(Be())}),O.addEventListener(`play`,Le),O.addEventListener(`pause`,Le),O.addEventListener(`timeupdate`,()=>{if(!Number.isFinite(O.duration)||O.duration<=0)return;let e=O.currentTime/O.duration*100;A&&(A.value=e,A.style.background=`linear-gradient(to right, #1ed760 ${e}%, #535353 ${e}%)`),De&&(De.textContent=Ve(O.currentTime)),Oe&&(Oe.textContent=Ve(O.duration))}),A?.addEventListener(`input`,()=>{Number.isFinite(O.duration)&&O.duration>0&&(O.currentTime=Number(A.value)/100*O.duration)}),ke?.addEventListener(`input`,()=>{O.volume=Number(ke.value)}),Ae?.addEventListener(`click`,()=>{Me=!Me,Ae.classList.toggle(`text-green-500`,Me)}),je?.addEventListener(`click`,()=>{Ne=!Ne,je.classList.toggle(`text-green-500`,Ne)}),O.addEventListener(`ended`,()=>{window.playlist.length&&(Me?(O.currentTime=0,O.play().catch(console.error)):M(ze()))});let e=window.playlist[j];e&&Re(e)}function Ie(){O&&(O.paused?O.play().catch(e=>console.error(`Không thể phát nhạc:`,e)):O.pause())}function Le(){k&&O&&(k.innerHTML=O.paused?`<i class="fa-solid fa-play"></i>`:`<i class="fa-solid fa-pause"></i>`)}function M(e){if(!O){console.error(`Player chưa được khởi tạo. Hãy gọi initPlayer() trước.`);return}let t=(window.playlist??[])[e];if(!t||!t.audio_url){console.warn(`Không có bài hát hoặc audio URL cho bài này`);return}j=e,O.src=t.audio_url,O.load(),Re(t),N(`trackTitleHeader`,t.title),N(`trackArtistHeader`,t.artist),N(`trackAlbum`,t.album),N(`trackDuration`,Ve(t.duration));let n=document.getElementById(`trackImageHeader`);n&&(n.src=t.image_url||`/CLone_Spotify/playlist.png`),O.play().then(Le).catch(e=>console.error(`Không thể phát nhạc:`,e))}function Re(e){N(`trackTitlePlayer`,e.title),N(`trackArtistPlayer`,e.artist);let t=document.getElementById(`trackImagePlayer`);t&&(t.src=e.image_url||`/CLone_Spotify/playlist.png`)}function N(e,t){let n=document.getElementById(e);n&&(n.textContent=t??``)}function ze(){let e=window.playlist?.length??0;if(!e)return 0;if(Ne&&e>1){let t;do t=Math.floor(Math.random()*e);while(t===j);return t}return(j+1)%e}function Be(){let e=window.playlist?.length??0;return e?(j-1+e)%e:0}function Ve(e){let t=Number(e);return!Number.isFinite(t)||t<0?`0:00`:`${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,`0`)}`}var He=0,Ue=!1,We=[],Ge=``;async function P(){if(!document.getElementById(`allTracksList`)){console.error(`Không tìm thấy phần tử #allTracksList`);return}Ye(),Xe();let e=++He;try{let t=await n.get(`/api/tracks?offset=0&limit=40`);if(e!==He)return;let r=t.data,i=Ke(r);if(!i)throw console.error(`Cấu trúc dữ liệu API không hợp lệ:`,r),Error(`Không đọc được danh sách bài hát từ API.`);let a=i.map(qe);We=a,window.playlist=a,I=1,Ze(Je()),it()}catch(t){if(e!==He)return;console.error(`Lỗi tải danh sách bài hát:`,t.response?.data||t.message||t),Qe(t)}}function Ke(e){if(Array.isArray(e))return e;let t=[e?.tracks,e?.tracks?.items,e?.items,e?.data,e?.data?.tracks,e?.data?.items,e?.results];for(let e of t){if(Array.isArray(e))return e;if(Array.isArray(e?.items))return e.items}return null}function qe(e){let t=e.artist_name??e.artist?.name??(typeof e.artist==`string`?e.artist:null)??e.artists?.map(e=>e.name).filter(Boolean).join(`, `)??`Chưa rõ nghệ sĩ`,n=e.album_title??e.album?.title??e.album?.name??(typeof e.album==`string`?e.album:null)??`Chưa rõ album`;return{id:String(e.id??e._id??``),title:e.title??e.name??`Chưa có tên`,artist:t,album:n,duration:e.duration??e.duration_seconds??0,image_url:e.image_url??e.cover_image_url??e.album?.image_url??e.album?.cover_image_url??e.album?.image??`/CLone_Spotify/playlist.png`,audio_url:e.audio_url??e.audioUrl??e.preview_url??e.url??``}}function Je(){return We.filter(e=>[e.title,e.artist,e.album].join(` `).toLowerCase().includes(Ge))}function Ye(){if(Ue)return;let e=document.getElementById(`allTracksList`);e&&(Ue=!0,document.getElementById(`btnReloadTracks`)?.addEventListener(`click`,P),document.getElementById(`btnRetryTracks`)?.addEventListener(`click`,P),document.getElementById(`trackSearchInput`)?.addEventListener(`input`,e=>{Ge=e.target.value.trim().toLowerCase(),I=1,Ze(Je()),rt()}),document.getElementById(`btnPlayAllTracks`)?.addEventListener(`click`,()=>{window.playlist?.length&&M(0)}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.play-track-btn`);if(t){let e=Number(t.dataset.index);Number.isInteger(e)&&e>=0&&e<(window.playlist?.length??0)&&M(e);return}let n=e.target.closest(`.open-track-btn`);if(n){let e=n.dataset.id;if(console.log(`Bài hát được chọn:`,{id:e,title:n.textContent.trim()}),!e){console.error(`Bài hát này không có ID hợp lệ.`);return}l(`track`,{id:e})}}),document.getElementById(`btnGoHome`)?.addEventListener(`click`,()=>{window.location.href=`/CLone_Spotify/home.html`}))}function Xe(){let e=document.getElementById(`allTracksList`),t=document.getElementById(`trackCount`);e&&(e.innerHTML=`
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-spinner fa-spin mb-3 text-2xl"></i>
        <p>Đang tải danh sách bài hát...</p>
      </div>
    `),t&&(t.textContent=`Đang tải danh sách bài hát...`)}function Ze(e){let t=document.getElementById(`allTracksList`),n=document.getElementById(`trackCount`);t&&(t.innerHTML=e.length===0?`
    <div
      id="trackMessage"
      class="px-4 py-10 text-center text-neutral-400"
    >
      <i class="fa-solid fa-music mb-3 text-2xl"></i>
      <p>
        ${Ge?`Không tìm thấy bài hát phù hợp.`:`Chưa có bài hát nào.`}
      </p>
    </div>
  `:e.map(e=>{let t=We.indexOf(e);return`
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
            aria-label="Phát ${F(e.title)}"
            title="Phát bài hát"
          >
            <i class="fa-solid fa-play"></i>
          </button>
        </div>

        <div class="flex min-w-0 items-center gap-3">
          <img
            src="${F(e.image_url)}"
            alt=""
            class="h-10 w-10 shrink-0 rounded object-cover"
            onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png'"
          />

          <button
            type="button"
            class="open-track-btn min-w-0 text-left"
            data-id="${F(e.id)}"
            title="Xem chi tiết bài hát"
          >
            <span class="block truncate font-medium text-white hover:underline">
              ${F(e.title)}
            </span>
            <span class="block truncate text-xs text-neutral-400">
              ${F(e.artist)}
            </span>
          </button>
        </div>

        <span class="hidden truncate md:block">
          ${F(e.album)}
        </span>

        <span class="text-right tabular-nums">
          ${et(e.duration)}
        </span>
      </div>
    `}).join(``),n&&(n.textContent=Ge?`Tìm thấy ${e.length} bài hát`:`${e.length} bài hát`),rt())}function Qe(e){let t=document.getElementById(`allTracksList`),n=document.getElementById(`trackCount`);t&&(t.innerHTML=`
      <div class="px-4 py-10 text-center text-neutral-400">
        <i class="fa-solid fa-circle-exclamation mb-3 text-2xl"></i>
        <p class="mb-2">Không thể tải danh sách bài hát.</p>
        <p class="mb-4 text-sm">
          ${F($e(e))}
        </p>
        <button
          type="button"
          id="btnRetryTracks"
          class="rounded-full bg-white px-4 py-2 font-semibold text-black hover:scale-105"
        >
          Thử lại
        </button>
      </div>
    `,t.querySelector(`#btnRetryTracks`)?.addEventListener(`click`,P)),n&&(n.textContent=`Không tải được bài hát`)}function $e(e){return e.response?`Máy chủ trả về lỗi ${e.response.status}.`:e.request?`Không nhận được phản hồi từ máy chủ. Hãy kiểm tra kết nối mạng.`:e.message||`Đã xảy ra lỗi không xác định.`}function F(e=``){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function et(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}var tt=10,I=1;function nt(e,t){return t<=7?Array.from({length:t},(e,t)=>t+1):e<=4?[1,2,3,4,5,`...`,t]:e>=t-3?[1,`...`,t-4,t-3,t-2,t-1,t]:[1,`...`,e-1,e,e+1,`...`,t]}function rt(){let e=document.getElementById(`allTracksList`),t=document.getElementById(`tracksPagination`);if(!e||!t)return;let n=Array.from(e.querySelectorAll(`.track-row`)),r=n.length;if(r<=tt){n.forEach(e=>e.classList.remove(`hidden`)),t.innerHTML=``,I=1;return}let i=Math.ceil(r/tt);I=Math.min(Math.max(I,1),i);let a=(I-1)*tt,o=a+tt;n.forEach((e,t)=>{e.classList.toggle(`hidden`,t<a||t>=o)}),t.innerHTML=`
    <button
      type="button"
      data-page="${I-1}"
      ${I===1?`disabled`:``}
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

  ${nt(I,i).map(e=>{if(e===`...`)return`
        <span class="px-2 text-neutral-400 select-none">...</span>
      `;let t=e===I;return`
      <button
        type="button"
        data-page="${e}"
        aria-current="${t?`page`:`false`}"
        class="h-10 w-10 rounded-full font-semibold transition
          ${t?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`}"
      >
        ${e}
      </button>
    `}).join(``)}

    <button
      type="button"
      data-page="${I+1}"
      ${I===i?`disabled`:``}
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}function it(){let e=document.getElementById(`tracksPagination`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-page]`);t&&!t.disabled&&(I=Number(t.dataset.page),rt(),document.getElementById(`mainContent`)?.scrollTo({top:0,behavior:`smooth`}))}))}function at(){let e=document.querySelector(`#footer-container`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.innerHTML=`
  <footer class="mt-16 border-t border-neutral-800 px-6 py-10 text-sm text-neutral-400">
    <!-- 5 cột nội dung -->
    <div class="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">

      <!-- Cột 1: Công ty -->
      <div>
        <h4 class="mb-4 font-bold text-white">Công ty</h4>
        <ul class="space-y-3">
          <li><a href="https://www.spotify.com/vn-vi/about-us/contact/" class="hover:text-white hover:underline">Giới thiệu</a></li>
          <li><a href="https://www.lifeatspotify.com/" class="hover:text-white hover:underline">Việc làm</a></li>
          <li><a href="https://newsroom.spotify.com/" class="hover:text-white hover:underline">For the Record</a></li>
        </ul>
      </div>

      <!-- Cột 2: Cộng đồng -->
      <div>
        <h4 class="mb-4 font-bold text-white">Cộng đồng</h4>
        <ul class="space-y-3">
          <li><a href="https://artists.spotify.com/" class="hover:text-white hover:underline">Dành cho các Nghệ sĩ</a></li>
          <li><a href="https://creators.spotify.com/" class="hover:text-white hover:underline">Dành cho Nhà sáng tạo</a></li>
          <li><a href="https://authors.spotify.com/" class="hover:text-white hover:underline">Dành cho Tác giả</a></li>
          <li><a href="https://developer.spotify.com/" class="hover:text-white hover:underline">Nhà phát triển</a></li>
          <li><a href="https://ads.spotify.com/" class="hover:text-white hover:underline">Quảng cáo</a></li>
          <li><a href="https://investors.spotify.com/" class="hover:text-white hover:underline">Nhà đầu tư</a></li>
          <li><a href="https://spotifyforvendors.com/" class="hover:text-white hover:underline">Nhà cung cấp</a></li>
        </ul>
      </div>

      <!-- Cột 3: Đường liên kết hữu ích -->
      <div>
        <h4 class="mb-4 font-bold text-white">Đường liên kết hữu ích</h4>
        <ul class="space-y-3">
          <li><a href="https://support.spotify.com/" class="hover:text-white hover:underline">Hỗ trợ</a></li>
          <li><a href="https://www.spotify.com/vn-vi/download/" class="hover:text-white hover:underline">Ứng dụng Di động Miễn phí</a></li>
          <li><a href="https://www.spotify.com/vn-vi/popular-in/vn" class="hover:text-white hover:underline">Phổ biến theo quốc gia</a></li>
          <li><a href="https://open.spotify.com/playlist/37i9dQZF1CLcTo7UzL0sYK" class="hover:text-white hover:underline">Top lời bài hát</a></li>
          <li><a href="https://www.spotify.com/vn-vi/import-music/" class="hover:text-white hover:underline">Thêm nhạc</a></li>
        </ul>
      </div>

      <!-- Cột 4: Các gói -->
      <div>
        <h4 class="mb-4 font-bold text-white">Các gói của Spotify</h4>
        <ul class="space-y-3">
          <li><a href="https://www.spotify.com/vn-vi/premium/#plans" class="hover:text-white hover:underline">Premium Individual</a></li>
          <li><a href="https://www.spotify.com/vn-vi/student/" class="hover:text-white hover:underline">Premium Student</a></li>
          <li><a href="https://www.spotify.com/vn-vi/free/" class="hover:text-white hover:underline">Spotify Free</a></li>
        </ul>
      </div>

      <!-- Cột 5: Mạng xã hội -->
      <div>

        <div class="flex flex-wrap gap-3">
          <!-- Instagram -->
          <a
            href="https://instagram.com/spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-instagram text-xl"></i>
          </a>

          <!-- X -->
          <a
            href="https://x.com/spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-x-twitter text-lg"></i>
          </a>

          <!-- Facebook -->
          <a
            href="https://www.facebook.com/Spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-facebook-f text-lg"></i>
          </a>
        </div>
      </div>

    </div>

    <!-- Đường phân cách -->
    <hr class="my-8 border-neutral-800" />

    <!-- Pháp lý và bản quyền -->
    <div class="flex flex-col justify-between gap-5 text-xs md:flex-row md:items-center">
      <div class="flex flex-wrap gap-x-5 gap-y-3">
        <a href="https://www.spotify.com/vn-vi/legal/" class="hover:text-white">Pháp lý</a>
        <a href="https://www.spotify.com/vn-vi/safetyandprivacy/" class="hover:text-white">Trung tâm an toàn và quyền riêng tư</a>
        <a href="https://www.spotify.com/vn-vi/legal/privacy-policy/" class="hover:text-white">Chính sách quyền riêng tư</a>
        <a href="https://www.spotify.com/vn-vi/legal/cookies-policy/" class="hover:text-white">Cookie</a>
        <a href="https://www.spotify.com/vn-vi/legal/privacy-policy/#s3" class="hover:text-white">Giới thiệu Quảng cáo</a>
        <a href="https://www.spotify.com/vn-vi/accessibility/" class="hover:text-white">Hỗ trợ tiếp cận</a>
      </div>

      <p class="shrink-0">© 2026 Spotify AB</p>
    </div>
  </footer>
`)}var ot=!1,L=!1,st=!1;function ct(){if(ot)return;ot=!0;function e(e){let t=document.getElementById(`sidebar`),n=document.getElementById(`mainContent`),r=document.getElementById(`openSidebarBtn`),i=document.getElementById(`toggleSidebarBtn`);t&&r&&i&&(L=e,st=!0,t.classList.toggle(`hidden`,e),r.classList.toggle(`opacity-0`,!e),r.classList.toggle(`pointer-events-none`,!e),r.setAttribute(`aria-expanded`,String(!e)),i.setAttribute(`aria-expanded`,String(!e)),n&&n.classList.add(`flex-1`))}function t(){let e=document.getElementById(`sidebar`);e&&!st&&(L=e.classList.contains(`hidden`),st=!0)}document.addEventListener(`click`,n=>{let r=n.target;r instanceof Element&&(t(),r.closest(`#toggleSidebarBtn`)?e(!0):r.closest(`#openSidebarBtn`)&&e(!1))}),document.addEventListener(`mousemove`,e=>{if(t(),!L)return;let n=document.getElementById(`openSidebarBtn`);n&&(e.clientX<=12?n.classList.remove(`opacity-0`,`pointer-events-none`):n.matches(`:hover`)||n.classList.add(`opacity-0`,`pointer-events-none`))}),t(),st&&e(L)}var lt=0;async function ut(e){if(!e){console.error(`Không tìm thấy ID bài hát trong URL`);return}let t=++lt;try{let r=(await n.get(`/api/tracks/${encodeURIComponent(e)}`)).data;if(t!==lt)return;if(!r){console.error(`Không tìm thấy dữ liệu bài hát`);return}R(`trackTitleHeader`,r.title),R(`trackArtistHeader`,r.artist_name),R(`trackAlbum`,r.album_title),R(`trackDuration`,ft(r.duration));let i=document.getElementById(`trackImageHeader`);i&&(i.src=r.image_url||`/CLone_Spotify/playlist.png`),window.playlist=[{id:r.id,title:r.title,artist:r.artist_name,album:r.album_title,duration:r.duration,image_url:r.image_url,audio_url:r.audio_url}],dt(r),document.getElementById(`trackTitlePlayer`)||document.addEventListener(`playerloaded`,()=>dt(r),{once:!0});let a=document.getElementById(`btnPlayTrack`);a&&!a.dataset.initialized&&(a.dataset.initialized=`true`,a.addEventListener(`click`,()=>{M(0)}))}catch(e){t===lt&&console.error(`Lỗi load track:`,e)}}function dt(e){R(`trackTitlePlayer`,e.title),R(`trackArtistPlayer`,e.artist_name);let t=document.getElementById(`trackImagePlayer`);t&&(t.src=e.image_url||`/CLone_Spotify/playlist.png`)}function R(e,t){let n=document.getElementById(e);n&&(n.textContent=t??``)}function ft(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}var pt=null,z=0;async function mt(e){if(!e){gt(`Không tìm thấy ID nghệ sĩ.`);return}pt=String(e);let t=++z,n=document.getElementById(`artistHeader`),r=document.getElementById(`artistTracks`),i=document.getElementById(`artistAlbums`);n&&(n.innerHTML=`
      <p class="text-gray-400">Đang tải thông tin nghệ sĩ...</p>
    `),r&&r.replaceChildren(),i&&i.replaceChildren(),await ht(pt,t)}async function ht(e,t){try{let r;try{r=await n.get(`/api/artists/${encodeURIComponent(e)}`)}catch(e){if(t!==z)return;console.error(`Lỗi API thông tin nghệ sĩ:`,{url:e.config?.url,status:e.response?.status,data:e.response?.data,message:e.message}),gt(`Không thể tải thông tin nghệ sĩ.`);return}if(t!==z)return;let i=r.data;if(!i||!i.name){console.error(`Dữ liệu nghệ sĩ không hợp lệ:`,i),gt(`Thông tin nghệ sĩ không hợp lệ.`);return}vt(i);let[a,o]=await Promise.allSettled([n.get(`/api/artists/${encodeURIComponent(e)}/tracks`),n.get(`/api/artists/${encodeURIComponent(e)}/albums`)]);if(t!==z)return;if(a.status===`fulfilled`){let e=a.value.data;yt(Array.isArray(e?.tracks)?e.tracks:[])}else console.error(`Lỗi API bài hát nghệ sĩ:`,a.reason),_t(`artistTracks`,`Không thể tải danh sách bài hát.`);if(o.status===`fulfilled`){let e=o.value.data;bt(Array.isArray(e?.albums)?e.albums:[])}else console.error(`Lỗi API album nghệ sĩ:`,o.reason),_t(`artistAlbums`,`Không thể tải danh sách album.`)}catch(e){if(t!==z)return;console.error(`Lỗi tải trang nghệ sĩ:`,e),gt(`Đã xảy ra lỗi khi tải trang nghệ sĩ.`)}}function gt(e){let t=document.getElementById(`artistHeader`);t&&(t.innerHTML=`
      <p class="text-red-400">${xt(e)}</p>
    `)}function _t(e,t){let n=document.getElementById(e);n&&(n.innerHTML=`
      <p class="text-red-400">${xt(t)}</p>
    `)}function vt(e){let t=document.getElementById(`artistHeader`);if(!t)return;let n=e.image_url||`./src/assets/artist.png`,r=e.name||`Nghệ sĩ không tên`,i=Number(e.monthly_listeners)||0,a=e.bio||`Chưa có mô tả`,o=document.createElement(`img`);o.src=n,o.alt=r,o.className=`w-48 h-48 object-cover rounded-full shadow-lg`,o.onerror=()=>{o.onerror=null,o.src=`./src/assets/artist.png`},t.replaceChildren();let s=document.createElement(`div`);s.className=`flex flex-col items-center gap-6 md:flex-row`;let c=document.createElement(`div`),l=document.createElement(`p`);l.className=`text-sm text-gray-300 mb-2`,l.innerHTML=`<i class="fa-solid fa-circle-check text-blue-400 mr-1"></i> Nghệ sĩ`;let u=document.createElement(`h1`);u.className=`text-4xl font-bold text-white`,u.textContent=r;let d=document.createElement(`p`);d.className=`text-gray-400 mt-2`,d.textContent=`${i.toLocaleString(`vi-VN`)} người nghe/tháng`;let f=document.createElement(`p`);f.className=`text-gray-300 mt-4`,f.textContent=a,c.append(l,u,d,f),s.append(o,c),t.appendChild(s)}function yt(e=[]){let t=document.getElementById(`artistTracks`);t&&(!Array.isArray(e)||e.length===0?t.innerHTML=`
      <p class="text-gray-400">Chưa có bài hát nào.</p>
    `:(t.replaceChildren(),e.forEach(e=>{let n=e.id??e.track_id??e._id,r=e.title||`Bài hát không tên`,i=e.album_name||`Đĩa đơn`,a=e.cover_image_url||`/CLone_Spotify/playlist.png`,o=document.createElement(`button`);o.type=`button`,o.className=`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors w-full text-left`;let s=document.createElement(`img`);s.src=a,s.alt=r,s.className=`w-14 h-14 object-cover rounded`,s.onerror=()=>{s.onerror=null,s.src=`/CLone_Spotify/playlist.png`};let c=document.createElement(`div`);c.className=`min-w-0`;let l=document.createElement(`p`);l.className=`text-white font-semibold truncate`,l.textContent=r;let u=document.createElement(`p`);u.className=`text-gray-400 text-sm truncate`,u.textContent=i,c.append(l,u),o.append(s,c),o.addEventListener(`click`,()=>{n==null||n===``?console.error(`Không tìm thấy ID bài hát:`,e):window.openTrack(String(n))}),t.appendChild(o)})))}function bt(e=[]){let t=document.getElementById(`artistAlbums`);t&&(!Array.isArray(e)||e.length===0?t.innerHTML=`
      <p class="text-gray-400">Chưa có album nào.</p>
    `:(t.replaceChildren(),e.forEach(e=>{let n=e.id??e.album_id??e._id,r=e.title||`Album không tên`,i=e.cover_image_url||`/CLone_Spotify/playlist.png`,a=e.release_year??``,o=document.createElement(`button`);o.type=`button`,o.className=`block w-44 flex-shrink-0 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors text-left`;let s=document.createElement(`img`);s.src=i,s.alt=r,s.className=`w-full aspect-square object-cover rounded mb-2`,s.onerror=()=>{s.onerror=null,s.src=`/CLone_Spotify/playlist.png`};let c=document.createElement(`p`);c.className=`text-white text-sm font-semibold truncate`,c.textContent=r;let l=document.createElement(`p`);l.className=`text-xs text-gray-400 truncate`,l.textContent=String(a),o.append(s,c,l),o.addEventListener(`click`,()=>{n==null||n===``?console.error(`Không tìm thấy ID album:`,e):window.openDetail(`album`,String(n))}),t.appendChild(o)})))}function xt(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function St(e){e?await Ct(e):console.error(`Không tìm thấy ID album`)}function B(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function Ct(e){try{let t=(await n.get(`/api/albums/${e}`)).data;document.querySelector(`#detailImage`).src=t.cover_image_url||`./src/assets/placeholder.png`,document.querySelector(`#detailName`).textContent=t.title,document.querySelector(`#detailDesc`).textContent=`${t.artist_name||t.artist||``} • ${t.release_date?.slice(0,4)||``}`;let r=await n.get(`/api/albums/${e}/tracks`),i=Array.isArray(r.data.tracks)?r.data.tracks:[],a=document.querySelector(`#trackList`);a.innerHTML=i.length===0?`
        <p class="text-gray-400 text-sm italic">
          Album này chưa có bài hát nào.
        </p>`:i.map((e,n)=>{let r=e.artist_name||`Không rõ nghệ sĩ`,i=e.title||`Không rõ tên bài hát`,a=e.duration?wt(e.duration):`0:00`,o=e.image_url||e.cover_image_url||t.cover_image_url||`./src/assets/placeholder.png`;return`
        <div
          class="track-row group grid grid-cols-[40px_minmax(0,1fr)_60px] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 transition"
        >
          <div class="flex items-center justify-center">
            <span class="track-number group-hover:hidden">
              ${n+1}
            </span>

            <button
              type="button"
              class="play-track-btn hidden text-white group-hover:block"
              data-index="${n}"
              aria-label="Phát ${B(i)}"
              title="Phát bài hát"
            >
              <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <button
            type="button"
            class="open-track-btn flex min-w-0 items-center gap-3 text-left"
            data-id="${B(e.id||``)}"
            title="Xem chi tiết bài hát"
          >
            <img
              src="${B(o)}"
              alt=""
              class="h-12 w-12 shrink-0 rounded object-cover"
              onerror="this.onerror=null;this.src='./src/assets/placeholder.png'"
            />

            <span class="min-w-0">
              <span class="block truncate font-medium text-white hover:underline">
                ${B(i)}
              </span>
              <span class="block truncate text-xs text-neutral-400">
                ${B(r)}
              </span>
            </span>
          </button>

          <span class="text-right text-xs tabular-nums text-neutral-400">
            ${a}
          </span>
        </div>
      `}).join(``),a.onclick=e=>{let t=e.target.closest(`.play-track-btn`);if(t){e.stopPropagation();let n=Number(t.dataset.index);n>=0&&n<i.length&&(window.playlist=i,M(n));return}let n=e.target.closest(`.open-track-btn`);if(n){let e=n.dataset.id;e&&typeof window.openTrack==`function`?window.openTrack(e):e&&console.error(`Không tìm thấy hàm window.openTrack()`)}},Tt(e)}catch(e){console.error(`Lỗi load album:`,e)}}function wt(e){return e?`${Math.floor(e/60)}:${(e%60).toString().padStart(2,`0`)}`:`0:00`}function Tt(e){let t=document.querySelector(`#playBtn`),r=document.querySelector(`#toggleLibraryBtn`);t&&t.addEventListener(`click`,async()=>{try{let t=await n.get(`/api/albums/${e}/tracks`),r=Array.isArray(t.data.tracks)?t.data.tracks:[];if(r.length===0){console.warn(`Album không có bài hát nào để phát`);return}window.playlist=r,M(0)}catch(e){console.error(`Lỗi phát bài hát:`,e),alert(`Không thể phát bài hát này.`)}}),r&&r.addEventListener(`click`,async()=>{try{r.textContent.includes(`Lưu`)?(await n.put(`/api/albums/${e}/followers`),r.textContent=`Xóa khỏi thư viện`):(await n.delete(`/api/albums/${e}/followers`),r.textContent=`Lưu vào thư viện`)}catch(e){console.error(`Lỗi cập nhật thư viện:`,e)}})}var V=!1,Et=!1,H=null,U=[],W=null,Dt=0,G=0,K=`/CLone_Spotify/playlist.png`,Ot=10,q=1;async function kt(e){let t=new URLSearchParams(window.location.search),n=e||t.get(`id`)||document.querySelector(`[data-playlist-id]`)?.dataset.playlistId;if(!n){console.error(`[Playlist:init] Không tìm thấy ID playlist`);return}W=String(n),H=null,U=[],V=!1,Vt();let r=++G;Dt++,document.body.dataset.playlistId=W,Ft(),await At(W,r)}async function At(e,t=++G){try{let r=await n.get(`/api/playlists/${encodeURIComponent(e)}`);if(t!==G)return;let i=r.data;H=i;let a=document.querySelector(`#detailImage`),o=document.querySelector(`#detailName`),s=document.querySelector(`#detailDesc`);if(a){let e=i.image_url||i.cover_image_url||i.cover_url||i.thumbnail_url||i.imageUrl||i.image||i.cover?.url||i.images?.[0]?.url||i.images?.[0]||K;a.onerror=()=>{console.error(`Không tải được ảnh playlist:`,a.src),a.onerror=null,a.src=K},a.src=e}o&&(o.textContent=i.title||i.name||`Playlist`),s&&(s.textContent=i.additional_info?.description||i.description||``);let c=null;try{c=JSON.parse(localStorage.getItem(`user`)||`null`)}catch{c=null}let l=c?.id,u=i.is_owner===!0||l!=null&&[i.owner?.id,i.owner_id,i.user_id,i.created_by].some(e=>e!=null&&String(e)===String(l)),d=document.querySelector(`#toggleLibraryBtn`);d&&d.classList.toggle(`hidden`,l==null||u),Vt();let f=document.querySelector(`#deleteBtn`);f&&f.classList.toggle(`hidden`,!u);let p=jt(i);if(p.length===0)try{let r=await n.get(`/api/playlists/${encodeURIComponent(e)}/tracks`);if(t!==G)return;let i=r.data;p=Array.isArray(i)?i:i?.tracks??i?.items??i?.results?.tracks??i?.results??i?.data?.tracks??i?.data?.items??[],Array.isArray(p)||(p=[])}catch(e){if(t!==G)return;console.error(`[API tracks] Không tải được danh sách:`,{status:e.response?.status,data:e.response?.data,message:e.message})}if(t!==G)return;U=p.map(Mt);let m=document.querySelector(`#trackCount`);m&&(m.textContent=`${U.length} bài hát`),q=1,Nt(U,u),Ut(),zt(u),document.querySelector(`#editPlaylistBtn`)?.classList.toggle(`hidden`,!u),Pt(u)}catch(e){if(t!==G)return;console.error(`[Playlist:load] Lỗi tải playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message})}}function jt(e){let t=e?.tracks??e?.items??e?.results?.tracks??[];return Array.isArray(t)?t:Array.isArray(t?.items)?t.items:Array.isArray(t?.data)?t.data:[]}function Mt(e){let t=e?.track||e||{};return{id:t.track_id||t.id||t._id||t.trackId||``,title:t.track_title||t.title||t.name||`Không rõ tên`,artist:t.artist_name||t.subtitle||t.artist?.name||t.artist||``,album:t.album_title||t.album?.name||t.album||``,duration:Number(t.track_duration??t.duration??(t.duration_ms==null?0:t.duration_ms/1e3)),image_url:t.track_image_url||t.image_url||t.album_cover_image_url||t.album?.image_url||K,audio_url:t.track_audio_url||t.audio_url||t.preview_url||``}}function Nt(e,t=!1){let r=document.querySelector(`#trackList`);r?e.length?(r.innerHTML=e.map((e,n)=>`
        <div
          class="track-row group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800"
        >
          <!-- Số thứ tự và nút phát -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center">
            <span class="track-number group-hover:hidden">
              ${n+1}
            </span>

            <button
              type="button"
              class="play-track-btn hidden text-white hover:scale-110 group-hover:block"
              data-track-index="${n}"
              aria-label="Phát ${J(e.title)}"
              title="Phát bài hát"
            >
              <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- Ảnh, tên bài hát và nghệ sĩ -->
          <button
            type="button"
            class="open-track-btn flex min-w-0 flex-1 items-center gap-3 text-left"
            data-track-index="${n}"
            title="Phát bài hát"
          >
            <img
              src="${J(e.image_url||K)}"
              alt=""
              class="h-12 w-12 shrink-0 rounded object-cover"
              onerror="this.onerror=null;this.src='${K}'"
            />

            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-white hover:underline">
                ${J(e.title)}
              </span>

              <span class="block truncate text-xs text-neutral-400">
                ${J(e.artist||`Không rõ nghệ sĩ`)}
              </span>
            </span>
          </button>

          <!-- Thời lượng -->
          <span class="w-12 shrink-0 text-right text-xs tabular-nums text-neutral-400">
            ${Rt(e.duration)}
          </span>

          <!-- Chỉ chủ playlist mới được xóa bài hát -->
          ${t?`
                <button
                  type="button"
                  class="remove-track-btn rounded-full px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                  data-track-index="${n}"
                  title="Xóa khỏi playlist"
                  aria-label="Xóa ${J(e.title)} khỏi playlist"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `:``}
        </div>
      `).join(``),r.onclick=e=>{if(e.target.closest(`.remove-track-btn`))return;let t=e.target.closest(`.play-track-btn, .open-track-btn`);if(!t)return;let n=Number(t.dataset.trackIndex),r=U[n];r&&(r.audio_url?(window.playlist=U,M(n)):console.warn(`Bài hát chưa có audio_url hoặc preview_url:`,r))},r.querySelectorAll(`.remove-track-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(!t)return;let r=W,i=Number(e.dataset.trackIndex),a=U[i];if(!r||!a?.id)console.error(`Thiếu ID playlist hoặc bài hát`,{playlistId:r,track:a});else if(window.confirm(`Bạn có chắc muốn xóa "${a.title}" khỏi playlist này không?`)){e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`;try{await n.delete(`/api/playlists/${encodeURIComponent(r)}/tracks/${encodeURIComponent(a.id)}`),r===W&&await At(r)}catch(t){console.error(`Lỗi xóa bài hát khỏi playlist:`,t),console.error(`Backend response:`,t.response?.data),e.disabled=!1,e.innerHTML=`<i class="fa-solid fa-trash-can"></i>`,window.alert(t.response?.data?.message||`Không thể xóa bài hát. Hãy kiểm tra API backend.`)}}})}),Ht()):(r.innerHTML=`
      <p class="px-3 py-5 text-sm text-gray-400">
        Playlist này chưa có bài hát nào.
      </p>
    `,document.querySelector(`#trackPagination`)?.replaceChildren(),q=1):console.error(`[renderTrackList] Không tìm thấy #trackList`)}function Pt(e){let t=document.querySelector(`#playBtn`),r=document.querySelector(`#toggleLibraryBtn`),i=document.querySelector(`#deleteBtn`);t&&t.dataset.initialized!==`true`&&(t.dataset.initialized=`true`,t.addEventListener(`click`,()=>{let e=U;if(!e.length){console.warn(`Playlist chưa có bài hát để phát`);return}let t=e.findIndex(e=>!!e.audio_url);t===-1?console.warn(`Không có bài hát nào có audio_url hoặc preview_url`):(window.playlist=e,M(t))})),r&&r.dataset.initialized!==`true`&&(r.dataset.initialized=`true`,r.addEventListener(`click`,async()=>{let e=W;if(!e||Et)return;let t=V;Et=!0,r.disabled=!0;try{t?(await n.delete(`/api/playlists/${encodeURIComponent(e)}/follow`),V=!1):(await n.post(`/api/playlists/${encodeURIComponent(e)}/follow`),V=!0),Vt()}catch(e){V=t,console.error(`Lỗi theo dõi playlist:`,e),console.error(`Backend response:`,e.response?.data),window.alert(e.response?.data?.message||`Không thể cập nhật trạng thái theo dõi playlist.`)}finally{Et=!1,r.disabled=!1}})),i&&i.dataset.initialized!==`true`&&(i.dataset.initialized=`true`,i.addEventListener(`click`,async()=>{if(!e)return;let t=W;if(t&&window.confirm(`Bạn có chắc muốn xóa playlist này không?`)){i.disabled=!0;try{await n.delete(`/api/playlists/${encodeURIComponent(t)}`),window.location.assign(`/CLone_Spotify/home.html`)}catch(e){console.error(`Lỗi xóa playlist:`,e),console.error(`Backend response:`,e.response?.data),window.alert(e.response?.data?.message||`Không thể xóa playlist. Vui lòng thử lại.`)}finally{i.disabled=!1}}}))}function Ft(){let e=document.querySelector(`#playlistTrackSearch`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`input`,async e=>{let t=e.target.value.trim(),r=++Dt;if(!t)document.querySelector(`#trackSearchResults`)?.replaceChildren();else try{let e=await n.get(`/api/search?q=${encodeURIComponent(t)}&type=track`);if(r!==Dt)return;Lt(It(e.data))}catch(e){if(r!==Dt)return;console.error(`Lỗi API tìm kiếm:`,e),console.error(`Backend response:`,e.response?.data)}}))}function It(e){let t=e?.results;return Array.isArray(t)?t:[t?.tracks?.items,t?.tracks,t?.items,t?.data?.tracks,t?.data?.items,e?.tracks?.items,e?.tracks,e?.items].find(Array.isArray)||[]}function Lt(e){let t=document.querySelector(`#trackSearchResults`);t&&(!Array.isArray(e)||e.length===0?t.innerHTML=`
      <p class="py-3 text-sm text-gray-400">
        Không tìm thấy bài hát phù hợp.
      </p>
    `:(t.innerHTML=e.map((e,t)=>{let n=Mt(e),r=e.track_id||e.id||e._id||e.trackId||e.track?.id||e.track?.track_id||n.id||``;return`
        <div class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="${J(n.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-white">
                ${J(n.title)}
              </p>

              <p class="truncate text-sm text-gray-400">
                ${J(n.artist)}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="add-track-btn rounded bg-green-600 px-3 py-1 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            data-track-id="${J(r)}"
          >
            Thêm
          </button>
        </div>
      `}).join(``),t.querySelectorAll(`.add-track-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=W,r=e.dataset.trackId;if(!t||!r)console.error(`Thiếu ID playlist hoặc bài hát:`,{playlistId:t,trackId:r});else{e.disabled=!0,e.textContent=`Đang thêm...`;try{await n.post(`/api/playlists/${encodeURIComponent(t)}/tracks`,{track_id:r}),e.textContent=`Đã thêm`,t===W&&await At(t)}catch(t){console.error(`HTTP status:`,t.response?.status),console.error(`Backend response:`,t.response?.data),console.error(`Track ID:`,r),console.error(`Request URL:`,t.config?.url),console.error(`Request body:`,t.config?.data),e.disabled=!1,e.textContent=`Thử lại`}}})})))}function Rt(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}function J(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var Y=null,X=null;function zt(e){let t=document.querySelector(`#changeImageBtn`),r=document.querySelector(`#playlistImageInput`),i=document.querySelector(`#detailImage`),a=document.querySelector(`#editPlaylistImagePreview`),o=document.querySelector(`#editPlaylistForm`),s=document.querySelector(`#editPlaylistName`),c=document.querySelector(`#selectPlaylistImageBtn`),l=document.querySelector(`#savePlaylistBtn`),u=[document.querySelector(`#cancelEditPlaylistBtn`),document.querySelector(`#cancelEditPlaylistBtnSecondary`)].filter(Boolean),d=document.querySelector(`#editPlaylistError`);if(!t||!o)return;if(t.classList.toggle(`hidden`,!e),!e){o.classList.add(`hidden`);return}function f(e=``){d&&(d.textContent=e,d.classList.toggle(`hidden`,!e))}function p(){return H?.title||H?.name||``}function m(){return H?.image_url||H?.cover_image_url||H?.cover_url||H?.thumbnail_url||H?.imageUrl||H?.image||H?.cover?.url||H?.images?.[0]?.url||H?.images?.[0]||K}function h(){s&&(s.value=p()),X=m(),i&&(i.src=X),a&&(a.src=X),o.classList.remove(`hidden`),f(``),s?.focus()}function g(){o.classList.add(`hidden`),s&&(s.value=p()),Y&&=(URL.revokeObjectURL(Y),null),i&&(i.src=X||m()),a&&(a.src=X||m()),r&&(r.value=``),f(``)}t.dataset.editBound!==`true`&&(t.dataset.editBound=`true`,t.addEventListener(`click`,h)),c&&c.dataset.editBound!==`true`&&(c.dataset.editBound=`true`,c.addEventListener(`click`,()=>r?.click())),r&&r.dataset.editBound!==`true`&&(r.dataset.editBound=`true`,r.addEventListener(`change`,()=>{let e=r.files?.[0];e&&([`image/jpeg`,`image/png`,`image/webp`].includes(e.type)?e.size>5242880?(f(`Ảnh không được vượt quá 5 MB.`),r.value=``):(Y&&URL.revokeObjectURL(Y),Y=URL.createObjectURL(e),i&&(i.src=Y),a&&(a.src=Y),o.classList.remove(`hidden`),f(``)):(f(`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`),r.value=``))})),u.forEach(e=>{e.dataset.editBound!==`true`&&(e.dataset.editBound=`true`,e.addEventListener(`click`,g))}),l&&l.dataset.editBound!==`true`&&(l.dataset.editBound=`true`,l.addEventListener(`click`,async()=>{let e=s?.value.trim()||``,t=p(),i=r?.files?.[0]||null;if(!e)f(`Vui lòng nhập tên playlist.`),s?.focus();else if(!W)f(`Không tìm thấy ID playlist.`);else if(e===t&&!i)g();else if(!l.disabled){l.disabled=!0,l.textContent=`Đang lưu...`,f(``);try{let t=H?.image_url||H?.imageUrl||``;if(i){let e=new FormData;e.append(`cover`,i);let r=await n.post(`/api/upload/playlist/${encodeURIComponent(W)}/cover`,e);console.log(`Upload response:`,JSON.stringify(r.data,null,2));let a=r.data;if(t=a?.image_url||a?.imageUrl||a?.url||a?.data?.image_url||a?.data?.imageUrl||a?.data?.url||a?.file?.url||``,!t)throw Error(`Upload thành công nhưng không tìm thấy URL ảnh trong phản hồi.`);Bt(t)}let r={name:e};i&&(r.image_url=t);let a=(await n.put(`/api/playlists/${encodeURIComponent(W)}`,r)).data,o=a?.playlist||a?.data||a;H={...H,...o&&typeof o==`object`?o:{},name:o?.name||e},i&&(H.image_url=o?.image_url||o?.imageUrl||t);let c=document.querySelector(`#detailName`);c&&(c.textContent=H.name),s&&(s.value=H.name);let l=document.querySelector(`#playlistCover, #detailImage, #playlistImage`);l&&H.image_url&&(l.src=H.image_url),g()}catch(e){console.error(`Lỗi lưu playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message}),f(e.response?.data?.error?.message||e.response?.data?.message||e.message||`Không thể cập nhật playlist. Vui lòng thử lại.`)}finally{l.disabled=!1,l.textContent=`Lưu`}}}))}function Bt(e){e&&([`#playlistCover`,`#detailImage`,`#playlistImage`].forEach(t=>{document.querySelectorAll(t).forEach(t=>{t.src=e})}),H&&(H.image_url=e,H.imageUrl=e))}function Vt(){let e=document.querySelector(`#toggleLibraryBtn`),t=document.querySelector(`#followButtonText`),n=e?.querySelector(`i`);e&&t&&(t.textContent=V?`Bỏ theo dõi`:`Theo dõi`,n&&(n.className=V?`fa-solid fa-check mr-2`:`fa-solid fa-plus mr-2`),e.classList.remove(`bg-neutral-700`,`hover:bg-neutral-600`,`text-white`,`bg-green-500`,`hover:bg-green-400`,`text-black`),V?e.classList.add(`bg-green-500`,`hover:bg-green-400`,`text-black`):e.classList.add(`bg-neutral-700`,`hover:bg-neutral-600`,`text-white`))}function Ht(){let e=document.querySelector(`#trackList`),t=document.querySelector(`#trackPagination`);if(!e||!t)return;let n=Array.from(e.querySelectorAll(`.track-row`)),r=n.length,i=Math.ceil(r/Ot);if(r<=Ot){n.forEach(e=>e.classList.remove(`hidden`)),t.innerHTML=``,q=1;return}q=Math.min(Math.max(q,1),i);let a=(q-1)*Ot,o=a+Ot;n.forEach((e,t)=>{e.classList.toggle(`hidden`,t<a||t>=o)}),t.innerHTML=`
    <button
      type="button"
      data-page="${q-1}"
      ${q===1?`disabled`:``}
      aria-label="Trang trước"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    ${Array.from({length:i},(e,t)=>{let n=t+1,r=n===q;return`
        <button
          type="button"
          data-page="${n}"
          aria-current="${r?`page`:`false`}"
          class="h-10 w-10 rounded-full font-semibold transition
            ${r?`bg-green-500 text-black`:`bg-neutral-800 text-white hover:bg-neutral-700`}"
        >
          ${n}
        </button>
      `}).join(``)}

    <button
      type="button"
      data-page="${q+1}"
      ${q===i?`disabled`:``}
      aria-label="Trang tiếp theo"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}function Ut(){let e=document.querySelector(`#trackPagination`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-page]`);t&&!t.disabled&&(q=Number(t.dataset.page),Ht(),document.querySelector(`#trackList`)?.scrollIntoView({behavior:`smooth`,block:`start`}))}))}var Z=t(e(),1);async function Wt(){try{await n.post(`/api/auth/logout`),localStorage.removeItem(`token`),localStorage.removeItem(`user`),Z.default.fire({icon:`success`,title:`Đăng xuất thành công`}),window.location.href=`./home.html`}catch(e){console.error(`Logout error:`,e),Z.default.fire({icon:`error`,title:`Oops...`,text:e.response?.data?.message||`Đăng xuất thất bại`})}}var Gt=`b6ea8a1b-9bc6-410b-bff3-f4780094d507`;function Kt(e,t){let n;return(...r)=>{clearTimeout(n),n=setTimeout(()=>e(...r),t)}}function qt(){let e=document.querySelector(`#searchInput`),t=document.querySelector(`#searchResults`);if(!e||!t||e.dataset.initialized===`true`)return;e.dataset.initialized=`true`,e.addEventListener(`input`,Kt(async e=>{let i=e.target.value.trim();if(!i)t.classList.add(`hidden`);else{t.innerHTML=`
        <div class="p-2 text-gray-400 text-sm italic animate-pulse">
          Đang tìm kiếm...
        </div>`,t.classList.remove(`hidden`);try{let e=(await n.get(`/api/search?q=${i}&type=all&limit=20&offset=0`)).data.results||{};r([...e.tracks||[],...e.artists||[],...e.albums||[],...e.playlists||[]])}catch(e){console.error(`Search error:`,e),t.innerHTML=`<div class="p-2 text-red-400">Lỗi khi tìm kiếm</div>`}}},500));function r(e){!e||e.length===0?t.innerHTML=`
        <div class="p-2 text-gray-400 text-sm italic">
          Không có kết quả phù hợp
        </div>`:(t.innerHTML=e.map(e=>{let t=e.name||e.title||`Không rõ tên`,n=e.image_url||e.image||e.thumbnail||`./src/assets/placeholder.png`,r=e.type===`track`?e.artists?.[0]?.name:e.creator||e.artist||``,i=e.type===`artist`?`Nghệ sĩ`:e.type===`playlist`?`Danh sách phát`:e.type===`album`?`Album`:`Bài hát`;return`
          <div class="flex justify-between items-center p-2 hover:bg-neutral-800 transition-colors duration-200 cursor-pointer search-item rounded-md" data-type="${e.type}" data-id="${e.id}">
            <div class="flex items-center space-x-3">
              <img src="${n}" alt="${t}" class="w-12 h-12 rounded-md object-cover" />
              <div>
                <p class="text-sm font-semibold text-white">${t}</p>
                <span class="text-xs text-gray-400">${r}</span>
              </div>
            </div>
            <span class="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded">${i}</span>
          </div>`}).join(``),t.classList.remove(`hidden`))}t.addEventListener(`click`,e=>{let n=e.target.closest(`.search-item`);if(!n)return;let r=n.dataset.type,i=n.dataset.id;i&&[`track`,`artist`,`album`,`playlist`].includes(r)&&(l(r,{id:i}),t.classList.add(`hidden`))}),document.addEventListener(`keydown`,t=>{t.ctrlKey&&t.shiftKey&&t.code===`KeyL`&&(t.preventDefault(),e&&(e.focus(),e.classList.add(`ring-2`,`ring-white`),setTimeout(()=>e.classList.remove(`ring-2`,`ring-white`),1e3)))})}function Jt(){let e=localStorage.getItem(`user`),t=document.querySelector(`#mobileUserInfo`),n=document.querySelector(`#mobileUserEmail`),r=document.querySelector(`#signupBtn`),i=document.querySelector(`#loginBtn`),a=document.querySelector(`#userAvatar`),o=document.querySelector(`#avatarLetter`);document.querySelector(`#mobileUserAvatar`);let s=document.querySelector(`#mobileAvatarLetter`),c=document.querySelector(`#mobileLoginBtn`),l=document.querySelector(`#mobileSignupBtn`),u=document.querySelector(`#premiumLink`),d=document.querySelector(`#supportLink`),f=document.querySelector(`#downloadLink`),p=document.querySelector(`#appInstallLink`),m=document.querySelector(`#signupLink`),h=null;if(e)try{h=JSON.parse(e)}catch(e){console.error(`Dữ liệu user không hợp lệ:`,e),localStorage.removeItem(`user`)}let g=h?.id===Gt;if(u&&(g?(u.textContent=`Admin`,u.href=`/CLone_Spotify/admin-dashboard.html`):(u.textContent=`Khám phá Premium`,u.href=`#`)),h){let e=h.email?.charAt(0).toUpperCase()||`A`;a&&o&&(o.textContent=e,a.classList.remove(`hidden`));let g=document.querySelector(`#userEmail`);a&&!g&&(g=document.createElement(`span`),g.id=`userEmail`,g.className=`ml-2 text-sm text-gray-300`,a.parentNode.insertBefore(g,a.nextSibling)),g&&(g.textContent=h.email||``,g.classList.toggle(`hidden`,!h.email)),t?.classList.remove(`hidden`),t?.classList.add(`flex`),s&&(s.textContent=e),n&&(n.textContent=h.email||``),c?.classList.add(`hidden`),l?.classList.add(`hidden`),r?.classList.add(`hidden`),i?.classList.add(`hidden`),d?.classList.add(`hidden`),f?.classList.add(`hidden`),m?.classList.add(`hidden`),u?.classList.remove(`hidden`),p?.classList.remove(`hidden`)}else a?.classList.add(`hidden`),document.querySelector(`#userEmail`)?.classList.add(`hidden`),r?.classList.remove(`hidden`),i?.classList.remove(`hidden`),t?.classList.add(`hidden`),t?.classList.remove(`flex`),c?.classList.remove(`hidden`),l?.classList.remove(`hidden`),u?.classList.remove(`hidden`),d?.classList.remove(`hidden`),f?.classList.remove(`hidden`),p?.classList.remove(`hidden`),m?.classList.remove(`hidden`)}var Yt=!1;function Xt(){Yt||(Yt=!0,document.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element))return;document.getElementById(`mobileMenuBtn`);let n=document.getElementById(`mobileMenu`);if(t.closest(`#mobileMenuBtn`)){if(e.preventDefault(),!n)return;let t=n.classList.contains(`hidden`);n.classList.toggle(`hidden`,!t)}}))}async function Zt(e,t){if(!(/[A-Z]/.test(t)&&/[a-z]/.test(t)&&/\d/.test(t)&&t.length>=6))Z.default.fire({icon:`error`,title:`Oops...`,text:`Password phải >=6 ký tự, có chữ hoa, thường và số`});else try{let r=await n.post(`/api/auth/register`,{email:e,password:t});Z.default.fire({icon:`success`,title:`Đăng ký thành công`,text:`Vui lòng kiểm tra email để xác nhận tài khoản`}),localStorage.setItem(`token`,r.data.token),localStorage.setItem(`user`,JSON.stringify(r.data.user)),window.location.href=`./login.html`}catch(e){Z.default.fire({icon:`error`,title:`Oops...`,text:e.response?.data?.message||`Đăng ký thất bại`})}}function Qt(){let e=document.getElementById(`registerPassword`),t=document.getElementById(`togglePassword`),n=t?.querySelector(`i`);e&&t&&n&&t.addEventListener(`click`,()=>{let r=e.type===`password`;e.type=r?`text`:`password`,n.classList.toggle(`fa-eye`,!r),n.classList.toggle(`fa-eye-slash`,r),t.setAttribute(`aria-label`,r?`Ẩn mật khẩu`:`Hiện mật khẩu`),t.setAttribute(`aria-pressed`,String(r))})}Qt();var $t=`b6ea8a1b-9bc6-410b-bff3-f4780094d507`;async function en(e,t){try{let r=(await n.post(`/api/auth/login`,{email:e,password:t})).data,i=r.user||r.data?.user||{},a=r.token||r.access_token||r.data?.token||r.data?.access_token||null;if(!a)throw Error(`Không tìm thấy token trong phản hồi API.`);let o=i.id||i._id||null;localStorage.setItem(`token`,a),localStorage.setItem(`user`,JSON.stringify({id:o,email:i.email||e,name:i.name||i.display_name||``,username:i.username||``,avatar_url:i.avatar_url||null}));let s=o===$t;await Z.default.fire({icon:`success`,title:`Đăng nhập thành công`,text:s?`Chào mừng Admin đến với trang quản trị!`:`Chào mừng ${i.name||i.email||e} quay lại!`,timer:1500,showConfirmButton:!1}),window.location.href=s?`/CLone_Spotify/admin-dashboard.html`:`/CLone_Spotify/home.html`}catch(e){console.error(`Login error:`,e),await Z.default.fire({icon:`error`,title:`Đăng nhập thất bại`,text:e.response?.data?.message||e.message||`Đã xảy ra lỗi khi đăng nhập.`})}}function tn(){let e=document.getElementById(`loginPassword`),t=document.getElementById(`toggleLoginPassword`),n=t?.querySelector(`i`);e&&t&&n&&t.addEventListener(`click`,()=>{let r=e.type===`password`;e.type=r?`text`:`password`,n.classList.toggle(`fa-eye`,!r),n.classList.toggle(`fa-eye-slash`,r),t.setAttribute(`aria-label`,r?`Ẩn mật khẩu`:`Hiện mật khẩu`),t.setAttribute(`aria-pressed`,String(r))})}tn();async function nn(){let e=document.querySelectorAll(`.filter-btn`),t=document.querySelectorAll(`.sort-btn`),r=document.getElementById(`filterResults`);if(!r||e.length===0||t.length===0)return;let i=`playlists`,a=`recent`,o={};async function s(){try{let[e,t,r]=await Promise.all([n.get(`https://spotify.f8team.dev/api/search/playlists?q=top&limit=20`),n.get(`https://spotify.f8team.dev/api/search/artists?q=s&limit=20`),n.get(`https://spotify.f8team.dev/api/search/albums?q=a&limit=20`)]);return{playlists:e.data.playlists?.items||[],artists:t.data.artists?.items||[],albums:r.data.albums?.items||[]}}catch(e){return console.error(`Lỗi tải dữ liệu Library:`,e),{playlists:[],artists:[],albums:[]}}}o=await s();function c(){let e=Array.isArray(o[i])?[...o[i]]:[];a===`recent`?e.sort((e,t)=>new Date(t.added_at||0)-new Date(e.added_at||0)):a===`alphabetical`?e.sort((e,t)=>(e.name||``).localeCompare(t.name||``)):a===`creator`&&e.sort((e,t)=>{let n=e.owner?.display_name||e.artists?.[0]?.name||``,r=t.owner?.display_name||t.artists?.[0]?.name||``;return n.localeCompare(r)}),r.innerHTML=e.map(e=>`
          <div
            class="flex flex-col items-center rounded-lg p-3
                   transition-all duration-200 hover:scale-105
                   hover:bg-neutral-800 cursor-pointer"
          >
            <img
              src="${e.images?.[0]?.url||`./src/assets/placeholder.png`}"
              alt="${e.name||``}"
              class="mb-2 h-32 w-32 rounded-lg object-cover"
            />

            <p class="font-semibold">
              ${e.name||`Không có tên`}
            </p>

            <p class="text-sm text-gray-400">
              by ${e.owner?.display_name||e.artists?.[0]?.name||`Unknown`}
            </p>
          </div>
        `).join(``)}e.forEach(t=>{t.addEventListener(`click`,()=>{e.forEach(e=>{e.classList.remove(`bg-green-500`,`text-black`,`font-bold`)}),t.classList.add(`bg-green-500`,`text-black`,`font-bold`),i=t.id.replace(`filter`,``).toLowerCase(),c()})}),t.forEach(e=>{e.addEventListener(`click`,()=>{t.forEach(e=>{e.classList.remove(`bg-green-500`,`text-black`,`font-bold`)}),e.classList.add(`bg-green-500`,`text-black`,`font-bold`),a=e.id.replace(`sort`,``).toLowerCase(),c()})});let l=document.getElementById(`filterPlaylists`),u=document.getElementById(`sortRecent`);l?l.click():c(),u&&u.click()}async function rn(){let e=document.getElementById(`sidebarList`);if(e)try{let t=JSON.parse(localStorage.getItem(`user`)||`null`);if(!t?.id){e.innerHTML=`
        <p class="px-2 py-2 text-sm text-gray-400">
          Đăng nhập để xem playlist
        </p>
      `;return}let r=await n.get(`/api/users/${t.id}/playlists`),i=r.data?.playlists??r.data??[];if(!Array.isArray(i)||i.length===0){e.innerHTML=`
        <p class="px-2 py-2 text-sm text-gray-400">
          Chưa có playlist
        </p>
      `;return}e.innerHTML=i.map(e=>`
          <div
            class="flex items-center gap-3 rounded-md p-2
                   transition-colors hover:bg-neutral-800
                   cursor-pointer"
            data-playlist-id="${e.id}"
          >
            <img
              src="${e.images?.[0]?.url||`./src/assets/placeholder.png`}"
              alt=""
              class="h-10 w-10 shrink-0 rounded object-cover"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                ${e.name||`Playlist không tên`}
              </p>

              <p class="text-xs text-gray-400">
                Playlist
              </p>
            </div>
          </div>
        `).join(``)}catch(t){console.error(`Lỗi tải playlist sidebar:`,t),e.innerHTML=`
      <p class="px-2 py-2 text-sm text-red-400">
        Không thể tải playlist
      </p>
    `}}var an=!1,on=0;function sn(){document.getElementById(`sidebarList`)&&(cn(),!an&&(an=!0,document.addEventListener(`click`,async e=>{let t=e.target.closest(`.fa-plus`)?.closest(`button`);if(t&&(t.closest(`#sidebarList`)||t.closest(`aside`)))try{let e=await n.post(`/api/playlists`,{name:`New Playlist`,description:`Playlist mới tạo`}),t=e.data.playlist||e.data,r=t.id||t._id||t.playlistId;if(!r)throw Error(`Không tìm thấy ID trong phản hồi API`);l(`playlist`,{id:String(r)})}catch(e){console.error(`Lỗi tạo playlist:`,e)}}),document.addEventListener(`click`,async e=>{if(e.target.closest(`#sidebarSearchBtn`)){let e=document.getElementById(`sidebarSearchBox`),t=document.getElementById(`sidebarSearchInput`);if(!e||!t)return;e.classList.toggle(`hidden`),e.classList.contains(`hidden`)||t.focus();return}let t=e.target.closest(`#sidebarList .sidebar-item`);if(t){let e=t.dataset.id;e&&l(`playlist`,{id:String(e)})}}),document.addEventListener(`input`,async e=>{if(!e.target.matches(`#sidebarSearchInput`))return;let t=e.target.value.trim(),r=++on;if(!t)await cn();else try{let e=await n.get(`/api/search/playlists?q=${encodeURIComponent(t)}&limit=20`);if(r!==on)return;ln(e.data.playlists?.items||e.data.playlists||e.data.items||[])}catch(e){r===on&&console.error(`Lỗi search playlist:`,e)}})))}async function cn(){let e=document.getElementById(`sidebarList`);if(e)try{let t=(await n.get(`/api/me/playlists`)).data.playlists||[];if(!document.getElementById(`sidebarList`))return;let r=document.querySelector(`#firstPlaylistBlock`),i=document.querySelector(`#podcastBlock`);t.length>0?(r?.classList.add(`hidden`),i?.classList.add(`hidden`),e.innerHTML=t.map(e=>{let t=e.id||e._id||e.playlistId||``,n=e.image_url||e.cover_image_url||e.imageUrl||e.images?.[0]?.url||e.cover?.url||`/CLone_Spotify/playlist.png`,r=e.name||e.title||`Playlist không tên`,i=e.owner?.display_name||e.subtitle||`Bạn`;return`
      <div
        class="sidebar-item flex items-center gap-3 p-2
               hover:bg-neutral-800 rounded cursor-pointer"
        data-type="playlist"
        data-id="${Q(t)}"
      >
        <img
          src="${Q(n)}"
          alt=""
          class="w-10 h-10 rounded object-cover shrink-0"
          onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png'"
        />

        <div class="min-w-0 flex-1">
          <p class="truncate text-white text-sm">
            ${Q(r)}
          </p>

          <p class="truncate text-xs text-gray-400">
            ${Q(i)}
          </p>
        </div>
      </div>
    `}).join(``)):e.innerHTML=``}catch(e){console.error(`Lỗi tải playlist:`,e)}}function ln(e){let t=document.getElementById(`sidebarList`);t&&(t.innerHTML=!Array.isArray(e)||e.length===0?`
      <p class="px-3 py-4 text-sm text-neutral-400">
        Không tìm thấy playlist.
      </p>
    `:e.map(e=>{let t=e.id||e._id||e.playlistId||``,n=e.image_url||e.cover_image_url||e.images?.[0]?.url||`/CLone_Spotify/playlist.png`,r=e.track_count??e.tracks_count??e.total_tracks??e.tracks?.total??e.tracks?.length,i=e.title||e.name||`Playlist không tên`,a=e.subtitle||e.owner?.display_name||`Playlist`;return`
        <div
          class="sidebar-item flex items-center gap-3 p-2
                 hover:bg-neutral-800 rounded cursor-pointer"
          data-type="playlist"
          data-id="${Q(t)}"
        >
          <img
            src="${Q(n)}"
            alt=""
            class="w-10 h-10 rounded object-cover shrink-0"
            onerror="this.onerror=null;this.src='/CLone_Spotify/playlist.png'"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-white text-sm">
              ${Q(i)}
            </p>

            <p class="truncate text-xs text-gray-400">
              ${Q(a)}
              ${r==null?``:` • ${r} bài hát`}
            </p>
          </div>
        </div>
      `}).join(``))}function Q(e=``){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function un(){try{let[e,t,r,i]=await Promise.all([n.get(`/api/tracks/trending`),n.get(`/api/artists/trending`),n.get(`/api/albums/popular`),n.get(`/api/playlists?limit=50&offset=0`)]);dn(`trendingTracks`,e.data?.tracks,`track`),dn(`trendingArtists`,t.data?.artists,`artist`),dn(`popularAlbums`,r.data?.albums,`album`);let a=i.data;dn(`allPlaylists`,Array.isArray(a)?a:a?.playlists?.items??a?.playlists??a?.items??a?.data?.playlists??a?.data?.items??[],`playlist`)}catch(e){console.error(`Lỗi tải giao diện trang chủ:`,e)}}function dn(e,t=[],n){let r=document.getElementById(e);r?Array.isArray(t)?r.innerHTML=t.map(e=>{let t=e.id??e.artistId??e._id??e.playlistId,r=e.title||e.name||e.album_title||e.albumName||`Unknown`,i=e.cover_image_url||e.image_url||e.album_cover_image_url||e.images?.[0]?.url||`/CLone_Spotify/playlist.png`,a=n===`artist`?`${Number(e.monthly_listeners||0).toLocaleString()} người nghe/tháng`:e.artist_name||e.artist||e.owner?.display_name||e.owner?.name||e.publisher||``,o=String(t??``),s=hn(r),c=hn(i),l=hn(a),u=``;return o&&(u=`onclick="window.openDetail('${n}', '${gn(o)}')"`),`
        <div
          class="flex-shrink-0 w-44 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          ${u}
        >
          <img
            src="${c}"
            class="w-full h-44 object-cover rounded mb-2"
            alt="${s}"
            loading="lazy"
          />

          <p class="text-white text-sm font-semibold truncate">
            ${s}
          </p>

          <p class="text-xs text-gray-400 truncate">
            ${l}
          </p>
        </div>
      `}).join(``):(console.warn(`Dữ liệu ${n} không hợp lệ:`,t),r.innerHTML=``):console.warn(`Không tìm thấy phần tử #${e}`)}var fn=!1,pn=null;async function mn(){let e=document.querySelector(`#player-container`);if(!e)console.error(`Không tìm thấy #player-container`);else if(!(fn&&e.querySelector(`audio`)))return pn||(pn=(async()=>{try{if(!e.querySelector(`audio`)){let t=await fetch(`/CLone_Spotify/player.html`);if(!t.ok)throw Error(`Không tải được player.html: ${t.status}`);e.innerHTML=await t.text()}fn||(Fe(),fn=!0,document.dispatchEvent(new Event(`playerloaded`)))}catch(e){console.error(`Lỗi khởi tạo player:`,e)}finally{pn=null}})(),pn)}function hn(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function gn(e){return String(e??``).replace(/\\/g,`\\\\`).replace(/'/g,`\\'`).replace(/"/g,`\\"`).replace(/\n/g,`\\n`).replace(/\r/g,`\\r`)}window.openTrack=e=>{e==null||e===``?console.error(`Không tìm thấy ID bài hát`):l(`track`,{id:String(e)})},window.goHome=()=>{l(`home`)};function _n(e,t){let n=document.getElementById(e);n?n.scrollBy({left:t*400,behavior:`smooth`}):console.warn(`Không tìm thấy phần tử #${e}`)}window.scrollSection=_n;function vn(){let e=document.querySelector(`#loginForm`);e&&!e.dataset.initialized&&(e.dataset.initialized=`true`,e.addEventListener(`submit`,e=>{e.preventDefault(),en(e.target.email.value,e.target.password.value)}));let t=document.querySelector(`#registerForm`);t&&!t.dataset.initialized&&(t.dataset.initialized=`true`,t.addEventListener(`submit`,e=>{e.preventDefault(),Zt(e.target.email.value,e.target.password.value)}));let n=document.querySelector(`#logoutBtn`);n&&!n.dataset.initialized&&(n.dataset.initialized=`true`,n.addEventListener(`click`,e=>{e.preventDefault(),Wt()}));let r=document.querySelector(`#userAvatar`);r&&!r.dataset.initialized&&(r.dataset.initialized=`true`,r.addEventListener(`click`,()=>Wt()))}function yn(){mn(),qt(),Xt(),Jt(),vn(),ct(),at(),document.querySelector(`#sidebarList`)&&(sn(),nn(),rn());let e=window.location.pathname.split(`/`).pop().replace(/\.html$/,``),t=new URLSearchParams(window.location.search).get(`id`);switch(e){case`home`:un();break;case`allalbum`:ee();break;case`track`:t&&ut(t);break;case`artist`:t&&mt(t);break;case`album`:t&&St(t);break;case`playlist`:t&&kt(t)}}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,yn,{once:!0}):yn(),document.addEventListener(`pagechanged`,async e=>{let{page:t,params:n}=e.detail||{},r=n?.id||new URLSearchParams(window.location.search).get(`id`);switch(document.getElementById(`sidebarList`)&&(sn(),rn()),t){case`home`:un();break;case`track`:r&&await ut(r);break;case`artist`:r&&await mt(r);break;case`album`:r&&await St(r);break;case`playlist`:r?await kt(r):console.error(`Router không truyền ID playlist:`,e.detail);break;case`alltrack`:await P();break;case`allartist`:await ce();break;case`allalbum`:await ee();break;case`allplaylist`:await ye();break;case`search`:await initSearchPage()}}),window.openDetail=function(e,t){t&&([`track`,`artist`,`album`,`playlist`].includes(e)?l(e,{id:String(t)}):console.error(`Loại trang không hợp lệ:`,e))},document.getElementById(`openSearchPageBtn`)?.addEventListener(`click`,e=>{e.preventDefault(),l(`search`)});var $=document.getElementById(`mobileMenuBtn`),bn=document.getElementById(`mobileMenu`);$?.addEventListener(`click`,()=>{let e=bn.classList.contains(`hidden`);bn.classList.toggle(`hidden`),$.setAttribute(`aria-expanded`,String(e)),$.innerHTML=e?`<i class="fa-solid fa-xmark"></i>`:`<i class="fa-solid fa-bars"></i>`}),bn?.querySelectorAll(`a, button`).forEach(e=>{e.addEventListener(`click`,()=>{bn.classList.add(`hidden`),$?.setAttribute(`aria-expanded`,`false`),$&&($.innerHTML=`<i class="fa-solid fa-bars"></i>`)})});export{ce as i,Fe as n,ye as r,P as t};