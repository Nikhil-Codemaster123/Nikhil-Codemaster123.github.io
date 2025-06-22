/* ── RANDOM-ONLY VERSION ───────────────────────────── */
const listEl = document.getElementById("spotList");
const navEl  = document.getElementById("tagNav");
const toast  = document.getElementById("toast");

/* collect unique tags */
const TAGS = [...new Set(SPOTS.flatMap(s => s.tags))].sort();

/* build navbar */
function buildNav(){
  navEl.innerHTML = "";
  const home = addBtn("All", null);
  home.classList.add("active");
  TAGS.forEach(t => addBtn(t, t));
  function addBtn(label, tag){
    const b = document.createElement("button");
    b.className="nav-btn"; b.textContent=label;
    b.onclick = () => { document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));
                        b.classList.add("active");
                        render(tag); };
    navEl.appendChild(b);
    return b;
  }
}

/* shuffle utility */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* render cards (random order every load) */
function render(filter=null){
  let spots = shuffle([...SPOTS]);
  if(filter) spots = spots.filter(s=>s.tags.includes(filter));
  listEl.innerHTML="";
  spots.forEach(s=>listEl.appendChild(card(s)));
}

/* build a card (likes shown but not stored) */
function card(spot){
  const c=document.createElement("div"); c.className="card";
  c.innerHTML = `
    <img src="${spot.img}" alt="${spot.name}">
    <div class="inner"><h3>${spot.name}</h3>
      ${spot.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
    </div>
    <div class="actions">
      <button>👍</button><button>👎</button><button>⭐</button>
    </div>`;
  c.querySelectorAll("button").forEach(btn=>btn.onclick=()=>toastMsg("Interaction noted (not saved)"));
  return c;
}

/* toast helper */
function toastMsg(msg){
  toast.textContent=msg; toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1500);
}

/* kick-off */
buildNav(); render();
