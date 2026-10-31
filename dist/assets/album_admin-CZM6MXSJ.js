import{n as e,r as t,t as n}from"./api-C91Bgm76.js";var r=t(e(),1),i=`/api/albums`,a=`/api/artists`,o=`/api/tracks`,s=20,c=10,l=[],u=[],d=[],f=[],p=1,m=null,h=null,g=!1,_=null;function v(){return{tableBody:document.getElementById(`albumsTableBody`),searchInput:document.getElementById(`albumSearch`),searchBtn:document.getElementById(`albumSearchBtn`),pagination:document.getElementById(`albumsPagination`),addBtn:document.getElementById(`addAlbumBtn`),modal:document.getElementById(`albumModal`),form:document.getElementById(`albumForm`),modalTitle:document.getElementById(`albumModalTitle`),title:document.getElementById(`albumTitle`),artist:document.getElementById(`albumArtist`),releaseDate:document.getElementById(`albumReleaseDate`),imageUrl:document.getElementById(`albumImageUrl`),imageFile:document.getElementById(`albumImage`),imagePreview:document.getElementById(`albumImagePreview`),saveBtn:document.getElementById(`saveAlbumBtn`),cancelBtn:document.getElementById(`cancelAlbumBtn`),closeBtn:document.getElementById(`closeAlbumModal`),tracksModal:document.getElementById(`albumTracksModal`),manageAlbumName:document.getElementById(`manageAlbumName`),availableTracksSelect:document.getElementById(`availableTracksSelect`),addTrackBtn:document.getElementById(`addTrackToAlbumBtn`),albumTracksTableBody:document.getElementById(`albumTracksTableBody`),closeTracksModal:document.getElementById(`closeAlbumTracksModal`)}}function y(e){return e?.id||e?._id||e?.album_id}function b(e){return e?.title||e?.name||e?.album_title||`Chưa có tên`}function x(e){return e?.cover_image_url||e?.image_url||e?.image||`https://placehold.co/300x300?text=No+Image`}function S(e){return e?.id||e?._id||e?.artist_id}function C(e){return e?.artist?.name||e?.artist_name||e?.artist?.title||`Không rõ nghệ sĩ`}function w(e){return e?.id||e?._id||e?.track_id}function T(e){return e?.title||e?.name||e?.track_title||`Không có tên`}function E(e){return e?.artist?.name||e?.artist_name||`Không rõ nghệ sĩ`}function D(e){return e?.album_id||e?.album?.id||e?.album?._id||null}function O(e){if(e==null||e===``)return`—`;let t=Number(e);if(!Number.isFinite(t))return`—`;let n=Math.floor(t/60),r=t%60;return`${n}:${String(r).padStart(2,`0`)}`}function k(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#039;`})[e])}function A(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?k(e):t.toLocaleDateString(`vi-VN`)}function j(e,t){return Array.isArray(e)?e:Array.isArray(e?.[t])?e[t]:Array.isArray(e?.data?.[t])?e.data[t]:Array.isArray(e?.data)?e.data:[]}async function M(e,t){let r=0,i=null,a=[];for(let o=0;o<100;o++){let o=(await n.get(e,{params:{limit:s,offset:r}})).data,c=j(o,t),l=o?.pagination||o?.data?.pagination||{};if(l.total!==void 0){let e=Number(l.total);Number.isFinite(e)&&e>=0&&(i=e)}if(c.length===0||(a=a.concat(c),r+=c.length,i!==null&&a.length>=i)||c.length<s)break}return a}function N(){_&&=(URL.revokeObjectURL(_),null)}function P(){let e=v(),t=e.imageFile?.files?.[0];if(N(),t){if(![`image/jpeg`,`image/png`,`image/webp`].includes(t.type)){r.default.fire(`Lỗi`,`Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.`,`warning`),e.imageFile.value=``;return}if(t.size>5242880){r.default.fire(`Lỗi`,`Ảnh không được vượt quá 5MB.`,`warning`),e.imageFile.value=``;return}_=URL.createObjectURL(t),e.imagePreview&&(e.imagePreview.src=_,e.imagePreview.classList.remove(`hidden`));return}let n=e.imageUrl?.value?.trim();n&&e.imagePreview?(e.imagePreview.src=n,e.imagePreview.classList.remove(`hidden`)):e.imagePreview&&(e.imagePreview.src=``,e.imagePreview.classList.add(`hidden`))}function F(){let e=v();e.modal?(e.modal.classList.remove(`hidden`),e.modal.classList.add(`flex`)):r.default.fire(`Lỗi`,`Không tìm thấy albumModal trong HTML.`,`error`)}function I(){let e=v();e.modal&&(e.modal.classList.add(`hidden`),e.modal.classList.remove(`flex`),e.form?.reset(),N(),e.imagePreview&&(e.imagePreview.src=``,e.imagePreview.classList.add(`hidden`)),m=null)}function L(){let e=v();m=null,e.form?.reset(),N(),e.modalTitle&&(e.modalTitle.textContent=`Thêm album`),e.saveBtn&&(e.saveBtn.textContent=`Lưu album`,e.saveBtn.disabled=!1),e.imagePreview&&(e.imagePreview.src=``,e.imagePreview.classList.add(`hidden`)),F()}function R(e){let t=l.find(t=>String(y(t))===String(e));if(!t){r.default.fire(`Lỗi`,`Không tìm thấy album.`,`error`);return}let n=v();if(m=e,N(),n.title&&(n.title.value=b(t)),n.artist&&(n.artist.value=t.artist_id||t.artist?.id||t.artist?._id||``),n.releaseDate&&(n.releaseDate.value=t.release_date?String(t.release_date).slice(0,10):``),n.imageUrl&&(n.imageUrl.value=x(t)),n.imageFile&&(n.imageFile.value=``),n.imagePreview){let e=x(t);n.imagePreview.src=e,n.imagePreview.classList.toggle(`hidden`,!e)}n.modalTitle&&(n.modalTitle.textContent=`Chỉnh sửa album`),n.saveBtn&&(n.saveBtn.textContent=`Cập nhật album`,n.saveBtn.disabled=!1),F()}async function z(){let e=v();try{d=await M(a,`artists`),ee()}catch(t){console.error(`Lỗi tải nghệ sĩ:`,t),d=[],e.artist&&(e.artist.innerHTML=`<option value="">Không thể tải nghệ sĩ</option>`)}}function ee(){let e=v();e.artist&&(e.artist.innerHTML=`
    <option value="">-- Chọn nghệ sĩ --</option>

    ${d.map(e=>{let t=S(e),n=e.name||e.title||`Không tên`;return`
          <option value="${k(t)}">
            ${k(n)}
          </option>
        `}).join(``)}
  `)}async function B(){let e=v();e.tableBody&&(e.tableBody.innerHTML=`
      <tr>
        <td colspan="6" class="text-center py-6 text-gray-400">
          Đang tải dữ liệu album...
        </td>
      </tr>
    `);try{l=await M(i,`albums`),u=[...l],p=1,V()}catch(t){console.error(`Lỗi tải album:`,t),e.tableBody&&(e.tableBody.innerHTML=`
        <tr>
          <td colspan="6" class="text-center py-6 text-red-400">
            Không thể tải danh sách album.
          </td>
        </tr>
      `),r.default.fire(`Lỗi`,t.response?.data?.message||`Không thể tải danh sách album.`,`error`)}}function V(){let e=v();if(!e.tableBody)return;let t=Math.max(1,Math.ceil(u.length/c));p=Math.min(p,t);let n=(p-1)*c,r=u.slice(n,n+c);r.length===0?(e.tableBody.innerHTML=`
      <tr>
        <td colspan="6" class="text-center py-8 text-gray-400">
          Không tìm thấy album nào.
        </td>
      </tr>
    `,H()):(e.tableBody.innerHTML=r.map((e,t)=>{let r=y(e),i=b(e),a=x(e),o=C(e),s=A(e.release_date);return`
        <tr class="border-b border-neutral-700 hover:bg-neutral-800">

          <td class="px-4 py-3">
            ${n+t+1}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img
                src="${k(a||`playlist.png`)}"
                alt="Album"
                class="w-12 h-12 rounded object-cover"
                onerror="this.onerror=null;this.src='playlist.png'"
              />

              <span class="font-medium text-white">
                ${k(i)}
              </span>
            </div>
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${k(o)}
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${s}
          </td>

          <td class="px-4 py-3 text-gray-300">
            ${k(r||`—`)}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-3">

              <button
                type="button"
                data-action="manage-tracks"
                data-id="${k(r)}"
                class="text-green-400 hover:text-green-300"
                title="Quản lý bài hát"
              >
                <i class="fas fa-music"></i>
              </button>

              <button
                type="button"
                data-action="edit"
                data-id="${k(r)}"
                class="text-blue-400 hover:text-blue-300"
                title="Sửa album"
              >
                <i class="fas fa-edit"></i>
              </button>

              <button
                type="button"
                data-action="delete"
                data-id="${k(r)}"
                class="text-red-400 hover:text-red-300"
                title="Xóa album"
              >
                <i class="fas fa-trash"></i>
              </button>

            </div>
          </td>
        </tr>
      `}).join(``),H())}function H(){let e=v();if(!e.pagination)return;let t=Math.ceil(u.length/c);if(t<=1){e.pagination.innerHTML=``;return}let n=`
    <button
      type="button"
      data-page="${p-1}"
      ${p===1?`disabled`:``}
      class="px-3 py-2 rounded bg-neutral-700 disabled:opacity-40"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
  `;for(let e=1;e<=t;e++)n+=`
      <button
        type="button"
        data-page="${e}"
        class="px-3 py-2 rounded ${e===p?`bg-green-500 text-black`:`bg-neutral-700 text-white`}"
      >
        ${e}
      </button>
    `;n+=`
    <button
      type="button"
      data-page="${p+1}"
      ${p===t?`disabled`:``}
      class="px-3 py-2 rounded bg-neutral-700 disabled:opacity-40"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  `,e.pagination.innerHTML=n}function U(e){let t=e.target.closest(`button[data-page]`);if(!t||t.disabled)return;let n=Number(t.dataset.page),r=Math.ceil(u.length/c);n<1||n>r||(p=n,V())}function W(){let e=v().searchInput?.value?.trim().toLowerCase()||``;u=l.filter(t=>{let n=b(t).toLowerCase(),r=C(t).toLowerCase();return n.includes(e)||r.includes(e)}),p=1,V()}function G(){let e=v(),t=e.title?.value.trim(),n=e.artist?.value,i=e.releaseDate?.value,a=e.imageUrl?.value.trim(),o=e.imageFile?.files?.[0]||null;if(!t)return r.default.fire(`Thiếu thông tin`,`Vui lòng nhập tên album.`,`warning`),null;if(!n)return r.default.fire(`Thiếu thông tin`,`Vui lòng chọn nghệ sĩ.`,`warning`),null;if(o){if(![`image/jpeg`,`image/png`,`image/webp`].includes(o.type))return r.default.fire(`Lỗi`,`File ảnh không hợp lệ.`,`warning`),null;if(o.size>5242880)return r.default.fire(`Lỗi`,`Ảnh không được vượt quá 5MB.`,`warning`),null}return{title:t,artist_id:n,release_date:i||null,image_url:a||void 0,imageFile:o}}async function K(e,t){let r=localStorage.getItem(`token`);if(!r||!r.trim())throw Error(`Không tìm thấy token đăng nhập.`);if(!e||!t)throw Error(`Thiếu ID album hoặc file ảnh.`);let i=new FormData;i.append(`cover`,t);try{let t=await n.post(`/api/upload/album/${encodeURIComponent(e)}/cover`,i,{headers:{Authorization:`Bearer ${r}`}});return console.log(`Upload album cover response:`,t.data),t.data}catch(e){throw console.error(`Upload album cover error:`,{status:e.response?.status,data:e.response?.data}),e}}async function q(e){e.preventDefault();let t=v(),a=G();if(!a)return;let o=!!m,s=t.saveBtn;if(!s){r.default.fire(`Lỗi`,`Không tìm thấy nút saveAlbumBtn trong HTML.`,`error`);return}let c=m;try{s.disabled=!0,s.textContent=`Đang lưu...`;let e={title:a.title,artist_id:a.artist_id,release_date:a.release_date};if(a.cover_image_url&&(e.cover_image_url=a.cover_image_url),o)await n.put(`${i}/${encodeURIComponent(c)}`,e);else{let t=(await n.post(i,e)).data;if(c=t?.album?.id||t?.data?.album?.id||t?.data?.id||t?.album_id||t?.id||t?._id,!c)throw Error(`Không lấy được ID album từ API.`)}a.imageFile&&await K(c,a.imageFile),I(),await B(),await r.default.fire(`Thành công`,o?`Cập nhật album thành công!`:`Thêm album thành công!`,`success`)}catch(e){console.error(`Lỗi lưu album:`,e);let t=e.response?.data?.error?.message||e.response?.data?.message||e.message||`Không thể lưu album.`;r.default.fire(`Lỗi`,t,`error`)}finally{s.disabled=!1,s.textContent=`Lưu album`}}async function J(e){if((await r.default.fire({title:`Xóa album?`,text:`Bạn có chắc chắn muốn xóa album này không?`,icon:`warning`,showCancelButton:!0,confirmButtonText:`Xóa`,cancelButtonText:`Hủy`,confirmButtonColor:`#dc2626`})).isConfirmed)try{await n.delete(`${i}/${encodeURIComponent(e)}`),await B(),r.default.fire({icon:`success`,title:`Đã xóa album`,timer:1500,showConfirmButton:!1})}catch(e){console.error(`Lỗi xóa album:`,e),r.default.fire(`Lỗi`,e.response?.data?.message||`Không thể xóa album.`,`error`)}}async function Y(){try{f=await M(o,`tracks`)}catch(e){console.error(`Lỗi tải bài hát:`,e),f=[],r.default.fire(`Lỗi`,e.response?.data?.message||`Không thể tải danh sách bài hát.`,`error`)}}async function X(e){let t=v(),n=l.find(t=>String(y(t))===String(e));n?(h=n,t.tracksModal?(t.manageAlbumName&&(t.manageAlbumName.textContent=`Album: ${b(n)}`),t.tracksModal.classList.remove(`hidden`),t.tracksModal.classList.add(`flex`),t.albumTracksTableBody&&(t.albumTracksTableBody.innerHTML=`
      <tr>
        <td colspan="5" class="text-center p-5 text-gray-400">
          Đang tải bài hát...
        </td>
      </tr>
    `),t.availableTracksSelect&&(t.availableTracksSelect.innerHTML=`<option value="">Đang tải bài hát...</option>`),await Y(),Q(),$()):r.default.fire(`Lỗi`,`Không tìm thấy albumTracksModal trong HTML.`,`error`)):r.default.fire(`Lỗi`,`Không tìm thấy album.`,`error`)}function Z(){let e=v();e.tracksModal?.classList.add(`hidden`),e.tracksModal?.classList.remove(`flex`),h=null}function Q(){let e=v();if(!e.availableTracksSelect||!h)return;String(y(h));let t=f.filter(e=>!D(e));t.length===0?e.availableTracksSelect.innerHTML=`<option value="">Không còn bài hát chưa thuộc album</option>`:e.availableTracksSelect.innerHTML=`
    <option value="">-- Chọn bài hát --</option>

    ${t.map(e=>`
          <option value="${k(w(e))}">
            ${k(T(e))}
            - ${k(E(e))}
          </option>
        `).join(``)}
  `}function $(){let e=v();if(!e.albumTracksTableBody||!h)return;let t=String(y(h)),n=f.filter(e=>String(D(e)||``)===t);n.length===0?e.albumTracksTableBody.innerHTML=`
      <tr>
        <td colspan="5" class="text-center p-5 text-gray-400">
          Album chưa có bài hát nào.
        </td>
      </tr>
    `:e.albumTracksTableBody.innerHTML=n.map((e,t)=>{let n=w(e);return`
        <tr class="border-b border-neutral-700 hover:bg-neutral-800">

          <td class="p-3">
            ${t+1}
          </td>

          <td class="p-3 font-medium">
            ${k(T(e))}
          </td>

          <td class="p-3 text-gray-400">
            ${k(E(e))}
          </td>

          <td class="p-3 text-gray-400">
            ${O(e.duration)}
          </td>

          <td class="p-3">
            <button
              type="button"
              data-action="remove-track"
              data-id="${k(n)}"
              class="text-red-400 hover:text-red-300"
              title="Gỡ khỏi album"
            >
              <i class="fas fa-trash"></i>
              Gỡ
            </button>
          </td>

        </tr>
      `}).join(``)}async function te(){let e=v();if(!h)return;let t=e.availableTracksSelect?.value;if(!t){r.default.fire(`Thông báo`,`Vui lòng chọn bài hát.`,`warning`);return}let i=y(h);try{e.addTrackBtn&&(e.addTrackBtn.disabled=!0,e.addTrackBtn.textContent=`Đang thêm...`),await n.put(`${o}/${encodeURIComponent(t)}`,{album_id:i}),await Y(),Q(),$(),r.default.fire({icon:`success`,title:`Đã thêm bài hát vào album`,timer:1500,showConfirmButton:!1})}catch(e){console.error(`Lỗi thêm bài hát:`,e),r.default.fire(`Lỗi`,e.response?.data?.message||`Không thể thêm bài hát vào album.`,`error`)}finally{e.addTrackBtn&&(e.addTrackBtn.disabled=!1,e.addTrackBtn.innerHTML=`<i class="fas fa-plus mr-2"></i>Thêm bài hát`)}}async function ne(e){if(h&&(await r.default.fire({title:`Gỡ bài hát?`,text:`Bài hát sẽ không còn thuộc album này.`,icon:`warning`,showCancelButton:!0,confirmButtonText:`Gỡ`,cancelButtonText:`Hủy`,confirmButtonColor:`#dc2626`})).isConfirmed)try{await n.put(`${o}/${encodeURIComponent(e)}`,{album_id:null}),await Y(),Q(),$(),r.default.fire({icon:`success`,title:`Đã gỡ bài hát`,timer:1500,showConfirmButton:!1})}catch(e){console.error(`Lỗi gỡ bài hát:`,e),r.default.fire(`Lỗi`,e.response?.data?.message||`Không thể gỡ bài hát khỏi album.`,`error`)}}function re(e){let t=e.target.closest(`button[data-action]`);if(!t)return;let n=t.dataset.action,r=t.dataset.id;r&&(n===`edit`&&R(r),n===`delete`&&J(r),n===`manage-tracks`&&X(r))}function ie(e){let t=e.target.closest(`button[data-action="remove-track"]`);if(!t)return;let n=t.dataset.id;n&&ne(n)}function ae(){let e=v();e.addBtn?.addEventListener(`click`,L),e.searchBtn?.addEventListener(`click`,W),e.searchInput?.addEventListener(`input`,W),e.form?.addEventListener(`submit`,q),e.cancelBtn?.addEventListener(`click`,I),e.closeBtn?.addEventListener(`click`,I),e.imageFile?.addEventListener(`change`,P),e.imageUrl?.addEventListener(`input`,P),e.tableBody?.addEventListener(`click`,re),e.pagination?.addEventListener(`click`,U),e.closeTracksModal?.addEventListener(`click`,Z),e.addTrackBtn?.addEventListener(`click`,te),e.albumTracksTableBody?.addEventListener(`click`,ie)}async function oe(){g||(g=!0,ae()),await Promise.all([z(),B()])}document.addEventListener(`DOMContentLoaded`,async()=>{await oe()});