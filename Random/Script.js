//random version
const listEl = document.getElementById("spotList");
const navEl  = document.getElementById("tagNav");
const toast  = document.getElementById("toast");

/* data for the spots */
// This is a simple array of objects, each representing a spot with an id, name,
const TAGS = [...new Set(SPOTS.flatMap(s => s.tags))].sort();

/* build the navigation bar */
// This creates buttons for each tag and a home button that shows all spots
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

/* shuffle an array */
// This is a simple implementation of the Fisher-Yates shuffle algorithm
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* render the list of spots */
// If a filter is provided, only show spots with that tag
function render(filter=null){
  let spots = shuffle([...SPOTS]);
  if(filter) spots = spots.filter(s=>s.tags.includes(filter));
  listEl.innerHTML="";
  spots.forEach(s=>listEl.appendChild(card(s)));
}

/* create a card element */
// Each card has an image, name, tags, and buttons for interaction
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

/* show a toast message */
function toastMsg(msg){
  toast.textContent=msg; toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1500);
}
// Initial setup
buildNav(); render();
