import{i as e}from"./header-Dh-pTS38.js";import{n as t}from"./player-B77JGl4t.js";var n=null,r=[],i=null,a=0,o=0,s=`/CLone_Spotify/playlist.png`;async function c(e){let t=new URLSearchParams(window.location.search),s=e||t.get(`id`)||document.querySelector(`[data-playlist-id]`)?.dataset.playlistId;if(!s){console.error(`[Playlist:init] Không tìm thấy ID playlist`);return}i=String(s),n=null,r=[];let c=++o;a++,document.body.dataset.playlistId=i,m(),await l(i,c)}async function l(t,i=++o){try{let a=await e.get(`/api/playlists/${encodeURIComponent(t)}`);if(i!==o)return;let c=a.data;n=c;let l=document.querySelector(`#detailImage`),m=document.querySelector(`#detailName`),h=document.querySelector(`#detailDesc`);l&&(l.src=c.image_url||s),m&&(m.textContent=c.title||c.name||`Playlist`),h&&(h.textContent=c.additional_info?.description||c.description||``);let g=null;try{g=JSON.parse(localStorage.getItem(`user`)||`null`)}catch{g=null}let _=g?.id,v=c.is_owner===!0||_!=null&&[c.owner?.id,c.owner_id,c.user_id,c.created_by].some(e=>e!=null&&String(e)===String(_)),y=document.querySelector(`#deleteBtn`);y&&y.classList.toggle(`hidden`,!v);let b=u(c);if(b.length===0)try{let n=await e.get(`/api/playlists/${encodeURIComponent(t)}/tracks`);if(i!==o)return;let r=n.data;b=Array.isArray(r)?r:r?.tracks??r?.items??r?.results?.tracks??r?.results??r?.data?.tracks??r?.data?.items??[],Array.isArray(b)||(b=[])}catch(e){if(i!==o)return;console.error(`[API tracks] Không tải được danh sách:`,{status:e.response?.status,data:e.response?.data,message:e.message})}if(i!==o)return;r=b.map(d);let S=document.querySelector(`#trackCount`);S&&(S.textContent=`${r.length} bài hát`),f(r,v),x(v),document.querySelector(`#editPlaylistBtn`)?.classList.toggle(`hidden`,!v),p(v)}catch(e){if(i!==o)return;console.error(`[Playlist:load] Lỗi tải playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message})}}function u(e){let t=e?.tracks??e?.items??e?.results?.tracks??[];return Array.isArray(t)?t:Array.isArray(t?.items)?t.items:Array.isArray(t?.data)?t.data:[]}function d(e){let t=e?.track||e||{};return{id:t.track_id||t.id||t._id||t.trackId||``,title:t.track_title||t.title||t.name||`Không rõ tên`,artist:t.artist_name||t.subtitle||t.artist?.name||t.artist||``,album:t.album_title||t.album?.name||t.album||``,duration:Number(t.track_duration??t.duration??(t.duration_ms==null?0:t.duration_ms/1e3)),image_url:t.track_image_url||t.image_url||t.album_cover_image_url||t.album?.image_url||s,audio_url:t.track_audio_url||t.audio_url||t.preview_url||``}}function f(n,a=!1){let o=document.querySelector(`#trackList`);o?n.length?(o.innerHTML=n.map((e,t)=>`
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
              src="${v(e.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <span class="min-w-0">
              <span class="block truncate text-white">
                ${v(e.title)}
              </span>
              <span class="block truncate text-sm text-gray-400">
                ${v(e.artist)}
              </span>
            </span>
          </button>

          <span class="shrink-0 text-xs text-gray-400">
            ${_(e.duration)}
          </span>

          ${a?`
                <button
                  type="button"
                  class="remove-track-btn rounded-full px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                  data-track-index="${t}"
                  title="Xóa khỏi playlist"
                  aria-label="Xóa ${v(e.title)} khỏi playlist"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `:``}
        </div>
      `).join(``),o.querySelectorAll(`[data-track-index]:not(.remove-track-btn)`).forEach(e=>{e.addEventListener(`click`,()=>{let n=Number(e.dataset.trackIndex),i=r[n];i&&(i.audio_url?(window.playlist=r,t(n)):console.warn(`Bài hát chưa có audio_url hoặc preview_url:`,i))})}),o.querySelectorAll(`.remove-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{if(!a)return;let n=i,o=Number(t.dataset.trackIndex),s=r[o];if(!n||!s?.id)console.error(`Thiếu ID playlist hoặc bài hát`,{playlistId:n,track:s});else if(window.confirm(`Bạn có chắc muốn xóa "${s.title}" khỏi playlist này không?`)){t.disabled=!0,t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i>`;try{await e.delete(`/api/playlists/${encodeURIComponent(n)}/tracks/${encodeURIComponent(s.id)}`),n===i&&await l(n)}catch(e){console.error(`Lỗi xóa bài hát khỏi playlist:`,e),console.error(`Backend response:`,e.response?.data),t.disabled=!1,t.innerHTML=`<i class="fa-solid fa-trash-can"></i>`,window.alert(e.response?.data?.message||`Không thể xóa bài hát. Hãy kiểm tra API backend.`)}}})})):o.innerHTML=`
      <p class="px-3 py-5 text-sm text-gray-400">
        Playlist này chưa có bài hát nào.
      </p>
    `:console.error(`[renderTrackList] Không tìm thấy #trackList`)}function p(n){let a=document.querySelector(`#playBtn`),o=document.querySelector(`#toggleLibraryBtn`),s=document.querySelector(`#deleteBtn`);a&&a.dataset.initialized!==`true`&&(a.dataset.initialized=`true`,a.addEventListener(`click`,()=>{let e=r;if(!e.length){console.warn(`Playlist chưa có bài hát để phát`);return}let n=e.findIndex(e=>!!e.audio_url);n===-1?console.warn(`Không có bài hát nào có audio_url hoặc preview_url`):(window.playlist=e,t(n))})),o&&o.dataset.initialized!==`true`&&(o.dataset.initialized=`true`,o.addEventListener(`click`,async()=>{let t=i;if(t)try{o.textContent.includes(`Save`)?(await e.post(`/api/playlists/${encodeURIComponent(t)}/followers`),t===i&&(o.textContent=`Remove from Your Library`)):(await e.delete(`/api/playlists/${encodeURIComponent(t)}/followers`),t===i&&(o.textContent=`Save to Your Library`))}catch(e){console.error(`Lỗi cập nhật thư viện:`,e),console.error(`Backend response:`,e.response?.data)}})),s&&s.dataset.initialized!==`true`&&(s.dataset.initialized=`true`,s.addEventListener(`click`,async()=>{if(!n)return;let t=i;if(t&&window.confirm(`Bạn có chắc muốn xóa playlist này không?`)){s.disabled=!0;try{await e.delete(`/api/playlists/${encodeURIComponent(t)}`),window.location.assign(`/CLone_Spotify/home.html`)}catch(e){console.error(`Lỗi xóa playlist:`,e),console.error(`Backend response:`,e.response?.data),window.alert(e.response?.data?.message||`Không thể xóa playlist. Vui lòng thử lại.`)}finally{s.disabled=!1}}}))}function m(){let t=document.querySelector(`#playlistTrackSearch`);t&&t.dataset.initialized!==`true`&&(t.dataset.initialized=`true`,t.addEventListener(`input`,async t=>{let n=t.target.value.trim(),r=++a;if(!n)document.querySelector(`#trackSearchResults`)?.replaceChildren();else try{let t=await e.get(`/api/search?q=${encodeURIComponent(n)}&type=track`);if(r!==a)return;g(h(t.data))}catch(e){if(r!==a)return;console.error(`Lỗi API tìm kiếm:`,e),console.error(`Backend response:`,e.response?.data)}}))}function h(e){let t=e?.results;return Array.isArray(t)?t:[t?.tracks?.items,t?.tracks,t?.items,t?.data?.tracks,t?.data?.items,e?.tracks?.items,e?.tracks,e?.items].find(Array.isArray)||[]}function g(t){let n=document.querySelector(`#trackSearchResults`);n&&(!Array.isArray(t)||t.length===0?n.innerHTML=`
      <p class="py-3 text-sm text-gray-400">
        Không tìm thấy bài hát phù hợp.
      </p>
    `:(n.innerHTML=t.map((e,t)=>{let n=d(e),r=e.track_id||e.id||e._id||e.trackId||e.track?.id||e.track?.track_id||n.id||``;return`
        <div class="flex items-center justify-between gap-3 rounded p-2 hover:bg-neutral-800">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="${v(n.image_url)}"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-white">
                ${v(n.title)}
              </p>

              <p class="truncate text-sm text-gray-400">
                ${v(n.artist)}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="add-track-btn rounded bg-green-600 px-3 py-1 text-sm font-semibold hover:bg-green-500 disabled:opacity-50"
            data-track-id="${v(r)}"
          >
            Thêm
          </button>
        </div>
      `}).join(``),n.querySelectorAll(`.add-track-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=i,r=t.dataset.trackId;if(!n||!r)console.error(`Thiếu ID playlist hoặc bài hát:`,{playlistId:n,trackId:r});else{t.disabled=!0,t.textContent=`Đang thêm...`;try{await e.post(`/api/playlists/${encodeURIComponent(n)}/tracks`,{track_id:r}),t.textContent=`Đã thêm`,n===i&&await l(n)}catch(e){console.error(`HTTP status:`,e.response?.status),console.error(`Backend response:`,e.response?.data),console.error(`Track ID:`,r),console.error(`Request URL:`,e.config?.url),console.error(`Request body:`,e.config?.data),t.disabled=!1,t.textContent=`Thử lại`}}})})))}function _(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return`0:00`;let n=Math.floor(t/60),r=Math.floor(t%60);return`${n}:${String(r).padStart(2,`0`)}`}function v(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var y=null,b=null;function x(t){let r=document.querySelector(`#changeImageBtn`),a=document.querySelector(`#playlistImageInput`),o=document.querySelector(`#detailImage`),c=document.querySelector(`#editPlaylistImagePreview`),l=document.querySelector(`#editPlaylistForm`),u=document.querySelector(`#editPlaylistName`),d=document.querySelector(`#selectPlaylistImageBtn`),f=document.querySelector(`#savePlaylistBtn`),p=[document.querySelector(`#cancelEditPlaylistBtn`),document.querySelector(`#cancelEditPlaylistBtnSecondary`)].filter(Boolean),m=document.querySelector(`#editPlaylistError`);if(!r||!l)return;if(r.classList.toggle(`hidden`,!t),!t){l.classList.add(`hidden`);return}function h(e=``){m&&(m.textContent=e,m.classList.toggle(`hidden`,!e))}function g(){return n?.title||n?.name||``}function _(){return n?.image_url||n?.cover_image_url||s}function v(){u&&(u.value=g()),b=_(),o&&(o.src=b),c&&(c.src=b),l.classList.remove(`hidden`),h(``),u?.focus()}function x(){l.classList.add(`hidden`),u&&(u.value=g()),y&&=(URL.revokeObjectURL(y),null),o&&(o.src=b||_()),c&&(c.src=b||_()),a&&(a.value=``),h(``)}r.dataset.editBound!==`true`&&(r.dataset.editBound=`true`,r.addEventListener(`click`,v)),d&&d.dataset.editBound!==`true`&&(d.dataset.editBound=`true`,d.addEventListener(`click`,()=>a?.click())),a&&a.dataset.editBound!==`true`&&(a.dataset.editBound=`true`,a.addEventListener(`change`,()=>{let e=a.files?.[0];e&&([`image/jpeg`,`image/png`,`image/webp`].includes(e.type)?e.size>5242880?(h(`Ảnh không được vượt quá 5 MB.`),a.value=``):(y&&URL.revokeObjectURL(y),y=URL.createObjectURL(e),o&&(o.src=y),c&&(c.src=y),l.classList.remove(`hidden`),h(``)):(h(`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`),a.value=``))})),p.forEach(e=>{e.dataset.editBound!==`true`&&(e.dataset.editBound=`true`,e.addEventListener(`click`,x))}),f&&f.dataset.editBound!==`true`&&(f.dataset.editBound=`true`,f.addEventListener(`click`,async()=>{let t=u?.value.trim()||``,r=g(),o=a?.files?.[0]||null;if(!t)h(`Vui lòng nhập tên playlist.`),u?.focus();else if(!i)h(`Không tìm thấy ID playlist.`);else if(t===r&&!o)x();else if(!f.disabled){f.disabled=!0,f.textContent=`Đang lưu...`,h(``);try{let r=n?.image_url||n?.imageUrl||``;if(o){let t=new FormData;t.append(`cover`,o);let n=await e.post(`/api/upload/playlist/${encodeURIComponent(i)}/cover`,t);console.log(`Upload response:`,JSON.stringify(n.data,null,2));let a=n.data;if(r=a?.image_url||a?.imageUrl||a?.url||a?.data?.image_url||a?.data?.imageUrl||a?.data?.url||a?.file?.url||``,!r)throw Error(`Upload thành công nhưng không tìm thấy URL ảnh trong phản hồi.`);S(r)}let a={name:t};o&&(a.image_url=r);let s=(await e.put(`/api/playlists/${encodeURIComponent(i)}`,a)).data,c=s?.playlist||s?.data||s;n={...n,...c&&typeof c==`object`?c:{},name:c?.name||t},o&&(n.image_url=c?.image_url||c?.imageUrl||r);let l=document.querySelector(`#detailName`);l&&(l.textContent=n.name),u&&(u.value=n.name);let d=document.querySelector(`#playlistCover, #detailImage, #playlistImage`);d&&n.image_url&&(d.src=n.image_url),x()}catch(e){console.error(`Lỗi lưu playlist:`,{status:e.response?.status,data:e.response?.data,message:e.message}),h(e.response?.data?.error?.message||e.response?.data?.message||e.message||`Không thể cập nhật playlist. Vui lòng thử lại.`)}finally{f.disabled=!1,f.textContent=`Lưu`}}}))}function S(e){e&&([`#playlistCover`,`#detailImage`,`#playlistImage`].forEach(t=>{document.querySelectorAll(t).forEach(t=>{t.src=e})}),n&&(n.image_url=e,n.imageUrl=e))}export{c as t};