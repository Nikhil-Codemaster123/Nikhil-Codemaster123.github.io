
const MODEL_KEY  = "snapspot_user";
const COUNT_KEY  = "snapspot_counts";          // NEW: vote store
let  user   = JSON.parse(localStorage.getItem(MODEL_KEY))  || null;
if (user && !user.starredIDs) user.starredIDs = []; // ensure starredIDs exists
let  counts = JSON.parse(localStorage.getItem(COUNT_KEY))  || {}; // { id:{like:3,dislike:1} }


let  currentFilter = null;

/* --- DOM refs --- */
const list   = document.getElementById("spotList");
const nav    = document.getElementById("tagNav");
const toast  = document.getElementById("toast");
const modal  = document.getElementById("onboard");
const choiceWrap = document.getElementById("tagChoices");
const saveBtn    = document.getElementById("savePrefs");

/* --- All unique tags --- */
const TAGS = [...new Set(SPOTS.flatMap(s => s.tags))].sort();

/* --- first-run onboarding --- */
if (!user) {
  buildOnboard(); modal.classList.add("show");
} else {
  initUI();
}

/* ========== Onboarding modal ========== */
function buildOnboard() {
  TAGS.forEach(t => {
    const chip = document.createElement("div");
    chip.className = "choice"; chip.textContent = t;
    chip.onclick = () => chip.classList.toggle("selected");
    choiceWrap.appendChild(chip);
  });

  saveBtn.onclick = () => {
    const fav = [...document.querySelectorAll(".choice.selected")].map(x => x.textContent);
    user = { likedTags:{}, likedIDs:[], dislikedIDs:[], starredIDs:[] };
    fav.forEach(t => user.likedTags[t] = 5);
    localStorage.setItem(MODEL_KEY, JSON.stringify(user));
    modal.classList.remove("show");
    initUI();
  };
}

/* ========== UI boot ========== */
function initUI() {
  buildNav();
  render();                    // show full list initially
}

/* ========== Navbar with “All” + tags ========== */
function buildNav() {
  nav.innerHTML = "";

  // 1️⃣ Build helper
  const makeBtn = (label, tag = null) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = label;
    btn.onclick = () => {
      document.querySelectorAll(".nav-btn")
        .forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = tag;
      render(tag);
    };
    nav.appendChild(btn);
    return btn;
  };

  // 2️⃣ “All” (first) + “⭐ Starred” (second)
  makeBtn("All").classList.add("active");
  makeBtn("⭐ Starred", "starred");

  // 3️⃣ Sorted tag buttons (user’s most-liked first)
  const sortedTags = [...TAGS].sort(
    (a, b) => (user.likedTags[b] || 0) - (user.likedTags[a] || 0)
  );
  sortedTags.forEach(t => makeBtn(t, t));
}



/* ========== Render card list ========== */
function render(filter = null) {
  // sort by tag preference first, then by like-count
  let spots = [...SPOTS].sort((a, b) => score(b) - score(a) || votes(b) - votes(a));

  if (filter === "starred") {
    spots = spots.filter(s => user.starredIDs.includes(s.id));
  } else if (filter) {
    spots = spots.filter(s => s.tags.includes(filter));
  }

  list.innerHTML = "";
  spots.forEach(s => list.appendChild(buildCard(s)));
}

/* scorer for personal preference */
function score(s) {
  return s.tags.reduce((sum, t) => sum + (user.likedTags[t] || 0), 0);
}

/* helper for total likes – returns 0 if unseen */
function votes(s) {
  return (counts[s.id]?.like || 0);
}

/* ========== Build one card ========== */
function buildCard(spot) {
  // ensure spot.id entry exists in counts
  if (!counts[spot.id]) counts[spot.id] = { like: 0, dislike: 0 };
  const { like, dislike } = counts[spot.id];

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${spot.img}" alt="${spot.name}">
    <div class="inner">
      <h3>${spot.name}</h3>
      ${spot.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      <div class="votes">👍 <span data-likes>${like}</span>
           &nbsp;&nbsp; 👎 <span data-dislikes>${dislike}</span></div>
    </div>
    <div class="actions">
      <button data-like>👍</button>
      <button data-dislike>👎</button>
      <button data-fav>${user.starredIDs.includes(spot.id) ? "⭐" : "☆"}</button>
    </div>`;

  /* grab buttons */
  const likeBtn   = card.querySelector("[data-like]");
  const dislikeBtn= card.querySelector("[data-dislike]");
  const starBtn   = card.querySelector("[data-fav]");

  /* hook events */
  likeBtn.onclick    = () => rate(spot, "like", card);
  dislikeBtn.onclick = () => rate(spot, "dislike", card);
  starBtn.onclick    = () => toggleStar(spot, starBtn);

  /* border highlight only if liked */
  card.style.borderColor = user.likedIDs.includes(spot.id) ? "#0a0" : "";

  return card;
}

/* ========== Star / un-star ========== */
function toggleStar(spot, starBtn) {
  const idx = user.starredIDs.indexOf(spot.id);

  if (idx === -1) {
    user.starredIDs.push(spot.id);
    starBtn.textContent = "⭐";
    toastMsg("Starred!");
  } else {
    user.starredIDs.splice(idx, 1);
    starBtn.textContent = "☆";
    toastMsg("Unstarred!");
  }

  localStorage.setItem(MODEL_KEY, JSON.stringify(user));

  // If we're on the ⭐ tab, refresh list so removed items disappear immediately
  if (currentFilter === "starred") render("starred");
  else buildNav();   // keep nav order fresh
}


/* ========== Rating logic ========== */
function rate(spot, type, card) {
  const c = counts[spot.id] || (counts[spot.id] = { like: 0, dislike: 0 });

  if (type === "like") {
    c.like += 1;
    if (!user.likedIDs.includes(spot.id)) user.likedIDs.push(spot.id);
    spot.tags.forEach(t => user.likedTags[t] = (user.likedTags[t] || 0) + 1);
    card.style.borderColor = "#0a0";
    toastMsg("Liked!");
  } else {
    c.dislike += 1;
    if (!user.dislikedIDs.includes(spot.id)) user.dislikedIDs.push(spot.id);
    toastMsg("Noted!");
  }

  // save models
  localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
  localStorage.setItem(MODEL_KEY,  JSON.stringify(user));

  // update numbers live in this card
  card.querySelector("[data-likes]").textContent    = c.like;
  card.querySelector("[data-dislikes]").textContent = c.dislike;

  // re-render list immediately for new order
  buildNav(); //update navbar
  render(currentFilter);
}


/* ========== Toast helper ========== */
function toastMsg(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}
