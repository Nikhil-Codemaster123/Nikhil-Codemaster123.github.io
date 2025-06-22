/***** constants & model keys *****/
const MODEL_KEY = "snapspot_user";
let user = JSON.parse(localStorage.getItem(MODEL_KEY)) || null;  // null if first run
let currentFilter = null;           // null = "Home / All" view

/***** DOM refs *****/
const listEl   = document.getElementById("spotList");
const toggleEl = document.getElementById("personalToggle");
const toastEl  = document.getElementById("toast");
const navEl    = document.getElementById("tagNav");

/***** first-run onboarding *****/
const onboard  = document.getElementById("onboard");
const choiceWrap = document.getElementById("tagChoices");
const savePrefsBtn = document.getElementById("savePrefs");

/***** get all unique tags *****/
const ALL_TAGS = Array.from(new Set(SPOTS.flatMap(s => s.tags))).sort();

/***** first-run check *****/
if (!user) {
  buildOnboard();
  onboard.classList.add("show");
} else {
  initUI();
}

/*──────────────────────────────────────────────────────────
  Onboarding (same as before)
──────────────────────────────────────────────────────────*/
function buildOnboard() {
  ALL_TAGS.forEach(tag => {
    const chip = document.createElement("div");
    chip.className = "choice";
    chip.textContent = tag;
    chip.onclick = () => chip.classList.toggle("selected");
    choiceWrap.appendChild(chip);
  });

  savePrefsBtn.onclick = () => {
    const favTags = Array.from(document.querySelectorAll(".choice.selected"))
                         .map(el => el.textContent);
    user = { likedTags: {}, likedIDs: [], dislikedIDs: [] };
    favTags.forEach(t => user.likedTags[t] = 5);
    localStorage.setItem(MODEL_KEY, JSON.stringify(user));
    onboard.classList.remove("show");
    initUI();
  };
}

/*──────────────────────────────────────────────────────────
  Main UI
──────────────────────────────────────────────────────────*/
function initUI() {
  toggleEl.checked = true;               // default to personalized
  toggleEl.addEventListener("change", () => render(currentFilter));
  buildNavbar();
  render();                              // initial render (no filter)
}

/* Build navbar with HOME ("All") + every tag */
function buildNavbar() {
  navEl.innerHTML = "";

  // --- Home / All tab ---
  const homeBtn = document.createElement("button");
  homeBtn.className = "nav-btn";
  homeBtn.textContent = "All";
  homeBtn.onclick = () => {
    currentFilter = null;
    setActiveNav(homeBtn);
    render(null);
  };
  navEl.appendChild(homeBtn);

  // --- Tag buttons ---
  ALL_TAGS.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = tag;
    btn.onclick = () => {
      currentFilter = tag;
      setActiveNav(btn);
      render(tag);
    };
    navEl.appendChild(btn);
  });

  // Activate "All" by default
  setActiveNav(homeBtn);
}

/* Helper: highlight the active nav button */
function setActiveNav(activeBtn) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

/*──────────────────────────────────────────────────────────
  Render cards – accepts optional tag filter
──────────────────────────────────────────────────────────*/
function render(filterTag = null) {
  const personalized = toggleEl.checked;
  let spots = personalized ? sortByPreference([...SPOTS]) : shuffle([...SPOTS]);
  if (filterTag) spots = spots.filter(s => s.tags.includes(filterTag));

  listEl.innerHTML = "";
  spots.forEach(s => listEl.appendChild(buildCard(s, personalized)));
}

/* Build single card (unchanged) */
function buildCard(spot, personalized) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${spot.img}" alt="${spot.name}">
    <div class="inner">
      <h3>${spot.name}</h3>
      ${spot.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
    </div>
    <div class="actions">
      <button data-like>👍</button>
      <button data-dislike>👎</button>
      <button data-fav>⭐</button>
    </div>
  `;

  card.querySelector("[data-like]").onclick =
  card.querySelector("[data-fav]").onclick = () => rate(spot,"like");
  card.querySelector("[data-dislike]").onclick = () => rate(spot,"dislike");

  if (personalized && user.likedIDs.includes(spot.id)) card.style.borderColor = "#0a0";
  return card;
}

/* Rate & update model (unchanged) */
function rate(spot, type) {
  if (type==="like") {
    if (!user.likedIDs.includes(spot.id)) user.likedIDs.push(spot.id);
    spot.tags.forEach(t=> user.likedTags[t]=(user.likedTags[t]||0)+1);
    showToast("Saved to preferences");
  } else {
    if (!user.dislikedIDs.includes(spot.id)) user.dislikedIDs.push(spot.id);
    showToast("We’ll show fewer like that");
  }
  localStorage.setItem(MODEL_KEY, JSON.stringify(user));
  render(currentFilter);                 // re-render with same filter
}

/* Personalization scoring (unchanged) */
function sortByPreference(arr){
  return arr.sort((a,b)=>score(b)-score(a));
  function score(s){
    return s.tags.reduce((sum,t)=>sum+(user.likedTags[t]||0),0);
  }
}

/* Random shuffle (unchanged) */
function shuffle(a){
  for (let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* Toast helper (unchanged) */
function showToast(msg){
  toastEl.textContent=msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"),1500);
}
