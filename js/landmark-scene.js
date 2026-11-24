/**
 * NCHU Campus Quest - Landmark Zoom-In & Fullscreen RPG Dialogue Overlay
 */
const LandmarkScene = (() => {
  // 1. 所有對話統一使用的背景圖片
  const UNIFIED_DIALOGUE_BG = "images/dialogue-bg.png";

  const SCENE_DATABASE = {
    "College of Liberal Arts": {
      outdoorBg: "images/bg-humanities-out.png",
      indoorBg: "images/bg-humanities-in.png",
      doorLabel: "Enter Humanities Bldg",
      exitLabel: "Step Outside",
      outdoorActors: [
        {
          id: "humanities_granny",
          name: "Tai Chi Granny",
          closeupImg: "images/npc-granny.png",
          x: 78,
          y: 26,
          dialogue: "Good morning! Doing Tai Chi in front of the Humanities Building keeps you energetic. Want to join?",
          choices: [
            {
              text: "Hello! Can I practice Tai Chi with you?",
              playerLine: "Wow! Granny, your Tai Chi moves look amazing! Can I join?",
              reply: "Haha, of course! Follow my breathing—inhale slowly and stretch those wings!"
            },
            {
              text: "I'm rushing to my 8 AM class!",
              playerLine: "Good morning Granny! Sorry, I have an 8 AM lecture!",
              reply: "Run along then, Campus Rookie! Watch out for the geese by the lake!"
            }
          ]
        },
        {
          id: "humanities_cat",
          name: "Sleeping Orange Cat",
          closeupImg: "images/npc-cat.png",
          x: 24,
          y: 72,
          dialogue: "Purrrr... Zzz... (The famous orange campus cat is sunbathing peacefully by the Humanities lawn.)",
          choices: [
            {
              text: "Gently pat its head",
              playerLine: "So fluffy... Let me gently pet your head~",
              reply: "Meow~ The cat leans into your hand and purrs loudly. Midterm stress -50%!"
            },
            {
              text: "Walk away quietly",
              playerLine: "Shh... Better not wake up the boss of the Humanities lawn.",
              reply: "You tip-toe past quietly so it can enjoy its afternoon nap."
            }
          ]
        },
        {
          id: "humanities_student",
          name: "Literature Student",
          closeupImg: "images/npc-student.png",
          x: 77,
          y: 75,
          dialogue: "Hey there! Are you new to NCHU? The College of Liberal Arts is a great place to explore! Want a quick tip?",
          choices: [
            {
              text: "Tell me more about this building!",
              playerLine: "What departments are inside the College of Liberal Arts?",
              reply: "Chinese, Foreign Languages, History, and more! It's one of the coziest spots on campus."
            },
            {
              text: "I'll head inside right now!",
              playerLine: "Thanks for the tip! I'm going to check out the interior.",
              reply: "Awesome! Just tap the 'Enter Humanities Bldg' button at the front entrance!"
            }
          ]
        }
      ],
      indoorActors: [
        {
          id: "humanities_prof",
          name: "Fried Chicken Master",
          closeupImg: "images/npc-prof.png",
          x: 28,
          y: 65,
          dialogue: "(Talking something about lunch boxes...)",
          choices: [
            {
              text: "answer 1",
              playerLine: "1",
              reply: "reply 1."
            },
            {
              text: "answer 2",
              playerLine: "2",
              reply: "reply 2."
            }
          ]
        },
        {
          id: "poetry_board",
          name: "Campus Poetry Wall",
          closeupImg: "images/item-poetry.png",
          x: 74,
          y: 62,
          dialogue: "A poem reads: 'Im a poam.'",
          choices: [
            {
              text: "Leave a pixel goose sticker",
              playerLine: "Let's stick a tiny NCHU Goose badge right next to this poem!",
              reply: "You placed a sticker on the board. +10 Campus Spirit!"
            },
            {
              text: "Keep reading",
              playerLine: "What lovely writing by NCHU students!",
              reply: "You admired the student artwork and literary magazine posters."
            }
          ]
        }
      ]
    }
  };

  function getSceneData(landmarkName) {
    if (SCENE_DATABASE[landmarkName]) {
      return SCENE_DATABASE[landmarkName];
    }
    return {
      outdoorBg: "",
      indoorBg: "",
      doorLabel: "Enter Building",
      exitLabel: "Step Outside",
      outdoorActors: [
        {
          id: "default_student",
          name: "NCHU Senior",
          closeupImg: "images/npc-default.png",
          x: 26,
          y: 74,
          dialogue: `Welcome to ${landmarkName}! Want a quick tip about this spot?`,
          choices: [
            {
              text: "Yes, tell me a fun fact!",
              playerLine: `What's special about ${landmarkName}?`,
              reply: `Step inside ${landmarkName} using the door button to discover hidden campus stories!`
            },
            {
              text: "Just passing by!",
              playerLine: "Just waddling through on my campus tour!",
              reply: "Have a great walk around NCHU! Watch out for wandering geese!"
            }
          ]
        }
      ],
      indoorActors: [
        {
          id: "default_info",
          name: "Info Kiosk",
          closeupImg: "images/npc-default.png",
          x: 50,
          y: 65,
          dialogue: `You are now inside ${landmarkName}. What would you like to check?`,
          choices: [
            {
              text: "Read building info",
              playerLine: "Let's see what happens inside this building.",
              reply: `${landmarkName} is an essential hub for student learning and campus events at NCHU.`
            }
          ]
        }
      ]
    };
  }

  let currentLandmark = null;
  let isIndoor = false;

  const zoneMapStage = document.getElementById("zone-map-stage");
  const buildingSceneStage = document.getElementById("building-scene-stage");
  const sceneCanvas = document.getElementById("rpg-scene-canvas");
  const buildingBox = document.getElementById("scene-building-box");
  const buildingSign = document.getElementById("scene-building-sign");
  const enterBtn = document.getElementById("btn-enter-building");
  const locationBadge = document.getElementById("scene-location-badge");
  const actorsLayer = document.getElementById("scene-actors-layer");
  const speakerEl = document.getElementById("dialogue-speaker");
  const dialogueEl = document.getElementById("dialogue-text");

  // Fullscreen Dialogue Overlay Elements
  const npcOverlay = document.getElementById("npc-dialogue-overlay");
  const npcOverlayBg = document.getElementById("npc-overlay-bg");
  const targetImgEl = document.getElementById("closeup-target-img");
  const overlayChoicesBox = document.getElementById("overlay-choices-box");
  const overlaySpeakerName = document.getElementById("overlay-speaker-name");
  const overlayDialogueText = document.getElementById("overlay-dialogue-text");
  const overlayAvatarImg = document.getElementById("overlay-speaker-avatar");

  function init() {
    const backToZoneBtn = document.getElementById("btn-back-to-zone");
    if (backToZoneBtn) {
      backToZoneBtn.addEventListener("click", closeBuildingScene);
    }

    const zoomBackBtn = document.getElementById("btn-zoom-back");
    if (zoomBackBtn) {
      zoomBackBtn.addEventListener("click", closeBuildingScene);
    }

    if (enterBtn) {
      enterBtn.addEventListener("click", () => {
        isIndoor = !isIndoor;
        renderSceneMode();
      });
    }

    const closeDialogueBtn = document.getElementById("btn-close-dialogue");
    if (closeDialogueBtn) {
      closeDialogueBtn.addEventListener("click", closeDialogueOverlay);
    }
  }

  function openBuildingScene(landmark) {
    currentLandmark = landmark;
    isIndoor = false;

    if (zoneMapStage) zoneMapStage.classList.add("hidden");
    if (buildingSceneStage) buildingSceneStage.classList.remove("hidden");

    renderSceneMode();
  }

  function closeBuildingScene() {
    currentLandmark = null;
    isIndoor = false;
    closeDialogueOverlay();
    if (buildingSceneStage) buildingSceneStage.classList.add("hidden");
    if (zoneMapStage) zoneMapStage.classList.remove("hidden");
  }

  function renderSceneMode() {
    if (!currentLandmark) return;
    const data = getSceneData(currentLandmark.name);

    buildingSign.textContent = isIndoor
      ? `${currentLandmark.name} (Interior)`
      : currentLandmark.name;

    enterBtn.textContent = isIndoor ? data.exitLabel : data.doorLabel;
    locationBadge.textContent = isIndoor ? "Indoor Hall" : "Outdoor Plaza";

    sceneCanvas.classList.toggle("indoor-theme", isIndoor);
    sceneCanvas.classList.toggle("outdoor-theme", !isIndoor);

    const customBg = isIndoor ? data.indoorBg : data.outdoorBg;
    sceneCanvas.style.backgroundImage = customBg ? `url('${customBg}')` : "";

    if (customBg) {
      buildingBox.style.background = "transparent";
      buildingBox.style.border = "none";
      buildingBox.style.boxShadow = "none";
      buildingSign.style.display = "none";
      buildingBox.style.top = "52%";
    } else {
      buildingBox.style.background = "";
      buildingBox.style.border = "";
      buildingBox.style.boxShadow = "";
      buildingSign.style.display = "block";
      buildingBox.style.top = "22%";
    }
    // ✅ 大框框：顯示建築物名稱與背景介紹（戶外 / 室內自動切換）
    speakerEl.textContent = isIndoor
      ? currentLandmark.name + " (Interior)"
      : currentLandmark.name;

    dialogueEl.textContent = isIndoor
      ? "Inside the building, classrooms, faculty offices, and student exhibition walls create a quiet academic atmosphere."
      : currentLandmark.description;

    // ✅ 小框框：顯示精簡的 RPG 操作提示
    const hintTextEl = document.getElementById("rpg-hint-text");
    if (hintTextEl) {
      hintTextEl.textContent = isIndoor
        ? "Tap a '!' icon inside to talk, or tap 'Step Outside' to exit."
        : "Tap a bouncing '!' to chat, or tap the door to step inside!";
    }

    actorsLayer.innerHTML = "";
    const actors = isIndoor ? data.indoorActors : data.outdoorActors;

    actors.forEach((actor) => {
      const actorEl = document.createElement("div");
      actorEl.className = "scene-actor";
      actorEl.style.left = actor.x + "%";
      actorEl.style.top = actor.y + "%";

      actorEl.innerHTML =
        '<div class="actor-exclaim">!</div>' +
        '<div class="actor-name-tag">' + actor.name + '</div>';

      actorEl.addEventListener("click", () => {
        actorEl.classList.add("talked");
        openDialogueOverlay(actor);
      });

      actorsLayer.appendChild(actorEl);
    });

  }

  function openDialogueOverlay(actor) {
    if (!npcOverlay) return;

    // 1. 套用統一對話背景圖片
    if (UNIFIED_DIALOGUE_BG) {
      npcOverlayBg.style.backgroundImage = "url('" + UNIFIED_DIALOGUE_BG + "')";
    }

    // 2. 載入右側互動對象的 PNG 圖片
    if (targetImgEl) {
      targetImgEl.src = actor.closeupImg || "images/goose.png";
    }

    // 3. 一開始由 NPC 說話，左下角頭像顯示 NPC
    overlaySpeakerName.textContent = actor.name;
    overlayDialogueText.textContent = actor.dialogue;
    if (overlayAvatarImg) {
      overlayAvatarImg.src = actor.closeupImg || "images/goose.png";
    }

    // 4. 生成右上方的回覆選項按鈕
    overlayChoicesBox.innerHTML = "";
    if (actor.choices && actor.choices.length > 0) {
      actor.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "overlay-choice-btn";
        btn.textContent = choice.text;

        btn.addEventListener("click", () => {
          overlayChoicesBox.innerHTML = "";
          if (choice.playerLine) {
            // 輪到玩家（NCHU Goose）回答：左下角頭像切換成校鵝
            overlaySpeakerName.textContent = "NCHU Goose";
            overlayDialogueText.textContent = choice.playerLine;
            if (overlayAvatarImg) {
              overlayAvatarImg.src = "images/goose.png";
            }

            // 點擊畫面任何一處輪回 NPC 回應：左下角頭像切回 NPC
            const nextStep = () => {
              overlaySpeakerName.textContent = actor.name;
              overlayDialogueText.textContent = choice.reply;
              if (overlayAvatarImg) {
                overlayAvatarImg.src = actor.closeupImg || "images/goose.png";
              }
              npcOverlayBg.removeEventListener("click", nextStep);
            };
            setTimeout(() => npcOverlayBg.addEventListener("click", nextStep), 50);
          } else {
            overlaySpeakerName.textContent = actor.name;
            overlayDialogueText.textContent = choice.reply;
            if (overlayAvatarImg) {
              overlayAvatarImg.src = actor.closeupImg || "images/goose.png";
            }
          }
        });

        overlayChoicesBox.appendChild(btn);
      });
    }

    npcOverlay.classList.remove("hidden");
  }

  function closeDialogueOverlay() {
    if (npcOverlay) npcOverlay.classList.add("hidden");
  }

  document.addEventListener("DOMContentLoaded", init);

  return { openBuildingScene, closeBuildingScene };
})();
