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
  journal: []
};

const summaryEl = document.getElementById("summary");
const caListEl = document.getElementById("caList");
const skillsEl = document.getElementById("skills");
const questsEl = document.getElementById("quests");
const shopsEl = document.getElementById("shops");
const journalEl = document.getElementById("journal");

const showCompletedToggle = document.getElementById("showCompleted");
const resetBtn = document.getElementById("resetProgress");
const addCustomPointsBtn = document.getElementById("addCustomPoints");
const customPointsModal = document.getElementById("customPointsModal");
const closeModalBtn = document.getElementById("closeModal");
const customPointsForm = document.getElementById("customPointsForm");
const customPointsValue = document.getElementById("customPointsValue");
const clearLogBtn = document.getElementById("clearLog");

function formatPoints(value) {
  return `${value} pt${value === 1 ? "" : "s"}`;
}

function getAvailablePoints() {
  return state.pointsEarned - state.pointsSpent;
}

function getNextSkillCost() {
  return 1 + state.purchasedSkills * 2;
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

function renderTasks() {
  const showCompleted = state.showCompleted;
  const availablePoints = getAvailablePoints();
  caListEl.innerHTML = "";

  caTasks.forEach((task) => {
    const completed = state.completedTasks.has(task.id);
    if (!showCompleted && completed) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__title">
        <span class="tag tag--${task.tier}">${task.tier}</span>
        <span>${task.name}</span>
      </div>
      <div class="card__description">${task.description}</div>
      <div class="card__footer">
        <div class="card__meta">
          <span class="badge">${formatPoints(task.points)}</span>
          <span class="badge">${completed ? "Completed" : "Not done"}</span>
        </div>
        <button class="button button--primary" ${completed ? "disabled" : ""}>
          ${completed ? "Claimed" : "Complete task"}
        </button>
      </div>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => completeTask(task));

    caListEl.appendChild(card);
  });
}

function renderSkills() {
  skillsEl.innerHTML = "";
  const available = getAvailablePoints();
  const nextCost = getNextSkillCost();

  const unlockedDisplay = document.createElement("div");
  unlockedDisplay.className = "card";
  unlockedDisplay.innerHTML = `
    <div class="card__title">Unlocked skills</div>
    <div class="card__description">${Array.from(state.unlockedSkills).sort().join(", ")}</div>
    <div class="progress"><div class="progress__bar" style="width:${
      (state.unlockedSkills.size / (skillPool.length + defaultUnlockedSkills.size)) * 100
    }%"></div></div>
  `;

  skillsEl.appendChild(unlockedDisplay);

  const list = document.createElement("div");
  list.className = "list";

  skillPool.forEach((skill) => {
    const unlocked = state.unlockedSkills.has(skill);
    const cost = nextCost;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__title">${skill}</div>
      <div class="card__meta">
        <span class="badge">Next skill cost: ${cost} pts</span>
        <span class="badge">${unlocked ? "Unlocked" : "Locked"}</span>
      </div>
      <div class="card__footer">
        <div class="card__description">${
          unlocked
            ? "Ready to train and interact with your adventure."
            : "Spend Combat Achievement points to permanently unlock this skill."
        }</div>
        <button class="button button--primary" ${
          unlocked || available < cost ? "disabled" : ""
        }>Unlock</button>
      </div>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => unlockSkill(skill));
    list.appendChild(card);
  });

  skillsEl.appendChild(list);
}

function renderQuests() {
  questsEl.innerHTML = "";
  const available = getAvailablePoints();

  questPool.forEach((quest) => {
    const unlocked = state.unlockedQuests.has(quest.name);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__title">${quest.name}</div>
      <div class="card__meta">
        <span class="badge">${formatPoints(quest.points)}</span>
        <span class="badge">${quest.region}</span>
      </div>
      <div class="card__footer">
        <div class="card__description">${
          unlocked
            ? "Quest unlocked. Story progression awaits!"
            : "Unlock to access quest rewards, areas, and additional NPCs."
        }</div>
        <button class="button button--primary" ${
          unlocked || available < quest.points ? "disabled" : ""
        }>${unlocked ? "Unlocked" : "Unlock quest"}</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => unlockQuest(quest));
    questsEl.appendChild(card);
  });
}

function renderShops() {
  shopsEl.innerHTML = "";
  const available = getAvailablePoints();

  shopPool.forEach((shop) => {
    const unlocked = state.unlockedShops.has(shop.name);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__title">${shop.name}</div>
      <div class="card__description">${shop.description}</div>
      <div class="card__footer">
        <span class="badge">Cost: 1 pt</span>
        <button class="button button--primary" ${
          unlocked || available < 1 ? "disabled" : ""
        }>${unlocked ? "Unlocked" : "Unlock"}</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => unlockShop(shop));
    shopsEl.appendChild(card);
  });
}

function logEvent(text) {
  const entry = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${text}`;
  state.journal.unshift(entry);
  if (state.journal.length > 30) state.journal.pop();
  renderJournal();
}

function renderJournal() {
  journalEl.innerHTML = "";
  if (!state.journal.length) {
    const empty = document.createElement("li");
    empty.textContent = "Complete tasks and spend points to fill your Rune Journal.";
    journalEl.appendChild(empty);
    return;
  }

  state.journal.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    journalEl.appendChild(li);
  });
}

function completeTask(task) {
  if (state.completedTasks.has(task.id)) return;
  state.completedTasks.add(task.id);
  state.pointsEarned += task.points;
  state.caCompletions += 1;
  logEvent(`Completed ${task.name} for ${formatPoints(task.points)}.`);
  renderAll();
}

function unlockSkill(skill) {
  if (state.unlockedSkills.has(skill)) return;
  const cost = getNextSkillCost();
  if (getAvailablePoints() < cost) return;
  state.unlockedSkills.add(skill);
  state.pointsSpent += cost;
  state.purchasedSkills += 1;
  logEvent(`Unlocked ${skill} for ${formatPoints(cost)}.`);
  renderAll();
}

function unlockQuest(quest) {
  if (state.unlockedQuests.has(quest.name)) return;
  if (getAvailablePoints() < quest.points) return;
  state.unlockedQuests.add(quest.name);
  state.pointsSpent += quest.points;
  logEvent(`Unlocked ${quest.name} for ${formatPoints(quest.points)}.`);
  renderAll();
}

function unlockShop(shop) {
  if (state.unlockedShops.has(shop.name)) return;
  if (getAvailablePoints() < 1) return;
  state.unlockedShops.add(shop.name);
  state.pointsSpent += 1;
  logEvent(`Unlocked ${shop.name} for 1 point.`);
  renderAll();
}

function resetProgress() {
  state.pointsEarned = 0;
  state.pointsSpent = 0;
  state.caCompletions = 0;
  state.unlockedSkills = new Set(defaultUnlockedSkills);
  state.purchasedSkills = 0;
  state.unlockedQuests = new Set();
  state.unlockedShops = new Set();
  state.completedTasks = new Set();
  state.journal = [];
  logEvent("Run reset. Ready for fresh combat achievements.");
  renderAll();
}

function openModal() {
  customPointsModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  customPointsModal.setAttribute("aria-hidden", "true");
}

function handleCustomPoints(event) {
  event.preventDefault();
  const value = Number(customPointsValue.value || 0);
  if (value <= 0) return;
  state.pointsEarned += value;
  logEvent(`Added ${formatPoints(value)} from real-game progress.`);
  renderAll();
  closeModal();
}

function renderAll() {
  renderSummary();
  renderTasks();
  renderSkills();
  renderQuests();
  renderShops();
  renderJournal();
}

// Event wiring
showCompletedToggle.addEventListener("change", (e) => {
  state.showCompleted = e.target.checked;
  renderTasks();
});

resetBtn.addEventListener("click", resetProgress);
addCustomPointsBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
customPointsForm.addEventListener("submit", handleCustomPoints);
clearLogBtn.addEventListener("click", () => {
  state.journal = [];
  renderJournal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && customPointsModal.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});

// Init
state.showCompleted = true;
renderAll();
logEvent("Your Ironman starts with Attack, Strength, Defence, Hitpoints, Prayer, and Slayer.");
