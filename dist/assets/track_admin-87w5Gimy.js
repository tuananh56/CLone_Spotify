import{t as e}from"./api-C91Bgm76.js";var t=`/api/tracks`,n=`/api/artists`,r=`/api/albums`,i=50,a=10,o=!1,s=1,c=[],l=[],u=``,d=null;function f(){return{uploadProgress:document.getElementById(`trackUploadProgress`),uploadStatus:document.getElementById(`trackUploadStatus`),uploadPercent:document.getElementById(`trackUploadPercent`),uploadBar:document.getElementById(`trackUploadBar`),uploadIcon:document.getElementById(`trackUploadIcon`),tableBody:document.getElementById(`trackTableBody`),total:document.getElementById(`trackTotal`),pagination:document.getElementById(`trackPagination`),paginationInfo:document.getElementById(`trackPaginationInfo`),searchInput:document.getElementById(`trackSearchInput`),refreshBtn:document.getElementById(`trackRefreshBtn`),modal:document.getElementById(`createTrackModal`),form:document.getElementById(`createTrackForm`),openBtn:document.getElementById(`addTrackBtn`),closeBtn:document.getElementById(`closeCreateTrackBtn`),cancelBtn:document.getElementById(`cancelCreateTrackBtn`),title:document.getElementById(`newTrackTitle`),artist:document.getElementById(`newTrackArtist`),album:document.getElementById(`newTrackAlbum`),trackNumber:document.getElementById(`newTrackNumber`),image:document.getElementById(`newTrackImage`),imagePreview:document.getElementById(`newTrackImagePreview`),audio:document.getElementById(`newTrackAudio`),submitBtn:document.getElementById(`submitCreateTrackBtn`)}}function p(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function m(e){alert(e)}function h(e){let t=Number(e);return!Number.isFinite(t)||t<0?`0:00`:`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,`0`)}`}function g(e){return Array.isArray(e?.tracks)?e.tracks:Array.isArray(e?.data?.tracks)?e.data.tracks:Array.isArray(e?.data)?e.data:Array.isArray(e)?e:[]}function _(e){let t=e?.pagination?.total??e?.data?.pagination?.total??e?.total??e?.data?.total;if(t==null)return null;let n=Number(t);return Number.isFinite(n)?n:null}function v(e){return Array.isArray(e?.artists)?e.artists:Array.isArray(e?.data?.artists)?e.data.artists:Array.isArray(e?.data)?e.data:Array.isArray(e)?e:[]}function y(e){return Array.isArray(e?.albums)?e.albums:Array.isArray(e?.data?.albums)?e.data.albums:Array.isArray(e?.data)?e.data:Array.isArray(e)?e:[]}function b(e){return e?.track||e?.data?.track||e?.data||e}async function x(t=null){let{artist:r}=f();if(r){r.innerHTML=`
    <option value="">Đang tải danh sách nghệ sĩ...</option>
  `;try{let a=[],o=0,s=null;for(;;){let t=await e.get(n,{params:{limit:i,offset:o}}),r=v(t.data);if(s===null&&(s=_(t.data)),!r.length||(a.push(...r),o+=r.length,s!==null&&a.length>=s)||r.length<i)break}let c=[...new Map(a.filter(e=>e?.id!=null).map(e=>[String(e.id),e])).values()];r.innerHTML=`
      <option value="">Ẩn danh</option>

      ${c.map(e=>{let n=String(e.id),r=e.name||e.artist_name||e.title||`Chưa có tên`;return`
            <option
              value="${p(n)}"
              ${String(t??``)===n?`selected`:``}
            >
              ${p(r)}
            </option>
          `}).join(``)}
    `,t&&!c.some(e=>String(e.id)===String(t))&&(r.value=``)}catch(e){console.error(`Lỗi tải nghệ sĩ:`,e),r.innerHTML=`
      <option value="">Ẩn danh</option>
    `,m(`Không thể tải danh sách nghệ sĩ.`)}}}async function S(t=null){let{album:n}=f();if(n){n.innerHTML=`
    <option value="">Đang tải danh sách album...</option>
  `;try{let a=[],o=0,s=null;for(;;){let t=await e.get(r,{params:{limit:i,offset:o}}),n=y(t.data);if(s===null&&(s=_(t.data)),!n.length||(a.push(...n),o+=n.length,s!==null&&a.length>=s)||n.length<i)break}let c=[...new Map(a.filter(e=>e?.id!=null).map(e=>[String(e.id),e])).values()];n.innerHTML=`
      <option value="">Chọn album</option>

      ${c.map(e=>{let n=String(e.id),r=e.title||e.name||`Chưa có tên`;return`
            <option
              value="${p(n)}"
              ${String(t??``)===n?`selected`:``}
            >
              ${p(r)}
            </option>
          `}).join(``)}
    `,t&&!c.some(e=>String(e.id)===String(t))&&(n.value=``)}catch(e){console.error(`Lỗi tải danh sách album:`,e),n.innerHTML=`
      <option value="">Không thể tải danh sách album</option>
    `,m(`Không thể tải danh sách album.`)}}}async function C(){let{tableBody:n,total:r}=f();if(n){n.innerHTML=`
    <tr>
      <td colspan="6" class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
        Đang tải danh sách bài hát...
      </td>
    </tr>
  `;try{let n=[],a=0,o=null;for(;;){let r=await e.get(t,{params:{limit:i,offset:a}}),s=g(r.data);if(o===null&&(o=_(r.data)),!s.length||(n.push(...s),a+=s.length,o!==null&&n.length>=o)||s.length<i)break}c=[...new Map(n.filter(e=>e?.id!=null).map(e=>[String(e.id),e])).values()],s=1,w(),r&&(r.textContent=`${c.length.toLocaleString(`vi-VN`)} bài hát`)}catch(e){console.error(`Lỗi tải danh sách track:`,e),n.innerHTML=`
      <tr>
        <td colspan="6" class="py-12 text-center text-red-400">
          Không thể tải danh sách bài hát.

          <button
            id="retryTrackBtn"
            type="button"
            class="underline ml-2"
          >
            Thử lại
          </button>
        </td>
      </tr>
    `,document.getElementById(`retryTrackBtn`)?.addEventListener(`click`,C),r&&(r.textContent=`Lỗi tải dữ liệu`)}}}function w(){let e=u.toLowerCase();l=c.filter(t=>[t.title,t.artist_name,t.album_title].some(t=>String(t||``).toLowerCase().includes(e))),s=1,T(),E();let{total:t}=f();t&&(t.textContent=`${l.length.toLocaleString(`vi-VN`)} bài hát`)}function T(){let{tableBody:e}=f();if(!e)return;let t=(s-1)*a,n=l.slice(t,t+a);e.innerHTML=n.length?n.map((e,n)=>`
        <tr class="border-t border-neutral-700 hover:bg-neutral-700/50">
          <td class="px-5 py-4 text-gray-400">
            ${t+n+1}
          </td>

          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <img
                src="${p(e.image_url||`./playlist.png`)}"
                class="w-12 h-12 rounded object-cover"
                alt=""
                onerror="this.src='./playlist.png'"
              />

              <span class="font-medium">
                ${p(e.title||`Chưa có tên`)}
              </span>
            </div>
          </td>

          <td class="px-5 py-4 text-gray-300">
            ${p(e.artist_name||`Ẩn danh`)}
          </td>

          <td class="px-5 py-4 text-gray-300">
            ${p(e.album_title||`Single`)}
          </td>

          <td class="px-5 py-4 text-gray-400">
            ${Number(e.play_count||0).toLocaleString(`vi-VN`)}
          </td>

          <td class="px-5 py-4 text-right whitespace-nowrap">
            <button
              type="button"
              data-edit-track="${p(e.id)}"
              class="text-yellow-400 hover:text-yellow-300 mr-3"
              title="Chỉnh sửa"
            >
              <i class="fa-solid fa-pen"></i>
            </button>

            <button
              type="button"
              data-delete-track="${p(e.id)}"
              class="text-red-400 hover:text-red-300"
              title="Xóa"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join(``):`
      <tr>
        <td colspan="6" class="py-12 text-center text-gray-400">
          Không tìm thấy bài hát.
        </td>
      </tr>
    `}function E(){let{pagination:e,paginationInfo:t}=f();if(!e)return;let n=l.length,r=Math.ceil(n/a);s>r&&r>0&&(s=r);let i=n?(s-1)*a+1:0,o=Math.min(s*a,n);t&&(t.textContent=`Hiển thị ${i} - ${o} trong ${n} bài hát`),e.innerHTML=r<=1?``:`
    <button
      type="button"
      data-page="${s-1}"
      ${s<=1?`disabled`:``}
      class="px-3 py-2 rounded-lg bg-neutral-700 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <span class="px-3">
      ${s} / ${r}
    </span>

    <button
      type="button"
      data-page="${s+1}"
      ${s>=r?`disabled`:``}
      class="px-3 py-2 rounded-lg bg-neutral-700 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}async function D(n){try{let r=b((await e.get(`${t}/${encodeURIComponent(n)}`)).data);if(!r||!r.id){m(`Không tìm thấy bài hát.`);return}m(`Tên bài hát: ${r.title||`Chưa có`}\nNghệ sĩ: ${r.artist_name||`Ẩn danh`}\nAlbum: ${r.album_title||`Single`}\nThời lượng: ${h(r.duration)}\nLượt nghe: ${r.play_count||0}\nTrack ID: ${r.id}`)}catch(e){console.error(`Lỗi xem track:`,e),m(`Không thể lấy thông tin bài hát.`)}}async function O(n){if(confirm(`Bạn có chắc chắn muốn xóa bài hát này không?`))try{await e.delete(`${t}/${encodeURIComponent(n)}`),c=c.filter(e=>String(e.id)!==String(n)),m(`Xóa bài hát thành công!`),w();let r=Math.ceil(l.length/a);s>r&&r>0&&(s=r),T(),E()}catch(e){console.error(`Lỗi xóa track:`,e),m(e.response?.data?.message||`Không thể xóa bài hát.`)}}async function k(){let{modal:e,form:t,imagePreview:n,submitBtn:r,image:i,uploadProgress:a}=f();e&&(d=null,t?.reset(),n&&(n.src=``,n.classList.add(`hidden`)),i&&(i.value=``),r&&(r.textContent=`Tạo bài hát`,r.disabled=!1),a?.classList.add(`hidden`),e.classList.remove(`hidden`),document.body.style.overflow=`hidden`,await Promise.all([x(),S()]))}function A(){let{modal:e,form:t,imagePreview:n,uploadProgress:r,submitBtn:i}=f();e&&(e.classList.add(`hidden`),document.body.style.overflow=``,t?.reset(),n&&(n.src=``,n.classList.add(`hidden`)),r?.classList.add(`hidden`),i&&(i.disabled=!1,i.textContent=`Tạo bài hát`),d=null)}async function j(n){try{let r=b((await e.get(`${t}/${encodeURIComponent(n)}`)).data);if(!r||!r.id){m(`Không tìm thấy bài hát.`);return}let i=f();d=n,i.form?.reset(),i.title&&(i.title.value=r.title||``),i.trackNumber&&(i.trackNumber.value=r.track_number||1),i.audio&&(i.audio.value=``,i.audio.required=!1),i.image&&(i.image.value=``),i.imagePreview&&(r.image_url?(i.imagePreview.src=r.image_url,i.imagePreview.classList.remove(`hidden`)):(i.imagePreview.src=``,i.imagePreview.classList.add(`hidden`))),i.modal?.classList.remove(`hidden`),document.body.style.overflow=`hidden`,await Promise.all([x(r.artist_id||null),S(r.album_id||null)]),i.submitBtn&&(i.submitBtn.textContent=`Lưu thay đổi`,i.submitBtn.disabled=!1)}catch(e){console.error(`Lỗi lấy track để chỉnh sửa:`,e),m(`Không thể lấy thông tin bài hát để chỉnh sửa.`)}}function M(){let{image:e,imagePreview:t}=f();e&&t&&e.addEventListener(`change`,()=>{let n=e.files?.[0];n?[`image/jpeg`,`image/png`,`image/webp`].includes(n.type)?n.size>5242880?(m(`Ảnh không được vượt quá 5MB.`),e.value=``,t.src=``,t.classList.add(`hidden`)):(t.src=URL.createObjectURL(n),t.classList.remove(`hidden`)):(m(`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`),e.value=``,t.src=``,t.classList.add(`hidden`)):(t.src=``,t.classList.add(`hidden`))})}function N(){let e=f();if(!e.title||!e.artist||!e.album||!e.trackNumber||!e.audio)return m(`Không tìm thấy đầy đủ các trường trong form HTML.`),!1;let t=e.title.value.trim(),n=e.artist.value,r=e.album.value,i=Number(e.trackNumber.value),a=e.audio.files?.[0],o=e.image?.files?.[0]||null;if(!t)return m(`Vui lòng nhập tên bài hát.`),e.title.focus(),!1;if(e.trackNumber.value&&(!Number.isInteger(i)||i<1))return m(`Số thứ tự bài hát phải lớn hơn 0.`),e.trackNumber.focus(),!1;if(!d&&!a)return m(`Vui lòng chọn file nhạc.`),e.audio.focus(),!1;if(a&&!a.type.startsWith(`audio/`))return m(`File được chọn không phải file âm thanh.`),e.audio.value=``,!1;if(o){if(![`image/jpeg`,`image/png`,`image/webp`].includes(o.type))return m(`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`),e.image.value=``,!1;if(o.size>5242880)return m(`Ảnh không được vượt quá 5MB.`),e.image.value=``,!1}return{title:t,artist_id:n||null,album_id:r||null,track_number:i||1,image:o,audio:a||null}}async function P(e){return new Promise((t,n)=>{let r=new Audio,i=URL.createObjectURL(e);r.preload=`metadata`,r.onloadedmetadata=()=>{let e=Math.round(r.duration);URL.revokeObjectURL(i),!Number.isFinite(e)||e<=0?n(Error(`Không xác định được thời lượng audio.`)):t(e)},r.onerror=()=>{URL.revokeObjectURL(i),n(Error(`Không thể đọc thời lượng file audio.`))},r.src=i})}function F(e){return e?.id||e?.track?.id||e?.data?.id||e?.data?.track?.id||e?.result?.id||null}async function I(t,n){let r=new FormData;return r.append(`audio`,n),e.post(`/api/upload/track/${encodeURIComponent(t)}/audio`,r,{onUploadProgress(e){if(!e.total)return;let t=Math.round(e.loaded/e.total*100);B(t,`Đang upload audio... ${t}%`,`upload`)}})}async function L(n){n.preventDefault();let r=f(),i=N();if(!i)return;let a=!!d,o=r.submitBtn;if(!o?.disabled)try{o&&(o.disabled=!0),B(0,`Đang chuẩn bị...`,`upload`);let n=null;i.audio&&(B(5,`Đang đọc thời lượng audio...`,`upload`),n=await P(i.audio));let r={title:i.title,artist_id:i.artist_id,album_id:i.album_id,track_number:i.track_number};n!==null&&(r.duration=n);let s=d;if(a)B(15,`Đang cập nhật thông tin bài hát...`,`upload`),await e.put(`${t}/${encodeURIComponent(s)}`,r);else{B(15,`Đang tạo bài hát...`,`upload`);let n=await e.post(t,r);if(s=F(n.data),!s)throw console.error(`Response tạo track không có ID:`,n.data),Error(`Không tìm thấy ID bài hát trong response API. Hãy kiểm tra response POST /api/tracks.`)}i.audio&&(B(30,`Đang upload audio...`,`upload`),await I(s,i.audio)),i.image&&(B(75,`Đang upload ảnh bài hát...`,`upload`),await V(s,i.image)),B(100,`Hoàn tất!`,`success`),await C(),m(a?`Cập nhật bài hát thành công!`:`Tạo bài hát thành công!`),setTimeout(()=>{A()},700)}catch(e){console.error(`Lỗi xử lý bài hát:`,e);let t=e.response?.data?.error?.message||e.response?.data?.message||e.message||`Không thể xử lý bài hát.`;B(0,t,`error`),m(t)}finally{o&&(o.disabled=!1)}}function R(){let e=f();e.openBtn?.addEventListener(`click`,k),e.closeBtn?.addEventListener(`click`,A),e.cancelBtn?.addEventListener(`click`,A),e.modal?.addEventListener(`click`,t=>{t.target===e.modal&&A()}),e.form?.addEventListener(`submit`,L),e.refreshBtn?.addEventListener(`click`,C),e.searchInput?.addEventListener(`input`,()=>{u=e.searchInput.value.trim(),w()}),e.pagination?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-page]`);if(!t||t.disabled)return;let n=Number(t.dataset.page),r=Math.ceil(l.length/a);n<1||n>r||(s=n,T(),E())}),e.tableBody?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-detail-track]`),n=e.target.closest(`[data-edit-track]`),r=e.target.closest(`[data-delete-track]`);t?D(t.dataset.detailTrack):n?j(n.dataset.editTrack):r&&O(r.dataset.deleteTrack)}),M()}function z(){o||f().tableBody&&(o=!0,R(),C())}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,z,{once:!0}):z();function B(e,t,n=`upload`){let{uploadProgress:r,uploadStatus:i,uploadPercent:a,uploadBar:o,uploadIcon:s}=f();if(!r)return;r.classList.remove(`hidden`);let c=Math.min(100,Math.max(0,e));i&&(i.textContent=t),a&&(a.textContent=`${c}%`),o&&(o.style.width=`${c}%`,o.className=`rounded-full h-full transition-all duration-300`,n===`success`?o.classList.add(`bg-green-500`):n===`error`?o.classList.add(`bg-red-500`):o.classList.add(`bg-green-500`)),s&&(s.className=`fa-solid`,n===`success`?s.classList.add(`fa-circle-check`,`text-green-400`):n===`error`?s.classList.add(`fa-circle-xmark`,`text-red-400`):s.classList.add(`fa-cloud-arrow-up`,`text-green-400`)),a&&(a.className=n===`error`?`font-semibold text-red-400 text-sm`:`font-semibold text-green-400 text-sm`)}async function V(t,n){let r=new FormData;return r.append(`image`,n),e.post(`/api/upload/track/${encodeURIComponent(t)}/image`,r)}export{z as t};