import{i as e}from"./header-Dh-pTS38.js";import{n as t}from"./player-B77JGl4t.js";var n=!1,r=!1,i=null,a=[],o=null,s=0,c=0,l=`/CLone_Spotify/playlist.png`,u=10,d=1;async function f(e){let t=new URLSearchParams(window.location.search),r=e||t.get(`id`)||document.querySelector(`[data-playlist-id]`)?.dataset.playlistId;if(!r){console.error(`[Playlist:init] Không tìm thấy ID playlist`);return}o=String(r),i=null,a=[],n=!1,D();let l=++c;s++,document.body.dataset.playlistId=o,v(),await p(o,l)}async function p(t,n=++c){try{let r=await e.get(`/api/playlists/${encodeURIComponent(t)}`);if(n!==c)return;let o=r.data;i=o;let s=document.querySelector(`#detailImage`),u=document.querySelector(`#detailName`),f=document.querySelector(`#detailDesc`);if(s){let e=o.image_url||o.cover_image_url||o.cover_url||o.thumbnail_url||o.imageUrl||o.image||o.cover?.url||o.images?.[0]?.url||o.images?.[0]||l;s.onerror=()=>{console.error(`Không tải được ảnh playlist:`,s.src),s.onerror=null,s.src=l},s.src=e}u&&(u.textContent=o.title||o.name||`Playlist`),f&&(f.textContent=o.additional_info?.description||o.description||``);let p=null;try{p=JSON.parse(localStorage.getItem(`user`)||`null`)}catch{p=null}let v=p?.id,y=o.is_owner===!0||v!=null&&[o.owner?.id,o.owner_id,o.user_id,o.created_by].some(e=>e!=null&&String(e)===String(v)),b=document.querySelector(`#toggleLibraryBtn`);b&&b.classList.toggle(`hidden`,v==null||y),D();let x=document.querySelector(`#deleteBtn`);x&&x.classList.toggle(`hidden`,!y);let S=m(o);if(S.length===0)try{let r=await e.get(`/api/playlists/${encodeURIComponent(t)}/tracks`);if(n!==c)return;let i=r.data;S=Array.isArray(i)?i:i?.tracks??i?.items??i?.results?.tracks??i?.results??i?.data?.tracks??i?.data?.items??[],Array.isArray(S)||(S=[])}catch(e){if(n!==c)return;console.error(`[API tracks] Không tải được danh sách:`,{status:e.response?.status,data:e.response?.data,message:e.message})}if(n!==c)return;a=S.map(h);let C=document.querySelector(`#trackCount`);C&&(C.textContent=`${a.length} bài hát`),d=1,g(a,y),k(),T(y),document.querySelector(`#editPlaylistBtn`)?.classList.toggle(`hidden`,!y),_(y)}catch(e){if(n!==c)return;console.error(`[Playlist:load] Lỗi tải playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message})}}function m(e){let t=e?.tracks??e?.items??e?.results?.tracks??[];return Array.isArray(t)?t:Array.isArray(t?.items)?t.items:Array.isArray(t?.data)?t.data:[]}function h(e){let t=e?.track||e||{};return{id:t.track_id||t.id||t._id||t.trackId||``,title:t.track_title||t.title||t.name||`Không rõ tên`,artist:t.artist_name||t.subtitle||t.artist?.name||t.artist||``,album:t.album_title||t.album?.name||t.album||``,duration:Number(t.track_duration??t.duration??(t.duration_ms==null?0:t.duration_ms/1e3)),image_url:t.track_image_url||t.image_url||t.album_cover_image_url||t.album?.image_url||l,audio_url:t.track_audio_url||t.audio_url||t.preview_url||``}}function g(n,r=!1){let i=document.querySelector(`#trackList`);i?n.length?(i.innerHTML=n.map((e,t)=>`
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
              src="${S(e.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <span class="min-w-0">
              <span class="block truncate text-white">
                ${S(e.title)}
              </span>
              <span class="block truncate text-sm text-gray-400">
                ${S(e.artist)}
              </span>
            </span>
          </button>

          <span class="shrink-0 text-xs text-gray-400">
            ${x(e.duration)}
          </span>

          ${r?`
                <button
                  type="button"
                  class="remove-track-btn rounded-full px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                  data-track-index="${t}"
                  title="Xóa khỏi playlist"
                  aria-label="Xóa ${S(e.title)} khỏi playlist"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `:``}
        </div>
      `).join(``),i.querySelectorAll(`[data-track-index]:not(.remove-track-btn)`).forEach(e=>{e.addEventListener(`click`,()=>{let n=Number(e.dataset.trackIndex),r=a[n];r&&(r.audio_url?(window.playlist=a,t(n)):console.warn(`Bài hát chưa có audio_url hoặc preview_url:`,r))})}),i.querySelectorAll(`.remove-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{if(!r)return;let n=o,i=Number(t.dataset.trackIndex),s=a[i];if(!n||!s?.id)console.error(`Thiếu ID playlist hoặc bài hát`,{playlistId:n,track:s});else if(window.confirm(`Bạn có chắc muốn xóa "${s.title}" khỏi playlist này không?`)){t.disabled=!0,t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`;try{await e.delete(`/api/playlists/${encodeURIComponent(n)}/tracks/${encodeURIComponent(s.id)}`),n===o&&await p(n)}catch(e){console.error(`Lỗi xóa bài hát khỏi playlist:`,e),console.error(`Backend response:`,e.response?.data),t.disabled=!1,t.innerHTML=`<i class="fa-solid fa-trash-can"></i>`,window.alert(e.response?.data?.message||`Không thể xóa bài hát. Hãy kiểm tra API backend.`)}}})}),O()):(i.innerHTML=`
    <p class="px-3 py-5 text-sm text-gray-400">
      Playlist này chưa có bài hát nào.
    </p>
  `,document.querySelector(`#trackPagination`)?.replaceChildren(),d=1):console.error(`[renderTrackList] Không tìm thấy #trackList`)}function _(i){let s=document.querySelector(`#playBtn`),c=document.querySelector(`#toggleLibraryBtn`),l=document.querySelector(`#deleteBtn`);s&&s.dataset.initialized!==`true`&&(s.dataset.initialized=`true`,s.addEventListener(`click`,()=>{let e=a;if(!e.length){console.warn(`Playlist chưa có bài hát để phát`);return}let n=e.findIndex(e=>!!e.audio_url);n===-1?console.warn(`Không có bài hát nào có audio_url hoặc preview_url`):(window.playlist=e,t(n))})),c&&c.dataset.initialized!==`true`&&(c.dataset.initialized=`true`,c.addEventListener(`click`,async()=>{let t=o;if(!t||r)return;let i=n;r=!0,c.disabled=!0;try{i?(await e.delete(`/api/playlists/${encodeURIComponent(t)}/follow`),n=!1):(await e.post(`/api/playlists/${encodeURIComponent(t)}/follow`),n=!0),D()}catch(e){n=i,console.error(`Lỗi theo dõi playlist:`,e),console.error(`Backend response:`,e.response?.data),window.alert(e.response?.data?.message||`Không thể cập nhật trạng thái theo dõi playlist.`)}finally{r=!1,c.disabled=!1}})),l&&l.dataset.initialized!==`true`&&(l.dataset.initialized=`true`,l.addEventListener(`click`,async()=>{if(!i)return;let t=o;if(t&&window.confirm(`Bạn có chắc muốn xóa playlist này không?`)){l.disabled=!0;try{await e.delete(`/api/playlists/${encodeURIComponent(t)}`),window.location.assign(`/CLone_Spotify/home.html`)}catch(e){console.error(`Lỗi xóa playlist:`,e),console.error(`Backend response:`,e.response?.data),window.alert(e.response?.data?.message||`Không thể xóa playlist. Vui lòng thử lại.`)}finally{l.disabled=!1}}}))}function v(){let t=document.querySelector(`#playlistTrackSearch`);t&&t.dataset.initialized!==`true`&&(t.dataset.initialized=`true`,t.addEventListener(`input`,async t=>{let n=t.target.value.trim(),r=++s;if(!n)document.querySelector(`#trackSearchResults`)?.replaceChildren();else try{let t=await e.get(`/api/search?q=${encodeURIComponent(n)}&type=track`);if(r!==s)return;b(y(t.data))}catch(e){if(r!==s)return;console.error(`Lỗi API tìm kiếm:`,e),console.error(`Backend response:`,e.response?.data)}}))}function y(e){let t=e?.results;return Array.isArray(t)?t:[t?.tracks?.items,t?.tracks,t?.items,t?.data?.tracks,t?.data?.items,e?.tracks?.items,e?.tracks,e?.items].find(Array.isArray)||[]}function b(t){let n=document.querySelector(`#trackSearchResults`);n&&(!Array.isArray(t)||t.length===0?n.innerHTML=`
      <p class="py-3 text-sm text-gray-400">
        Không tìm thấy bài hát phù hợp.
      </p>
    `:(n.innerHTML=t.map((e,t)=>{let n=h(e),r=e.track_id||e.id||e._id||e.trackId||e.track?.id||e.track?.track_id||n.id||``;return`
        <div class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="${S(n.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-white">
                ${S(n.title)}
              </p>

              <p class="truncate text-sm text-gray-400">
                ${S(n.artist)}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="add-track-btn rounded bg-green-600 px-3 py-1 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            data-track-id="${S(r)}"
          >
            Thêm
          </button>
        </div>
      `}).join(``),n.querySelectorAll(`.add-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=o,r=t.dataset.trackId;if(!n||!r)console.error(`Thiếu ID playlist hoặc bài hát:`,{playlistId:n,trackId:r});else{t.disabled=!0,t.textContent=`Đang thêm...`;try{await e.post(`/api/playlists/${encodeURIComponent(n)}/tracks`,{track_id:r}),t.textContent=`Đã thêm`,n===o&&await p(n)}catch(e){console.error(`HTTP status:`,e.response?.status),console.error(`Backend response:`,e.response?.data),console.error(`Track ID:`,r),console.error(`Request URL:`,e.config?.url),console.error(`Request body:`,e.config?.data),t.disabled=!1,t.textContent=`Thử lại`}}})})))}function x(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}function S(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var C=null,w=null;function T(t){let n=document.querySelector(`#changeImageBtn`),r=document.querySelector(`#playlistImageInput`),a=document.querySelector(`#detailImage`),s=document.querySelector(`#editPlaylistImagePreview`),c=document.querySelector(`#editPlaylistForm`),u=document.querySelector(`#editPlaylistName`),d=document.querySelector(`#selectPlaylistImageBtn`),f=document.querySelector(`#savePlaylistBtn`),p=[document.querySelector(`#cancelEditPlaylistBtn`),document.querySelector(`#cancelEditPlaylistBtnSecondary`)].filter(Boolean),m=document.querySelector(`#editPlaylistError`);if(!n||!c)return;if(n.classList.toggle(`hidden`,!t),!t){c.classList.add(`hidden`);return}function h(e=``){m&&(m.textContent=e,m.classList.toggle(`hidden`,!e))}function g(){return i?.title||i?.name||``}function _(){return i?.image_url||i?.cover_image_url||i?.cover_url||i?.thumbnail_url||i?.imageUrl||i?.image||i?.cover?.url||i?.images?.[0]?.url||i?.images?.[0]||l}function v(){u&&(u.value=g()),w=_(),a&&(a.src=w),s&&(s.src=w),c.classList.remove(`hidden`),h(``),u?.focus()}function y(){c.classList.add(`hidden`),u&&(u.value=g()),C&&=(URL.revokeObjectURL(C),null),a&&(a.src=w||_()),s&&(s.src=w||_()),r&&(r.value=``),h(``)}n.dataset.editBound!==`true`&&(n.dataset.editBound=`true`,n.addEventListener(`click`,v)),d&&d.dataset.editBound!==`true`&&(d.dataset.editBound=`true`,d.addEventListener(`click`,()=>r?.click())),r&&r.dataset.editBound!==`true`&&(r.dataset.editBound=`true`,r.addEventListener(`change`,()=>{let e=r.files?.[0];e&&([`image/jpeg`,`image/png`,`image/webp`].includes(e.type)?e.size>5242880?(h(`Ảnh không được vượt quá 5 MB.`),r.value=``):(C&&URL.revokeObjectURL(C),C=URL.createObjectURL(e),a&&(a.src=C),s&&(s.src=C),c.classList.remove(`hidden`),h(``)):(h(`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`),r.value=``))})),p.forEach(e=>{e.dataset.editBound!==`true`&&(e.dataset.editBound=`true`,e.addEventListener(`click`,y))}),f&&f.dataset.editBound!==`true`&&(f.dataset.editBound=`true`,f.addEventListener(`click`,async()=>{let t=u?.value.trim()||``,n=g(),a=r?.files?.[0]||null;if(!t)h(`Vui lòng nhập tên playlist.`),u?.focus();else if(!o)h(`Không tìm thấy ID playlist.`);else if(t===n&&!a)y();else if(!f.disabled){f.disabled=!0,f.textContent=`Đang lưu...`,h(``);try{let n=i?.image_url||i?.imageUrl||``;if(a){let t=new FormData;t.append(`cover`,a);let r=await e.post(`/api/upload/playlist/${encodeURIComponent(o)}/cover`,t);console.log(`Upload response:`,JSON.stringify(r.data,null,2));let i=r.data;if(n=i?.image_url||i?.imageUrl||i?.url||i?.data?.image_url||i?.data?.imageUrl||i?.data?.url||i?.file?.url||``,!n)throw Error(`Upload thành công nhưng không tìm thấy URL ảnh trong phản hồi.`);E(n)}let r={name:t};a&&(r.image_url=n);let s=(await e.put(`/api/playlists/${encodeURIComponent(o)}`,r)).data,c=s?.playlist||s?.data||s;i={...i,...c&&typeof c==`object`?c:{},name:c?.name||t},a&&(i.image_url=c?.image_url||c?.imageUrl||n);let l=document.querySelector(`#detailName`);l&&(l.textContent=i.name),u&&(u.value=i.name);let d=document.querySelector(`#playlistCover, #detailImage, #playlistImage`);d&&i.image_url&&(d.src=i.image_url),y()}catch(e){console.error(`Lỗi lưu playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message}),h(e.response?.data?.error?.message||e.response?.data?.message||e.message||`Không thể cập nhật playlist. Vui lòng thử lại.`)}finally{f.disabled=!1,f.textContent=`Lưu`}}}))}function E(e){e&&([`#playlistCover`,`#detailImage`,`#playlistImage`].forEach(t=>{document.querySelectorAll(t).forEach(t=>{t.src=e})}),i&&(i.image_url=e,i.imageUrl=e))}function D(){let e=document.querySelector(`#toggleLibraryBtn`),t=document.querySelector(`#followButtonText`),r=e?.querySelector(`i`);e&&t&&(t.textContent=n?`Bỏ theo dõi`:`Theo dõi`,r&&(r.className=n?`fa-solid fa-check mr-2`:`fa-solid fa-plus mr-2`),e.classList.remove(`bg-neutral-700`,`hover:bg-neutral-600`,`text-white`,`bg-green-500`,`hover:bg-green-400`,`text-black`),n?e.classList.add(`bg-green-500`,`hover:bg-green-400`,`text-black`):e.classList.add(`bg-neutral-700`,`hover:bg-neutral-600`,`text-white`))}function O(){let e=document.querySelector(`#trackList`),t=document.querySelector(`#trackPagination`);if(!e||!t)return;let n=Array.from(e.querySelectorAll(`.track-row`)),r=n.length,i=Math.ceil(r/u);if(r<=u){n.forEach(e=>e.classList.remove(`hidden`)),t.innerHTML=``,d=1;return}d=Math.min(Math.max(d,1),i);let a=(d-1)*u,o=a+u;n.forEach((e,t)=>{e.classList.toggle(`hidden`,t<a||t>=o)}),t.innerHTML=`
    <button
      type="button"
      data-page="${d-1}"
      ${d===1?`disabled`:``}
      aria-label="Trang trước"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    ${Array.from({length:i},(e,t)=>{let n=t+1,r=n===d;return`
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
      data-page="${d+1}"
      ${d===i?`disabled`:``}
      aria-label="Trang tiếp theo"
      class="rounded-full bg-neutral-800 px-4 py-2 transition
             hover:bg-neutral-700 disabled:cursor-not-allowed
             disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}function k(){let e=document.querySelector(`#trackPagination`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-page]`);t&&!t.disabled&&(d=Number(t.dataset.page),O(),document.querySelector(`#trackList`)?.scrollIntoView({behavior:`smooth`,block:`start`}))}))}export{f as t};