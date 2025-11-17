const caTasks = [
  { id: 1, name: "First Blood", tier: "easy", description: "Complete any Slayer task without leaving the area.", points: 3 },
  { id: 2, name: "Campfire Stories", tier: "easy", description: "Light 10 campfires while on a Slayer task.", points: 2 },
  { id: 3, name: "Dungeon Brawler", tier: "medium", description: "Defeat 30 cave creatures without banking.", points: 5 },
  { id: 4, name: "Bossing 101", tier: "medium", description: "Kill any mid-tier boss with no food remaining.", points: 6 },
  { id: 5, name: "Gauntlet Graduate", tier: "hard", description: "Complete the Gauntlet without prayer flicking.", points: 9 },
  { id: 6, name: "Slayer Masterpiece", tier: "hard", description: "Finish a 200-kill task with zero deaths.", points: 10 },
  { id: 7, name: "Chambers Tactician", tier: "elite", description: "Finish a 3-man raid with no wipes.", points: 12 },
  { id: 8, name: "Inferno Spark", tier: "elite", description: "Defeat wave 69 with only melee gear equipped.", points: 14 },
  { id: 9, name: "Grandmaster Mind", tier: "master", description: "Perfect mechanics on a random rotating boss list.", points: 18 },
  { id: 10, name: "Iron Legend", tier: "master", description: "Complete a custom speedrun challenge under time.", points: 20 }
];

const defaultUnlockedSkills = new Set([
  "Attack",
  "Strength",
  "Defence",
  "Hitpoints",
  "Prayer",
  "Slayer"
]);

const skillPool = [
  "Magic",
  "Ranged",
  "Agility",
  "Herblore",
  "Thieving",
  "Crafting",
  "Fletching",
  "Runecraft",
  "Construction",
  "Mining",
  "Smithing",
  "Fishing",
  "Cooking",
  "Firemaking",
  "Woodcutting",
  "Farming",
  "Hunter"
];

const questPool = [
  { name: "Cook's Assistant", points: 1, region: "Lumbridge" },
  { name: "Waterfall Quest", points: 1, region: "Baxtorian" },
  { name: "Fairytale I - Growing Pains", points: 2, region: "Zanaris" },
  { name: "Monkey Madness", points: 3, region: "Ape Atoll" },
  { name: "Lunar Diplomacy", points: 2, region: "Moon Clan" },
  { name: "Dragon Slayer II", points: 5, region: "Kourend" },
  { name: "Song of the Elves", points: 4, region: "Prifddinas" }
];

const shopPool = [
  { name: "General Stores", description: "Basic supplies and starter gear." },
  { name: "Slayer Masters", description: "Unlock Konar, Nieve/Steve, and Duradel." },
  { name: "Farming Shops", description: "Seeds, compost, and herb runs." },
  { name: "Magic Shops", description: "Runes and mystic gear." },
  { name: "Ranging Shops", description: "Arrows, darts, and broad ammo." },
  { name: "Construction Suppliers", description: "Planks, nails, and sawmills." }
];

const state = {
  pointsEarned: 0,
  pointsSpent: 0,
  caCompletions: 0,
  unlockedSkills: new Set(defaultUnlockedSkills),
  purchasedSkills: 0,
  unlockedQuests: new Set(),
  unlockedShops: new Set(),
  completedTasks: new Set(),
  showCompleted: true,
  tierFilter: "all",
  activeView: "tasks",
  journal: []
};

const summaryEl = document.getElementById("summary");
const caListEl = document.getElementById("caGrid");
const skillsEl = document.getElementById("skills");
const questsEl = document.getElementById("quests");
const shopsEl = document.getElementById("shops");
const journalEl = document.getElementById("journal");
const unlockSummaryEl = document.getElementById("unlockSummary");

const showCompletedToggle = document.getElementById("showCompleted");
const resetBtn = document.getElementById("resetProgress");
const addCustomPointsBtn = document.getElementById("addCustomPoints");
const customPointsModal = document.getElementById("customPointsModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModal");
const customPointsForm = document.getElementById("customPointsForm");
const customPointsValue = document.getElementById("customPointsValue");
const clearLogBtn = document.getElementById("clearLog");
const unlockTabs = document.querySelectorAll("[data-unlock]");
const unlockViews = document.querySelectorAll("[data-unlock-view]");
const tierButtons = document.querySelectorAll("#tierFilter [data-tier]");
const viewTabs = document.querySelectorAll("[data-view-target]");
const views = document.querySelectorAll("[data-view]");
const skillCountEl = document.getElementById("skillCount");
const questCountEl = document.getElementById("questCount");
const shopCountEl = document.getElementById("shopCount");
const toastEl = document.getElementById("toast");

function formatPoints(value) {
  return `${value} pt${value === 1 ? "" : "s"}`;
}

function getAvailablePoints() {
  return state.pointsEarned - state.pointsSpent;
}

function getNextSkillCost() {
  return 1 + state.purchasedSkills;
}

function setActiveView(viewName) {
  state.activeView = viewName;
  viewTabs.forEach((tab) => {
    tab.classList.toggle("view-nav__btn--active", tab.dataset.viewTarget === viewName);
  });
  views.forEach((panel) => {
    panel.classList.toggle("view--active", panel.dataset.view === viewName);
  });
}

function renderSummary() {
  const available = getAvailablePoints();
  summaryEl.innerHTML = `
    <div class="stat">
      <div class="stat__label">Available Points</div>
      <div class="stat__value stat__value--accent">${available}</div>
    </div>
    <div class="stat">
      <div class="stat__label">Total Earned</div>
      <div class="stat__value">${state.pointsEarned}</div>
    </div>
    <div class="stat">
      <div class="stat__label">Spent on Unlocks</div>
      <div class="stat__value">${state.pointsSpent}</div>
    </div>
    <div class="stat">
      <div class="stat__label">CA Completions</div>
      <div class="stat__value">${state.caCompletions}</div>
    </div>
  `;
}

function setActiveUnlock(viewName) {
  unlockTabs.forEach((tab) => {
    const isActive = tab.dataset.unlock === viewName;
    tab.classList.toggle("segment__btn--active", isActive);
  });

  unlockViews.forEach((panel) => {
    const isActive = panel.dataset.unlockView === viewName;
    panel.classList.toggle("hidden", !isActive);
  });
}

function setTierFilter(tier) {
  state.tierFilter = tier;
  tierButtons.forEach((btn) => {
    const isActive = btn.dataset.tier === tier;
    btn.classList.toggle("segment__btn--active", isActive);
  });
  renderTasks();
}

function renderTasks() {
  const showCompleted = state.showCompleted;
  const availablePoints = getAvailablePoints();
  caListEl.innerHTML = "";

  caTasks
    .filter((task) => state.tierFilter === "all" || task.tier === state.tierFilter)
    .forEach((task) => {
      const completed = state.completedTasks.has(task.id);
      if (!showCompleted && completed) return;

      const card = document.createElement("article");
      card.className = `card ${completed ? "card--done" : ""}`;

      const header = document.createElement("div");
      header.className = "card__header";
      header.innerHTML = `
        <div>
          <p class="card__title">${task.name}</p>
          <p class="meta">${task.points} CA pts</p>
        </div>
        <span class="tier tier--${task.tier}">${task.tier}</span>
      `;

      const desc = document.createElement("p");
      desc.className = "card__desc";
      desc.textContent = task.description;

      const actions = document.createElement("div");
      actions.className = "card__actions";

      const completeBtn = document.createElement("button");
      completeBtn.className = "button button--small";
      completeBtn.textContent = completed ? "Completed" : "Claim points";
      completeBtn.disabled = completed;

      completeBtn.addEventListener("click", () => {
        state.completedTasks.add(task.id);
        state.pointsEarned += task.points;
        state.caCompletions += 1;
        addLog(`Completed ${task.name} for ${formatPoints(task.points)}.`);
        renderAll();
        showToast(`+${task.points} CA points earned`);
      });

      const unlockHint = document.createElement("span");
      unlockHint.className = "badge";
      unlockHint.textContent = availablePoints >= task.points ? "Spendable" : "Bank it";

      actions.appendChild(unlockHint);
      actions.appendChild(completeBtn);

      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(actions);

      caListEl.appendChild(card);
    });
}

function renderSkills() {
  const cost = getNextSkillCost();
  const available = getAvailablePoints();
  skillsEl.innerHTML = "";

  skillPool.forEach((skill) => {
    const unlocked = state.unlockedSkills.has(skill);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__header">
        <p class="card__title">${skill}</p>
        <span class="pill">${unlocked ? "Unlocked" : `${cost} pts`}</span>
      </div>
      <p class="card__desc">${unlocked ? "Already active for your Ironman." : "Lift the lock to train and benefit."}</p>
    `;

    const action = document.createElement("div");
    action.className = "card__actions";

    const button = document.createElement("button");
    button.className = "button button--small";
    button.textContent = unlocked ? "Active" : "Unlock";
    button.disabled = unlocked || available < cost;

    button.addEventListener("click", () => {
      const nextCost = getNextSkillCost();
      if (getAvailablePoints() < nextCost) return;
      state.unlockedSkills.add(skill);
      state.purchasedSkills += 1;
      state.pointsSpent += nextCost;
      addLog(`Unlocked ${skill} for ${formatPoints(nextCost)}.`);
      renderAll();
      showToast(`${skill} unlocked`);
    });

    action.appendChild(document.createElement("span"));
    action.appendChild(button);

    card.appendChild(action);
    skillsEl.appendChild(card);
  });
}

function renderQuests() {
  const available = getAvailablePoints();
  questsEl.innerHTML = "";

  questPool.forEach((quest) => {
    const unlocked = state.unlockedQuests.has(quest.name);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__header">
        <p class="card__title">${quest.name}</p>
        <span class="pill">${unlocked ? "Unlocked" : `${quest.points} pts`}</span>
      </div>
      <p class="card__desc">${quest.region} storyline gateway.</p>
    `;

    const action = document.createElement("div");
    action.className = "card__actions";

    const button = document.createElement("button");
    button.className = "button button--small";
    button.textContent = unlocked ? "Active" : "Unlock";
    button.disabled = unlocked || available < quest.points;

    button.addEventListener("click", () => {
      if (getAvailablePoints() < quest.points) return;
      state.unlockedQuests.add(quest.name);
      state.pointsSpent += quest.points;
      addLog(`Unlocked ${quest.name} for ${formatPoints(quest.points)}.`);
      renderAll();
      showToast(`${quest.name} unlocked`);
    });

    action.appendChild(document.createElement("span"));
    action.appendChild(button);
    card.appendChild(action);
    questsEl.appendChild(card);
  });
}

function renderShops() {
  const available = getAvailablePoints();
  shopsEl.innerHTML = "";

  shopPool.forEach((shop) => {
    const unlocked = state.unlockedShops.has(shop.name);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__header">
        <p class="card__title">${shop.name}</p>
        <span class="pill">${unlocked ? "Unlocked" : "1 pt"}</span>
      </div>
      <p class="card__desc">${shop.description}</p>
    `;

    const action = document.createElement("div");
    action.className = "card__actions";

    const button = document.createElement("button");
    button.className = "button button--small";
    button.textContent = unlocked ? "Active" : "Unlock";
    button.disabled = unlocked || available < 1;

    button.addEventListener("click", () => {
      if (getAvailablePoints() < 1) return;
      state.unlockedShops.add(shop.name);
      state.pointsSpent += 1;
      addLog(`Unlocked ${shop.name} for 1 point.`);
      renderAll();
      showToast(`${shop.name} unlocked`);
    });

    action.appendChild(document.createElement("span"));
    action.appendChild(button);
    card.appendChild(action);
    shopsEl.appendChild(card);
  });
}

function renderJournal() {
  journalEl.innerHTML = "";
  if (!state.journal.length) {
    const empty = document.createElement("div");
    empty.className = "log__entry";
    empty.textContent = "Journal is empty—start locking and unlocking.";
    journalEl.appendChild(empty);
    return;
  }

  state.journal
    .slice()
    .reverse()
    .forEach((entry) => {
      const row = document.createElement("div");
      row.className = "log__entry";
      row.textContent = entry;
      journalEl.appendChild(row);
    });
}

function renderUnlockSummary() {
  unlockSummaryEl.innerHTML = `
    <div class="stat">
      <div class="stat__label">Skill locks lifted</div>
      <div class="stat__value">${state.unlockedSkills.size}</div>
    </div>
    <div class="stat">
      <div class="stat__label">Quest gates opened</div>
      <div class="stat__value">${state.unlockedQuests.size}</div>
    </div>
    <div class="stat">
      <div class="stat__label">Shop permits</div>
      <div class="stat__value">${state.unlockedShops.size}</div>
    </div>
  `;

  skillCountEl.textContent = state.unlockedSkills.size;
  questCountEl.textContent = state.unlockedQuests.size;
  shopCountEl.textContent = state.unlockedShops.size;
}

function addLog(entry) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.journal.push(`[${timestamp}] ${entry}`);
}

function resetState() {
  state.pointsEarned = 0;
  state.pointsSpent = 0;
  state.caCompletions = 0;
  state.unlockedSkills = new Set(defaultUnlockedSkills);
  state.purchasedSkills = 0;
  state.unlockedQuests = new Set();
  state.unlockedShops = new Set();
  state.completedTasks = new Set();
  state.showCompleted = true;
  state.tierFilter = "all";
  state.activeView = "tasks";
  state.journal = [];
  showCompletedToggle.checked = true;
  setTierFilter("all");
  setActiveView("tasks");
  addLog("Run reset. Default combat stats remain open.");
  renderAll();
  showToast("Run reset");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("toast--visible");
  setTimeout(() => toastEl.classList.remove("toast--visible"), 1600);
}

function renderAll() {
  renderSummary();
  renderTasks();
  renderSkills();
  renderQuests();
  renderShops();
  renderJournal();
  renderUnlockSummary();
}

function setupEvents() {
  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveView(tab.dataset.viewTarget));
  });

  showCompletedToggle.addEventListener("change", (e) => {
    state.showCompleted = e.target.checked;
    renderTasks();
  });

  resetBtn.addEventListener("click", resetState);

  addCustomPointsBtn.addEventListener("click", () => customPointsModal.classList.remove("hidden"));
  closeModalBtn.addEventListener("click", () => customPointsModal.classList.add("hidden"));
  cancelModalBtn.addEventListener("click", () => customPointsModal.classList.add("hidden"));

  customPointsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = Number(customPointsValue.value) || 0;
    if (value <= 0) return;
    state.pointsEarned += value;
    addLog(`Added ${formatPoints(value)} manually.`);
    customPointsModal.classList.add("hidden");
    renderAll();
    showToast(`+${value} CA points added`);
  });

  clearLogBtn.addEventListener("click", () => {
    state.journal = [];
    renderJournal();
  });

  unlockTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveUnlock(tab.dataset.unlock);
    });
  });

  tierButtons.forEach((btn) => {
    btn.addEventListener("click", () => setTierFilter(btn.dataset.tier));
  });
}

setupEvents();
resetState();
renderAll();
