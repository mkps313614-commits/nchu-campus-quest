/**
 * NCHU Campus Quest - Campus Goose Walk Simulation (English Edition)
 */
const GooseAdventure = (() => {
  // Set to true while calibrating building coordinates; set to false when finished
  const DEBUG_PICK_COORDS = true;

  const LOCATIONS = {
    nchu_lake:     { name: "NCHU Lake (Start)", x: 40.0, y: 44.0 },
    main_gate:     { name: "Main Gate", x: 45.5, y: 12.0 },
    library:       { name: "Library", x: 44.0, y: 60.0 },
    admin_bldg:    { name: "Administration Building", x: 40.0, y: 28.0 },
    black_forest:  { name: "Black Forest", x: 40.0, y: 18.5 },
    student_union: { name: "Yuan-Ting", x: 75.0, y: 15.0 },
    gym:           { name: "Gymnasium", x: 60.0, y: 78.0 },
    hui_sen:       { name: "Hui-Sun Auditorium", x: 60.0, y: 14.0 }
  };

  // Road waypoints aligned with your updated LOCATIONS coordinates
  const CUSTOM_ROUTES = {
    // 1. 中興湖 (40.0, 44.0) <-> 行政大樓 (40.0, 25.0)
    "nchu_lake_to_admin_bldg": [
      { x: 40.0, y: 25.0 }
    ],
    "admin_bldg_to_nchu_lake": [
      { x: 40.0, y: 44.0 }
    ],

    // 2. 中興湖 (40.0, 44.0) <-> 黑森林 (40.0, 18.5)
    "nchu_lake_to_black_forest": [
      { x: 36.5, y: 44.0 },
      { x: 36.5, y: 18.5 },
      { x: 40.0, y: 18.5 }
    ],
    "black_forest_to_nchu_lake": [
      { x: 36.5, y: 18.5 },
      { x: 36.5, y: 44.0 },
      { x: 40.0, y: 44.0 }
    ],

    // 3. 中興湖 (40.0, 44.0) <-> 校門口 (45.5, 12.0)
    "nchu_lake_to_main_gate": [
      { x: 45.5, y: 44.0 },
      { x: 45.5, y: 12.0 }
    ],
    "main_gate_to_nchu_lake": [
      { x: 45.5, y: 44.0 },
      { x: 40.0, y: 44.0 }
    ],

    // 4. 中興湖 (40.0, 44.0) <-> 惠蓀堂 (60.0, 14.0)
    "nchu_lake_to_hui_sen": [
      { x: 45.5, y: 44.0 },
      { x: 45.5, y: 19.5 },
      { x: 60.0, y: 19.5 },
      { x: 60.0, y: 14.0 }
    ],
    "hui_sen_to_nchu_lake": [
      { x: 60.0, y: 19.5 },
      { x: 45.5, y: 19.5 },
      { x: 45.5, y: 44.0 },
      { x: 40.0, y: 44.0 }
    ],

    // 5. 中興湖 (40.0, 44.0) <-> 圓廳 (70.0, 15.0)
    "nchu_lake_to_student_union": [
      { x: 45.5, y: 44.0 },
      { x: 45.5, y: 19.5 },
      { x: 70.0, y: 19.5 },
      { x: 70.0, y: 15.0 }
    ],
    "student_union_to_nchu_lake": [
      { x: 70.0, y: 19.5 },
      { x: 45.5, y: 19.5 },
      { x: 45.5, y: 44.0 },
      { x: 40.0, y: 44.0 }
    ],

    // 6. 中興湖 (40.0, 44.0) <-> 圖書館 (48.0, 55.0)
    "nchu_lake_to_library": [
      { x: 40.0, y: 55.0 },
      { x: 44.0, y: 60.0 }
    ],
    "library_to_nchu_lake": [
      { x: 40.0, y: 55.0 },
      { x: 40.0, y: 44.0 }
    ],

    // 7. 中興湖 (40.0, 44.0) <-> 體育館 (50.0, 75.0)
    "nchu_lake_to_gym": [
      { x: 40.0, y: 65.0 },
      { x: 50.0, y: 65.0 },
      { x: 50.0, y: 75.0 }
    ],
    "gym_to_nchu_lake": [
      { x: 50.0, y: 65.0 },
      { x: 40.0, y: 65.0 },
      { x: 40.0, y: 44.0 }
    ]
  };


  // Random & Location-based Encounters (including getting lost!)
  const ENCOUNTERS = [
    {
      id: "goose_got_lost",
      triggerAt: "walking",
      isLostEvent: true, // Special flag: getting lost!
      badgeText: "! LOST ON CAMPUS !",
      title: "Wait... Where Am I?",
      desc: "All the red-brick buildings suddenly look identical! You lost track of the path. What will you do?",
      interactLabel: "Wander Randomly",
      ignoreLabel: "Honk for Help",
      interact: {
        resultText: "You waddled down a mysterious shortcut and ended up somewhere unexpected!",
        achievementId: "ach_lost_explorer",
        achievementName: "Directionally Challenged"
      },
      ignore: {
        resultText: "You let out a loud HONK! A kind freshman pointed you back to the main road.",
        achievementId: "ach_campus_vip",
        achievementName: "Campus VIP Escort"
      }
    },
    {
      id: "bread_student",
      triggerAt: "walking",
      badgeText: "! RANDOM ENCOUNTER !",
      title: "Rushing Student with Bread",
      desc: "A sleepy student sprints past for an 8 AM class, dropping delicious pineapple bun crumbs everywhere!",
      interactLabel: "Ambush & Steal",
      ignoreLabel: "Stay Dignified",
      interact: {
        resultText: "HONK! You charged forward and claimed half the bun. The student fled in terror!",
        achievementId: "ach_bread_thief",
        achievementName: "NCHU Bread Bandit"
      },
      ignore: {
        resultText: "You held your head high, preserving the noble dignity of NCHU geese.",
        achievementId: "ach_noble_goose",
        achievementName: "Lakeside Aristocrat"
      }
    },
    {
      id: "goose_gang",
      triggerAt: "walking",
      badgeText: "! TURF WAR !",
      title: "Rival Goose Patrol",
      desc: "Three senior geese block the crosswalk, staring you down to test your dominance.",
      interactLabel: "Flap Wings Fiercely",
      ignoreLabel: "Waddle Around",
      interact: {
        resultText: "You spread your wings wide and hissed! They stepped aside in respect.",
        achievementId: "ach_alpha_goose",
        achievementName: "Alpha of Zhongxing"
      },
      ignore: {
        resultText: "Peace is always an option. You calmly took the sidewalk.",
        achievementId: null
      }
    },
    {
      id: "library_gate",
      triggerAt: "library",
      badgeText: "! DESTINATION EVENT !",
      title: "Midterm Exam Warrior",
      desc: "A pale student sits on the library steps hugging a giant textbook, trembling in despair.",
      interactLabel: "Comfort with Wing",
      ignoreLabel: "Walk Past",
      interact: {
        resultText: "You gently patted their shoulder with your wing. Their GPA feels blessed!",
        achievementId: "ach_exam_blessing",
        achievementName: "All-Pass Guardian"
      },
      ignore: {
        resultText: "You walked past silently, leaving only webbed footprints behind.",
        achievementId: null
      }
    },
    {
      id: "black_forest_squirrel",
      triggerAt: "black_forest",
      badgeText: "! DESTINATION EVENT !",
      title: "Black Forest Squirrel",
      desc: "A cheeky squirrel leaps down from a tall pine tree and chatters aggressively at you!",
      interactLabel: "Assert Dominance",
      ignoreLabel: "Sunbathe Instead",
      interact: {
        resultText: "One mighty HONK echoed through the trees! The squirrel retreated immediately.",
        achievementId: "ach_campus_boss",
        achievementName: "True Campus Boss"
      },
      ignore: {
        resultText: "You found a sunny patch of grass and took a well-deserved nap.",
        achievementId: null
      }
    }
  ];

  let currentLocId = "nchu_lake";
  let gooseEl = null;
  let isWalking = false;
  let walkInterval = null;
  let activeEncounter = null;
  let activeTargetId = null;
  let stepCounter = 0;

  const mapContainer = document.getElementById("map-container");
  const gooseHud = document.getElementById("goose-hud");
  const statusText = document.getElementById("goose-status-text");
  const destSelect = document.getElementById("goose-dest-select");
  const encounterModal = document.getElementById("encounter-modal");

  function init() {
    if (!mapContainer) return;

    if (DEBUG_PICK_COORDS) {
      mapContainer.addEventListener("click", (e) => {
        const rect = mapContainer.getBoundingClientRect();
        const xPercent = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
        const yPercent = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
        console.log(`📍 Clicked Coords -> { x: ${xPercent}, y: ${yPercent} }`);
        alert(`Coordinates copied to Console:\n{ x: ${xPercent}, y: ${yPercent} }`);
      });
    }

    populateDestinations();
    bindEvents();
  }

  function populateDestinations() {
    destSelect.innerHTML = "";
    Object.entries(LOCATIONS).forEach(([id, loc]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = loc.name;
      destSelect.appendChild(option);
    });
  }

  function bindEvents() {
    document.getElementById("btn-goose-go").addEventListener("click", () => {
      if (isWalking) return;
      const targetId = destSelect.value;
      if (targetId === currentLocId) {
        statusText.textContent = "The goose is already here! Pick another spot.";
        return;
      }
      startWalk(currentLocId, targetId);
    });

    document.getElementById("btn-exit-goose").addEventListener("click", exitGooseMode);
    document.getElementById("btn-choice-interact").addEventListener("click", () => handleChoice("interact"));
    document.getElementById("btn-choice-ignore").addEventListener("click", () => handleChoice("ignore"));
  }

  function enterGooseMode() {
    gooseHud.classList.remove("hidden");
    clearFootprints();

    if (!gooseEl) {
      gooseEl = document.createElement("img");
      gooseEl.src = "images/goose.png";
      gooseEl.alt = "NCHU Goose";
      gooseEl.className = "goose-sprite";
      mapContainer.appendChild(gooseEl);
    }

    currentLocId = "nchu_lake";
    const startPos = LOCATIONS[currentLocId];
    setGoosePosition(startPos.x, startPos.y);
    statusText.textContent = `Current Location: ${startPos.name}`;
  }

  function exitGooseMode() {
    clearInterval(walkInterval);
    isWalking = false;
    gooseHud.classList.add("hidden");
    if (gooseEl) {
      gooseEl.remove();
      gooseEl = null;
    }
    clearFootprints();
  }

  function setGoosePosition(x, y) {
    if (!gooseEl) return;
    gooseEl.style.left = `${x}%`;
    gooseEl.style.top = `${y}%`;
  }

  function startWalk(fromId, toId) {
    isWalking = true;
    activeTargetId = toId;
    clearFootprints();
    gooseEl.classList.add("goose-walking");
    statusText.textContent = `Waddling to ${LOCATIONS[toId].name}...`;

    const routeKey = `${fromId}_to_${toId}`;
    const waypoints = CUSTOM_ROUTES[routeKey]
      ? [...CUSTOM_ROUTES[routeKey]]
      : [{ x: LOCATIONS[toId].x, y: LOCATIONS[toId].y }];

    let currentX = LOCATIONS[fromId].x;
    let currentY = LOCATIONS[fromId].y;
    let waypointIndex = 0;
    let encounteredDuringWalk = false;
    const speed = 0.45;

    walkInterval = setInterval(() => {
      if (encounterModal && !encounterModal.classList.contains("hidden")) {
        return;
      }

      const target = waypoints[waypointIndex];
      const dx = target.x - currentX;
      const dy = target.y - currentY;
      const distance = Math.hypot(dx, dy);

      if (Math.abs(dx) > 0.05) {
        gooseEl.style.setProperty("--dir", dx >= 0 ? 1 : -1);
      }

      if (distance <= speed) {
        currentX = target.x;
        currentY = target.y;
        setGoosePosition(currentX, currentY);
        waypointIndex++;

        if (waypointIndex >= waypoints.length) {
          finishWalk(toId);
        }
        return;
      }

      currentX += (dx / distance) * speed;
      currentY += (dy / distance) * speed;
      setGoosePosition(currentX, currentY);

      stepCounter++;
      if (stepCounter % 4 === 0) {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        spawnFootprint(currentX, currentY, angle);
      }

           // Chance to trigger a random event (including getting lost)
      if (!encounteredDuringWalk && stepCounter > 15 && Math.random() < 0.02) {
        const walkingEvents = ENCOUNTERS.filter((e) => e.triggerAt === "walking");
        if (walkingEvents.length > 0) {
          encounteredDuringWalk = true;
          const randomEvent = walkingEvents[Math.floor(Math.random() * walkingEvents.length)];
          triggerEncounter(randomEvent);
        }
      }
    }, 50);
  }

  function finishWalk(toId) {
    clearInterval(walkInterval);
    isWalking = false;
    currentLocId = toId;
    gooseEl.classList.remove("goose-walking");
    statusText.textContent = `Arrived at: ${LOCATIONS[toId].name}`;

    const buildingEvent = ENCOUNTERS.find((e) => e.triggerAt === toId);
    if (buildingEvent) {
      setTimeout(() => triggerEncounter(buildingEvent), 400);
    }
  }

  function spawnFootprint(x, y, angleDeg) {
    const fp = document.createElement("div");
    fp.className = "goose-footprint";
    const offset = stepCounter % 8 === 0 ? -0.6 : 0.6;
    fp.style.left = `${x + offset}%`;
    fp.style.top = `${y}%`;
    fp.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
    mapContainer.appendChild(fp);
  }

  function clearFootprints() {
    document.querySelectorAll(".goose-footprint").forEach((el) => el.remove());
  }

  function triggerEncounter(encounter) {
    activeEncounter = encounter;
    gooseEl.classList.remove("goose-walking");

    document.querySelector(".encounter-badge").textContent = encounter.badgeText || "! ENCOUNTER !";
    document.getElementById("encounter-title").textContent = encounter.title;
    document.getElementById("encounter-desc").textContent = encounter.desc;
    document.getElementById("btn-choice-interact").textContent = encounter.interactLabel || "Interact";
    document.getElementById("btn-choice-ignore").textContent = encounter.ignoreLabel || "Ignore";

    encounterModal.classList.remove("hidden");
  }

  function handleChoice(choiceType) {
    if (!activeEncounter) return;
    const outcome = activeEncounter[choiceType];

    encounterModal.classList.add("hidden");
    statusText.textContent = outcome.resultText;

    if (outcome.achievementId) {
      unlockAchievement(outcome.achievementId, outcome.achievementName);
    }

    // Special mechanic: if the goose got lost and chose to wander randomly, reroute to a random building!
    if (activeEncounter.isLostEvent && choiceType === "interact" && isWalking) {
      clearInterval(walkInterval);
      const otherLocs = Object.keys(LOCATIONS).filter((id) => id !== currentLocId && id !== activeTargetId);
      const randomDest = otherLocs[Math.floor(Math.random() * otherLocs.length)];
      activeEncounter = null;
      setTimeout(() => {
        statusText.textContent = `Lost! Accidentally heading to ${LOCATIONS[randomDest].name}...`;
        startWalk(currentLocId, randomDest);
      }, 900);
      return;
    }

    activeEncounter = null;
    if (isWalking) {
      gooseEl.classList.add("goose-walking");
    }
  }

  function unlockAchievement(id, name) {
    const unlocked = JSON.parse(localStorage.getItem("nchu_achievements") || "[]");
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem("nchu_achievements", JSON.stringify(unlocked));

      const toast = document.getElementById("achievement-toast");
      document.getElementById("toast-title").textContent = name;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3500);
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  return { enterGooseMode, exitGooseMode };
})();
