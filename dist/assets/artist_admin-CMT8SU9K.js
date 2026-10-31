import{t as e}from"./api-C91Bgm76.js";var t=`/api/artists`,n=20,r=10,i=!1,a=[],o=[],s=1,c=null,l=``;function u(){return{tableBody:document.getElementById(`artistTableBody`),total:document.getElementById(`artistTotal`),pagination:document.getElementById(`artistPagination`),paginationInfo:document.getElementById(`artistPaginationInfo`),searchInput:document.getElementById(`artistSearchInput`),refreshBtn:document.getElementById(`artistRefreshBtn`),modal:document.getElementById(`artistModal`),modalTitle:document.getElementById(`artistModalTitle`),form:document.getElementById(`artistForm`),openBtn:document.getElementById(`addArtistBtn`),closeBtn:document.getElementById(`closeArtistModalBtn`),cancelBtn:document.getElementById(`cancelArtistBtn`),name:document.getElementById(`artistName`),imageUrl:document.getElementById(`artistImageUrl`),imagePreview:document.getElementById(`artistImagePreview`),saveBtn:document.getElementById(`saveArtistBtn`)}}function d(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function f(e){return Array.isArray(e?.artists)?e.artists:Array.isArray(e?.data?.artists)?e.data.artists:Array.isArray(e?.data)?e.data:Array.isArray(e)?e:[]}function p(e,t){let n=e?.pagination?.total??e?.data?.pagination?.total??e?.total??e?.data?.total;return Number.isFinite(Number(n))?Number(n):t.length}function m(e){return e?.artist||e?.data?.artist||e?.data||e}function h(e){alert(e)}async function g(){let{tableBody:r,total:i}=u();if(r){r.innerHTML=`
    <tr>
      <td colspan="4" class="py-12 text-center text-gray-400">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
        Đang tải danh sách nghệ sĩ...
      </td>
    </tr>
  `;try{let r=[],o=0,s=null;for(;;){let i=await e.get(t,{params:{limit:n,offset:o}}),a=f(i.data);if(s===null&&(s=p(i.data,a)),!a.length||(r.push(...a),o+=a.length,r.length>=s||a.length<n))break}let c=new Map;r.forEach(e=>{e?.id&&c.set(String(e.id),e)}),a=Array.from(c.values()),_(),i&&(i.textContent=`${a.length.toLocaleString(`vi-VN`)} nghệ sĩ`)}catch(e){console.error(`Load artists error:`,e),r.innerHTML=`
      <tr>
        <td colspan="4" class="py-12 text-center text-red-400">
          Không thể tải danh sách nghệ sĩ.
          <button id="retryArtistBtn" class="ml-2 underline">
            Thử lại
          </button>
        </td>
      </tr>
    `,document.getElementById(`retryArtistBtn`)?.addEventListener(`click`,g),i&&(i.textContent=`Lỗi tải dữ liệu`)}}}function _(){let e=l.toLowerCase();o=a.filter(t=>String(t.name||t.artist_name||t.title||``).toLowerCase().includes(e)),s=1,v(),y()}function v(){let{tableBody:e}=u();if(!e)return;let t=(s-1)*r,n=o.slice(t,t+r);e.innerHTML=n.length?n.map((e,n)=>{let r=String(e.id??``),i=e.name||e.artist_name||e.title||`Chưa có tên`,a=e.image_url||e.avatar_url||e.image||`./playlist.png`;return`
      <tr class="border-t border-neutral-700 hover:bg-neutral-800/70">
        <td class="px-5 py-4 text-gray-400">
          ${t+n+1}
        </td>

        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <img
              src="${d(a)}"
              alt=""
              class="h-12 w-12 rounded-full object-cover bg-neutral-700"
              onerror="this.onerror=null;this.src='./playlist.png'"
            />
            <span class="font-medium">
              ${d(i)}
            </span>
          </div>
        </td>

        <td class="px-5 py-4 text-gray-400">
          <span class="break-all">${d(r)}</span>
        </td>

        <td class="px-5 py-4 text-right whitespace-nowrap">
          <button
            type="button"
            data-edit-artist="${d(r)}"
            class="mr-3 text-yellow-400 hover:text-yellow-300"
            title="Chỉnh sửa"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            type="button"
            data-delete-artist="${d(r)}"
            class="text-red-400 hover:text-red-300"
            title="Xóa"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `}).join(``):`
      <tr>
        <td colspan="4" class="py-12 text-center text-gray-400">
          Không tìm thấy nghệ sĩ.
        </td>
      </tr>
    `}function y(){let{pagination:e,paginationInfo:t}=u();if(!e)return;let n=o.length,i=Math.ceil(n/r),a=n?(s-1)*r+1:0,c=Math.min(s*r,n);t&&(t.textContent=`Hiển thị ${a} - ${c} trong ${n} nghệ sĩ`),e.innerHTML=i<=1?``:`
    <button
      type="button"
      data-page="${s-1}"
      ${s<=1?`disabled`:``}
      class="rounded-lg bg-neutral-700 px-3 py-2 hover:bg-neutral-600 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <span class="px-3 text-sm">
      ${s} / ${i}
    </span>

    <button
      type="button"
      data-page="${s+1}"
      ${s>=i?`disabled`:``}
      class="rounded-lg bg-neutral-700 px-3 py-2 hover:bg-neutral-600 disabled:opacity-40"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `}function b(){let e=u();c=null,e.form?.reset(),e.modalTitle&&(e.modalTitle.textContent=`Thêm nghệ sĩ`),e.saveBtn&&(e.saveBtn.textContent=`Thêm nghệ sĩ`),e.imagePreview&&(e.imagePreview.src=``,e.imagePreview.classList.add(`hidden`)),e.modal?.classList.remove(`hidden`),e.modal?.classList.add(`flex`),document.body.style.overflow=`hidden`}function x(){let e=u();e.modal?.classList.add(`hidden`),e.modal?.classList.remove(`flex`),document.body.style.overflow=``,c=null}async function S(n){try{let r=m((await e.get(`${t}/${encodeURIComponent(n)}`)).data);if(!r||!r.id){h(`Không tìm thấy nghệ sĩ.`);return}let i=r.name||r.artist_name||`Chưa có tên`,a=r.image_url||r.avatar_url||`Chưa có ảnh`;h(`Tên nghệ sĩ: ${i}\nArtist ID: ${r.id}\nẢnh: ${a}`)}catch(e){h(e.response?.data?.message||`Không thể lấy thông tin nghệ sĩ.`)}}async function C(n){try{let r=m((await e.get(`${t}/${encodeURIComponent(n)}`)).data);if(!r||!r.id){h(`Không tìm thấy nghệ sĩ.`);return}let i=u();c=n,i.name.value=r.name||r.artist_name||r.title||``,i.imageUrl.value=r.image_url||r.avatar_url||r.image||``,i.imagePreview&&i.imageUrl.value?(i.imagePreview.src=i.imageUrl.value,i.imagePreview.classList.remove(`hidden`)):i.imagePreview?.classList.add(`hidden`),i.modalTitle&&(i.modalTitle.textContent=`Chỉnh sửa nghệ sĩ`),i.saveBtn&&(i.saveBtn.textContent=`Lưu thay đổi`),i.modal?.classList.remove(`hidden`),i.modal?.classList.add(`flex`),document.body.style.overflow=`hidden`}catch(e){h(e.response?.data?.message||`Không thể lấy thông tin nghệ sĩ.`)}}async function w(n){n.preventDefault();let r=u(),i=r.name.value.trim(),a=r.imageUrl.value.trim();if(!i){h(`Vui lòng nhập tên nghệ sĩ.`),r.name.focus();return}if(a)try{new URL(a)}catch{h(`URL ảnh không hợp lệ.`),r.imageUrl.focus();return}let o={name:i,image_url:a||null};try{r.saveBtn.disabled=!0,r.saveBtn.textContent=`Đang lưu...`,c?(await e.put(`${t}/${encodeURIComponent(c)}`,o),h(`Cập nhật nghệ sĩ thành công!`)):(await e.post(t,o),h(`Thêm nghệ sĩ thành công!`)),x(),await g()}catch(e){h(e.response?.data?.message||e.response?.data?.error||`Không thể lưu nghệ sĩ. Hãy kiểm tra API backend.`)}finally{r.saveBtn.disabled=!1,r.saveBtn.textContent=c?`Lưu thay đổi`:`Thêm nghệ sĩ`}}async function T(n){let r=a.find(e=>String(e.id)===String(n)),i=r?.name||r?.artist_name||`nghệ sĩ này`;if(confirm(`Bạn có chắc chắn muốn xóa "${i}" không?`))try{await e.delete(`${t}/${encodeURIComponent(n)}`),h(`Xóa nghệ sĩ thành công!`),await g()}catch(e){h(e.response?.data?.message||e.response?.data?.error||`Không thể xóa nghệ sĩ.`)}}function E(){let{imageUrl:e,imagePreview:t}=u();e?.addEventListener(`input`,()=>{let n=e.value.trim();n?t&&(t.src=n,t.classList.remove(`hidden`)):t?.classList.add(`hidden`)}),t?.addEventListener(`error`,()=>{t.classList.add(`hidden`)}),t?.addEventListener(`load`,()=>{t.classList.remove(`hidden`)})}function D(){let e=u();e.openBtn?.addEventListener(`click`,b),e.closeBtn?.addEventListener(`click`,x),e.cancelBtn?.addEventListener(`click`,x),e.modal?.addEventListener(`click`,t=>{t.target===e.modal&&x()}),e.form?.addEventListener(`submit`,w),e.refreshBtn?.addEventListener(`click`,g),e.searchInput?.addEventListener(`input`,()=>{l=e.searchInput.value.trim(),_()}),e.pagination?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-page]`);if(!t||t.disabled)return;let n=Number(t.dataset.page),i=Math.ceil(o.length/r);n<1||n>i||(s=n,v(),y())}),e.tableBody?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-detail-artist]`),n=e.target.closest(`[data-edit-artist]`),r=e.target.closest(`[data-delete-artist]`);t?S(t.dataset.detailArtist):n?C(n.dataset.editArtist):r&&T(r.dataset.deleteArtist)}),E()}function O(){i||u().tableBody&&(i=!0,D(),g())}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,O):O();