import{i as e}from"./header-CumW_c_8.js";import{n as t}from"./player-B77JGl4t.js";async function n(e){e?await r(e):console.error(`Không tìm thấy ID album`)}async function r(t){try{let n=(await e.get(`/api/albums/${t}`)).data;document.querySelector(`#detailImage`).src=n.cover_image_url||`./src/assets/placeholder.png`,document.querySelector(`#detailName`).textContent=n.title,document.querySelector(`#detailDesc`).textContent=`${n.artist_name||n.artist||``} • ${n.release_date?.slice(0,4)||``}`;let r=await e.get(`/api/albums/${t}/tracks`),o=Array.isArray(r.data.tracks)?r.data.tracks:[],s=document.querySelector(`#trackList`);s.innerHTML=o.length===0?`
        <p class="text-gray-400 text-sm italic">
          Album này chưa có bài hát nào.
        </p>`:o.map(e=>{let t=e.artist_name||`Không rõ nghệ sĩ`,n=e.title||`Không rõ tên bài hát`,r=e.duration?i(e.duration):`0:00`;return`
      <div class="flex items-center justify-between p-2 hover:bg-neutral-800 rounded cursor-pointer"
           onclick="window.openTrack('${e.id}')"
        <div>
          <p class="text-white">${n}</p>
          <p class="text-gray-400 text-sm">${t}</p>
        </div>
        <span class="text-xs text-gray-400">${r}</span>
      </div>`}).join(``),a(t)}catch(e){console.error(`Lỗi load album:`,e)}}function i(e){return e?`${Math.floor(e/60)}:${(e%60).toString().padStart(2,`0`)}`:`0:00`}function a(n){let r=document.querySelector(`#playBtn`),i=document.querySelector(`#toggleLibraryBtn`);r&&r.addEventListener(`click`,async()=>{try{let r=await e.get(`/api/albums/${n}/tracks`),i=Array.isArray(r.data.tracks)?r.data.tracks:[];if(i.length===0){console.warn(`Album không có bài hát nào để phát`);return}window.playlist=i,t(0)}catch(e){console.error(`Lỗi phát bài hát:`,e),alert(`Không thể phát bài hát này.`)}}),i&&i.addEventListener(`click`,async()=>{try{i.textContent.includes(`Lưu`)?(await e.put(`/api/albums/${n}/followers`),i.textContent=`Xóa khỏi thư viện`):(await e.delete(`/api/albums/${n}/followers`),i.textContent=`Lưu vào thư viện`)}catch(e){console.error(`Lỗi cập nhật thư viện:`,e)}})}export{n as t};