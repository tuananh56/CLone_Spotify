import{t as e}from"./api-C91Bgm76.js";import{t}from"./track_admin-87w5Gimy.js";var n=[{key:`albums`,title:`Tổng số Album`,endpoint:`/api/albums`,limit:20,icon:`fa-compact-disc`,color:`text-purple-400`,bg:`bg-purple-500/20`},{key:`tracks`,title:`Tổng số Track`,endpoint:`/api/tracks`,limit:50,icon:`fa-music`,color:`text-green-400`,bg:`bg-green-500/20`},{key:`users`,title:`Tổng số User`,endpoint:`/api/admin/users`,limit:20,icon:`fa-users`,color:`text-blue-400`,bg:`bg-blue-500/20`},{key:`playlists`,title:`Tổng số Playlist`,endpoint:`/api/playlists`,limit:20,icon:`fa-list`,color:`text-pink-400`,bg:`bg-pink-500/20`}],r=!1,i=!1,a=!1;function o(e){let t=[e?.pagination?.total,e?.meta?.total,e?.total,e?.data?.pagination?.total,e?.data?.meta?.total,e?.data?.total,e?.pagination?.totalItems,e?.meta?.totalItems];for(let e of t)if(e!=null&&Number.isFinite(Number(e)))return Number(e);return null}function s(e,t){return Array.isArray(e?.[t])?e[t]:Array.isArray(e?.data?.[t])?e.data[t]:Array.isArray(e?.data)?e.data:Array.isArray(e?.items)?e.items:null}async function c(t){let{endpoint:n,limit:r,key:i}=t,a=(await e.get(n,{params:{limit:r,offset:0}})).data,c=o(a);if(c!==null)return c;let l=s(a,i);if(!l)throw Error(`Không tìm thấy danh sách dữ liệu từ API.`);let u=l.length,d=r,f=l;for(;f.length===r&&(f=s((await e.get(n,{params:{limit:r,offset:d}})).data,i),f&&f.length!==0);)u+=f.length,d+=r;return u}function l(e){let t=document.getElementById(`adminStats`);t&&(t.innerHTML=n.map(t=>{let n=e[t.key];return`
      <div class="bg-neutral-800 hover:bg-neutral-700 p-5 rounded-xl transition">
        <div class="flex justify-between items-center mb-5">
          <div class="${t.bg} flex justify-center items-center rounded-xl w-12 h-12">
            <i class="fa-solid ${t.icon} ${t.color} text-xl"></i>
          </div>

          <span class="text-gray-500 text-xs">
            ${n.success?`Đã cập nhật`:`Lỗi`}
          </span>
        </div>

        <p class="mb-2 text-gray-400 text-sm">
          ${t.title}
        </p>

        <h3 class="font-bold text-3xl ${n.success?`text-white`:`text-red-400`}">
          ${n.success?n.total.toLocaleString(`vi-VN`):`--`}
        </h3>

        ${n.success?``:`<p class="mt-2 text-red-400 text-xs">${n.error}</p>`}
      </div>
    `}).join(``))}async function u(){if(i)return;i=!0;let e=document.getElementById(`adminRefreshBtn`),t=document.getElementById(`adminStatsError`),r=document.getElementById(`adminStatsUpdated`);e&&(e.disabled=!0,e.innerHTML=`
      <i class="mr-2 fa-solid fa-spinner fa-spin"></i>
      Đang tải...
    `),t?.classList.add(`hidden`);try{let e=await Promise.all(n.map(async e=>{try{let t=await c(e);return[e.key,{success:!0,total:t}]}catch(t){return[e.key,{success:!1,error:t.response?.data?.message||t.message||`Không thể tải dữ liệu.`}]}})),i=Object.fromEntries(e);l(i);let a=n.filter(e=>!i[e.key].success);a.length>0&&t&&(t.textContent=a.map(e=>`${e.title}: ${i[e.key].error}`).join(` | `),t.classList.remove(`hidden`)),r&&(r.textContent=`Cập nhật lúc: `+new Date().toLocaleString(`vi-VN`))}finally{i=!1,e&&(e.disabled=!1,e.innerHTML=`
        <i class="mr-2 fa-solid fa-rotate"></i>
        Làm mới
      `)}}function d(){a&&(t(),u(),document.getElementById(`adminRefreshBtn`)?.addEventListener(`click`,u),document.getElementById(`adminLogoutBtn`)?.addEventListener(`click`,()=>{localStorage.removeItem(`token`),localStorage.removeItem(`user`),window.location.href=`/CLone_Spotify/login.html`}))}async function f(){if(!(r||a)){if(!localStorage.getItem(`token`))window.location.href=`/CLone_Spotify/login.html`;else{r=!0;try{await e.get(`/api/admin/stats`),a=!0,d()}catch(e){let t=e.response?.status;if(t===401){localStorage.removeItem(`token`),localStorage.removeItem(`user`),window.location.href=`/CLone_Spotify/login.html`;return}if(t===403){alert(`Bạn không có quyền truy cập trang quản trị!`),window.location.href=`/CLone_Spotify/home.html`;return}let n=document.getElementById(`adminContent`);n&&(n.innerHTML=`
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          <h2 class="font-bold text-lg mb-2">
            Không thể xác minh quyền Admin
          </h2>

          <p class="text-sm">
            ${e.response?.data?.message||`Vui lòng kiểm tra kết nối và thử lại.`}
          </p>

          <button
            id="retryAdminBtn"
            type="button"
            class="mt-4 bg-white text-black px-4 py-2 rounded-full font-semibold"
          >
            Thử lại
          </button>
        </div>
      `,document.getElementById(`retryAdminBtn`)?.addEventListener(`click`,f))}finally{r=!1}}}}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,f):f();