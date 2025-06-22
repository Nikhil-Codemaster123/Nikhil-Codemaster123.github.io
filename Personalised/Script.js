/* ── PERSONALISED-ONLY VERSION ─────────────────────── */
const MODEL_KEY="snapspot_user";
let user = JSON.parse(localStorage.getItem(MODEL_KEY)) || null;
let currentFilter=null;

const list   = document.getElementById("spotList");
const nav    = document.getElementById("tagNav");
const toast  = document.getElementById("toast");
const modal  = document.getElementById("onboard");
const choiceWrap=document.getElementById("tagChoices");
const saveBtn= document.getElementById("savePrefs");

/* gather tags */
const TAGS=[...new Set(SPOTS.flatMap(s=>s.tags))].sort();

/* onboarding if first run */
if(!user){buildModal();modal.classList.add("show");}
else{initUI();}

function buildModal(){
  TAGS.forEach(t=>{
    const chip=document.createElement("div");
    chip.className="choice"; chip.textContent=t;
    chip.onclick=()=>chip.classList.toggle("selected");
    choiceWrap.appendChild(chip);
  });
  saveBtn.onclick=()=>{
    const fav=[...document.querySelectorAll(".choice.selected")].map(x=>x.textContent);
    user={likedTags:{},likedIDs:[],dislikedIDs:[]};
    fav.forEach(t=>user.likedTags[t]=5);
    localStorage.setItem(MODEL_KEY,JSON.stringify(user));
    modal.classList.remove("show");
    initUI();
  };
}

/* build nav bar */
function buildNav(){
  nav.innerHTML="";
  const home=add("All",null);
  home.classList.add("active");
  TAGS.forEach(t=>add(t,t));
  function add(label,tag){
    const b=document.createElement("button");
    b.className="nav-btn"; b.textContent=label;
    b.onclick=()=>{document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));
                  b.classList.add("active"); currentFilter=tag; render(tag);};
    nav.appendChild(b); return b;
  }
}

/* render personalised list */
function render(filter=null){
  let spots=[...SPOTS].sort((a,b)=>score(b)-score(a));
  if(filter) spots=spots.filter(s=>s.tags.includes(filter));
  list.innerHTML=""; spots.forEach(s=>list.appendChild(card(s)));
}

function score(s){ return s.tags.reduce((sum,t)=>sum+(user.likedTags[t]||0),0); }

/* card with memory */
function card(spot){
  const c=document.createElement("div"); c.className="card";
  c.innerHTML=`
    <img src="${spot.img}" alt="${spot.name}">
    <div class="inner"><h3>${spot.name}</h3>
      ${spot.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    <div class="actions">
      <button data-like>👍</button>
      <button data-dislike>👎</button>
      <button data-fav>⭐</button>
    </div>`;
  c.querySelector("[data-like]").onclick=
  c.querySelector("[data-fav]").onclick =()=>rate(spot,"like");
  c.querySelector("[data-dislike]").onclick=()=>rate(spot,"dislike");
  if(user.likedIDs.includes(spot.id)) c.style.borderColor="#0a0";
  return c;
}

/* rate function */
function rate(spot,tp){
  if(tp==="like"){
    if(!user.likedIDs.includes(spot.id))user.likedIDs.push(spot.id);
    spot.tags.forEach(t=>user.likedTags[t]=(user.likedTags[t]||0)+1);
    msg("Saved to preferences");
  }else{
    if(!user.dislikedIDs.includes(spot.id))user.dislikedIDs.push(spot.id);
    msg("We’ll show fewer like that");
  }
  localStorage.setItem(MODEL_KEY,JSON.stringify(user));
  render(currentFilter);
}

/* helpers */
function msg(m){toast.textContent=m;toast.classList.add("show");
                setTimeout(()=>toast.classList.remove("show"),1500);}
function initUI(){buildNav();render();}
