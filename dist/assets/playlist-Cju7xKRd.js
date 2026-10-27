import{i as e}from"./header-F1TId91I.js";import{n as t}from"./player-BtNM4bws.js";var n=[],r=null,i=0,a=0,o="..`${import.meta.env.BASE_URL}playlist.png`";async function s(e){let t=new URLSearchParams(window.location.search),o=e||t.get(`id`)||document.querySelector(`[data-playlist-id]`)?.dataset.playlistId;if(!o){console.error(`[Playlist:init] Không tìm thấy ID playlist`);return}r=String(o),n=[];let s=++a;i++,document.body.dataset.playlistId=r,p(),await c(r,s)}async function c(t,r=++a){try{let i=await e.get(`/api/playlists/${encodeURIComponent(t)}`);if(r!==a)return;let s=i.data,c=document.querySelector(`#detailImage`),p=document.querySelector(`#detailName`),m=document.querySelector(`#detailDesc`);c&&(c.src=s.image_url||o),p&&(p.textContent=s.title||s.name||`Playlist`),m&&(m.textContent=s.additional_info?.description||s.description||``);let h=null;try{h=JSON.parse(localStorage.getItem(`user`)||`null`)}catch{h=null}let g=h?.name,_=s.is_owner===!0||s.owner?.display_name===g||s.additional_info?.creator_name===g,v=document.querySelector(`#deleteBtn`);v&&v.classList.toggle(`hidden`,!_);let y=l(s);if(y.length===0)try{let n=await e.get(`/api/playlists/${encodeURIComponent(t)}/tracks`);if(r!==a)return;let i=n.data;y=Array.isArray(i)?i:i?.tracks??i?.items??i?.results?.tracks??i?.results??i?.data?.tracks??i?.data?.items??[],Array.isArray(y)||(y=[])}catch(e){if(r!==a)return;console.error(`[API tracks] Không tải được danh sách:`,{status:e.response?.status,data:e.response?.data,message:e.message})}if(r!==a)return;n=y.map(u),d(n,_),document.querySelector(`#toggleLibraryBtn`),f(_)}catch(e){if(r!==a)return;console.error(`[Playlist:load] Lỗi tải playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message})}}function l(e){let t=e?.tracks??e?.items??e?.results?.tracks??[];return Array.isArray(t)?t:Array.isArray(t?.items)?t.items:Array.isArray(t?.data)?t.data:[]}function u(e){let t=e?.track||e||{};return{id:t.track_id||t.id||t._id||t.trackId||``,title:t.track_title||t.title||t.name||`Không rõ tên`,artist:t.artist_name||t.subtitle||t.artist?.name||t.artist||``,album:t.album_title||t.album?.name||t.album||``,duration:Number(t.track_duration??t.duration??(t.duration_ms==null?0:t.duration_ms/1e3)),image_url:t.track_image_url||t.image_url||t.album_cover_image_url||t.album?.image_url||o,audio_url:t.track_audio_url||t.audio_url||t.preview_url||``}}function d(i,a=!1){let o=document.querySelector(`#trackList`);o?i.length?(o.innerHTML=i.map((e,t)=>`
        <div
          class="track-row flex w-full items-center justify-between gap-3 rounded p-3 hover:bg-neutral-800"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            data-track-index="${t}"
          >
            <span class="text-gray-400">${t+1}</span>

            <img
              src="${_(e.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <span class="min-w-0">
              <span class="block truncate text-white">
                ${_(e.title)}
              </span>
              <span class="block truncate text-sm text-gray-400">
                ${_(e.artist)}
              </span>
            </span>
          </button>

          <span class="shrink-0 text-xs text-gray-400">
            ${g(e.duration)}
          </span>

          ${a?`
                <button
                  type="button"
                  class="remove-track-btn rounded-full px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                  data-track-index="${t}"
                  title="Xóa khỏi playlist"
                  aria-label="Xóa ${_(e.title)} khỏi playlist"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `:``}
        </div>
      `).join(``),o.querySelectorAll(`[data-track-index]:not(.remove-track-btn)`).forEach(e=>{e.addEventListener(`click`,()=>{let r=Number(e.dataset.trackIndex),i=n[r];i&&(i.audio_url?(window.playlist=n,t(r)):console.warn(`Bài hát chưa có audio_url hoặc preview_url:`,i))})}),o.querySelectorAll(`.remove-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{if(!a)return;let i=r,o=Number(t.dataset.trackIndex),s=n[o];if(!i||!s?.id)console.error(`Thiếu ID playlist hoặc bài hát`,{playlistId:i,track:s});else if(window.confirm(`Bạn có chắc muốn xóa "${s.title}" khỏi playlist này không?`)){t.disabled=!0,t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`;try{await e.delete(`/api/playlists/${encodeURIComponent(i)}/tracks/${encodeURIComponent(s.id)}`),i===r&&await c(i)}catch(e){console.error(`Lỗi xóa bài hát khỏi playlist:`,e),console.error(`Backend response:`,e.response?.data),t.disabled=!1,t.innerHTML=`<i class="fa-solid fa-trash-can"></i>`,window.alert(e.response?.data?.message||`Không thể xóa bài hát. Hãy kiểm tra API backend.`)}}})})):o.innerHTML=`
      <p class="px-3 py-5 text-sm text-gray-400">
        Playlist này chưa có bài hát nào.
      </p>
    `:console.error(`[renderTrackList] Không tìm thấy #trackList`)}function f(i){let a=document.querySelector(`#playBtn`),o=document.querySelector(`#toggleLibraryBtn`),s=document.querySelector(`#deleteBtn`);a&&a.dataset.initialized!==`true`&&(a.dataset.initialized=`true`,a.addEventListener(`click`,()=>{let e=n;if(!e.length){console.warn(`Playlist chưa có bài hát để phát`);return}let r=e.findIndex(e=>!!e.audio_url);r===-1?console.warn(`Không có bài hát nào có audio_url hoặc preview_url`):(window.playlist=e,t(r))})),o&&o.dataset.initialized!==`true`&&(o.dataset.initialized=`true`,o.addEventListener(`click`,async()=>{let t=r;if(t)try{o.textContent.includes(`Save`)?(await e.post(`/api/playlists/${encodeURIComponent(t)}/followers`),t===r&&(o.textContent=`Remove from Your Library`)):(await e.delete(`/api/playlists/${encodeURIComponent(t)}/followers`),t===r&&(o.textContent=`Save to Your Library`))}catch(e){console.error(`Lỗi cập nhật thư viện:`,e),console.error(`Backend response:`,e.response?.data)}})),s&&s.dataset.initialized!==`true`&&(s.dataset.initialized=`true`,s.addEventListener(`click`,async()=>{if(!i)return;let t=r;if(t&&window.confirm(`Bạn có chắc muốn xóa playlist này không?`))try{await e.delete(`/api/playlists/${encodeURIComponent(t)}`),t===r&&(typeof window.goHome==`function`?window.goHome():window.location.href=`/CLone_Spotify/home.html`)}catch(e){console.error(`Lỗi xóa playlist:`,e),console.error(`Backend response:`,e.response?.data)}}))}function p(){let t=document.querySelector(`#playlistTrackSearch`);t&&t.dataset.initialized!==`true`&&(t.dataset.initialized=`true`,t.addEventListener(`input`,async t=>{let n=t.target.value.trim(),r=++i;if(!n)document.querySelector(`#trackSearchResults`)?.replaceChildren();else try{let t=await e.get(`/api/search?q=${encodeURIComponent(n)}&type=track`);if(r!==i)return;h(m(t.data))}catch(e){if(r!==i)return;console.error(`Lỗi API tìm kiếm:`,e),console.error(`Backend response:`,e.response?.data)}}))}function m(e){let t=e?.results;return Array.isArray(t)?t:[t?.tracks?.items,t?.tracks,t?.items,t?.data?.tracks,t?.data?.items,e?.tracks?.items,e?.tracks,e?.items].find(Array.isArray)||[]}function h(t){let n=document.querySelector(`#trackSearchResults`);n&&(!Array.isArray(t)||t.length===0?n.innerHTML=`
      <p class="py-3 text-sm text-gray-400">
        Không tìm thấy bài hát phù hợp.
      </p>
    `:(n.innerHTML=t.map((e,t)=>{let n=u(e),r=e.track_id||e.id||e._id||e.trackId||e.track?.id||e.track?.track_id||n.id||``;return`
        <div class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="${_(n.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-white">
                ${_(n.title)}
              </p>

              <p class="truncate text-sm text-gray-400">
                ${_(n.artist)}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="add-track-btn rounded bg-green-600 px-3 py-1 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            data-track-id="${_(r)}"
          >
            Thêm
          </button>
        </div>
      `}).join(``),n.querySelectorAll(`.add-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=r,i=t.dataset.trackId;if(!n||!i)console.error(`Thiếu ID playlist hoặc bài hát:`,{playlistId:n,trackId:i});else{t.disabled=!0,t.textContent=`Đang thêm...`;try{await e.post(`/api/playlists/${encodeURIComponent(n)}/tracks`,{track_id:i}),t.textContent=`Đã thêm`,n===r&&await c(n)}catch(e){console.error(`HTTP status:`,e.response?.status),console.error(`Backend response:`,e.response?.data),console.error(`Track ID:`,i),console.error(`Request URL:`,e.config?.url),console.error(`Request body:`,e.config?.data),t.disabled=!1,t.textContent=`Thử lại`}}})})))}function g(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}function _(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{s as t};