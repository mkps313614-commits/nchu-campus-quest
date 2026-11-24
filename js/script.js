// ================= 1. 遊戲雙層資料結構 =================

const defaultGameData = [

    {
        zoneId: "zone-nw",
        zoneName: "Northwest Region",
        pieceClass: "piece-0",

        image: "images/map.png",

        achievements: [
            {
                id: "ach-1",
                title: "Black Forest",
                desc: "Step into the Black Forest and take a deep breath",
                unlocked: false
            },
            {
                id: "ach-2",
                title: "College of Liberal Arts",
                desc: "Visit the College of Liberal Arts' Landmark.",
                unlocked: false
            }
        ],

        // 西北區的互動地標
        landmarks: [
            {
                name: "College of Liberal Arts",
                description: "This is a key teaching space in the College of Humanities.",

                x: 35,
                y: 35
            },
            {
                name: "Black Forest",
                description: "Step into the “Black Forest” and experience the natural ecosystem and the campus’s lush greenery.",

                x: 80,
                y: 35
            }
        ]
    },

    {
        zoneId: "zone-ne",
        zoneName: "Northeast Region",
        pieceClass: "piece-1",

        image: "images/map.png",

        achievements: [
            {
                id: "ach-3",
                title: "Hui-Sun Auditorium",
                desc: "Walk through the school gate and look to the left.",
                unlocked: false
            }
        ],

        landmarks: [
            {
                name: "Hui-Sun Auditorium",
                description: "Explore Hui-Sun Auditorium and learn about National Chung Hsing University’s key event and gathering spaces.",
                x: 30,
                y: 30
            },
            {
                name: "Academic Buildings",
                description: "All science buildings are located here.",
                x: 55,
                y: 65
            }
        ]
    },

    {
        zoneId: "zone-sw",
        zoneName: "Southwest Region",
        pieceClass: "piece-2",

        image: "images/map.png",

        achievements: [
            {
                id: "ach-4",
                title: "Little Sports Star",
                desc: "A Visit to the Track and Field Stadium.",
                unlocked: false
            },
            {
                id: "ach-5",
                title: "Library",
                desc: "The Taste of Knowledge.",
                unlocked: false
            }
        ],

        landmarks: [
            {
                name: "Library",
                description: "Here, you can buy textbooks, borrow books, or study.",
                x: 75,
                y: 20
            },
            {
                name: "Track and Field Stadium",
                description: "There's a school milk tea shop nearby.",
                x: 60,
                y: 65
            }
        ]
    },

    {
        zoneId: "zone-se",
        zoneName: "Southeast Region",
        pieceClass: "piece-3",

        image: "images/map.png",

        achievements: [
            {
                id: "ach-6",
                title: "Hello, Gymnasium",
                desc: "Remember to bring your student ID.",
                unlocked: false
            }
        ],

        landmarks: [
            {
                name: "Gymnasium",
                description: "There's a beverage vending machine on the right.",
                x: 20,
                y: 60
            },
            {
                name: "College of Veterinary Medicine",
                description: "If you're in the Department of Animal Science, then you'll be very familiar with this place.",
                x: 70,
                y: 70
            }
        ]
    }

];

// 讀取舊存檔
const savedGameData = JSON.parse(
    localStorage.getItem("nchu_game_save") || "null"
);

// 將舊存檔的解鎖狀態合併至新版資料
let gameData = defaultGameData.map(defaultZone => {

    const savedZone = savedGameData?.find(
        zone => zone.zoneId === defaultZone.zoneId
    );

    return {
        ...defaultZone,

        achievements: defaultZone.achievements.map(defaultAch => {

            const savedAch = savedZone?.achievements?.find(
                ach => ach.id === defaultAch.id
            );

            return {
                ...defaultAch,
                unlocked: savedAch?.unlocked ?? defaultAch.unlocked
            };

        })
    };

});

let selectedZoneIndex = 0;


// 儲存遊戲進度
function saveGame() {

    localStorage.setItem(
        "nchu_game_save",
        JSON.stringify(gameData)
    );

}

// ================= 2. 頁面切換控制 =================
function showPage(pageId, gameMode = 'classic') {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');

  if (pageId === 'page-game') {
    const gpsBar = document.getElementById('classic-gps-bar');
    const puzzleBoard = document.getElementById('puzzle-board');
    const zonePanel = document.getElementById('zone-detail-panel');
    const gooseMap = document.getElementById('map-container');

    if (gameMode === 'goose') {
      // 🦢 校鵝散步模式：隱藏經典拼圖與 GPS 面板，顯示完整地圖
      if (gpsBar) gpsBar.classList.add('hidden');
      if (puzzleBoard) puzzleBoard.classList.add('hidden');
      if (zonePanel) zonePanel.classList.add('hidden');
      if (gooseMap) gooseMap.classList.remove('hidden');

      if (typeof GooseAdventure !== 'undefined') {
        GooseAdventure.enterGooseMode();
      }
    } else {
      // 🗺️ 經典地標探索模式：恢復經典拼圖與面板，隱藏完整地圖
      if (gpsBar) gpsBar.classList.remove('hidden');
      if (puzzleBoard) puzzleBoard.classList.remove('hidden');
      if (zonePanel) zonePanel.classList.remove('hidden');
      if (gooseMap) gooseMap.classList.add('hidden');

      if (typeof GooseAdventure !== 'undefined') {
        GooseAdventure.exitGooseMode();
      }
      renderPuzzleBoard();
    }
  }

  if (pageId === 'page-achievement') renderAchievementsPage();
  if (pageId === 'page-profile') updateProfileProgress();
}

// 等整個 HTML 網頁全部載入完成後，再綁定所有按鈕事件
document.addEventListener('DOMContentLoaded', () => {
  const modeSelectModal = document.getElementById('mode-select-modal');
  const btnStart = document.getElementById('btn-start');
  const btnClassic = document.getElementById('btn-classic-mode');
  const btnGoose = document.getElementById('btn-goose-mode');
  const btnCloseMode = document.getElementById('btn-close-mode');

  // 1. 點擊首頁 Start -> 跳出模式選擇彈窗
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (modeSelectModal) {
        modeSelectModal.classList.remove('hidden');
      } else {
        console.error('找不到 #mode-select-modal，請確認 index.html 有貼上模式選擇彈窗！');
      }
    });
  }

  // 2. 選擇「經典地標探索」
  if (btnClassic) {
    btnClassic.addEventListener('click', () => {
      modeSelectModal.classList.add('hidden');
      showPage('page-game', 'classic');
    });
  }

  // 3. 選擇「校鵝散步模擬」
  if (btnGoose) {
    btnGoose.addEventListener('click', () => {
      modeSelectModal.classList.add('hidden');
      showPage('page-game', 'goose');
    });
  }

  // 4. 關閉模式選擇彈窗
  if (btnCloseMode) {
    btnCloseMode.addEventListener('click', () => {
      modeSelectModal.classList.add('hidden');
    });
  }

  // 首頁其他卡片（Achievement 與 Profile）
  const cardAchievement = document.getElementById('card-achievement');
  if (cardAchievement) {
    cardAchievement.addEventListener('click', () => showPage('page-achievement'));
  }

  const cardProfile = document.getElementById('card-profile');
  if (cardProfile) {
    cardProfile.addEventListener('click', () => showPage('page-profile'));
  }

  // 5. 返回按鈕（← BACK）
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof GooseAdventure !== 'undefined') {
        GooseAdventure.exitGooseMode();
      }
      showPage(btn.getAttribute('data-target'));
    });
  });
});


// ================= 2. 渲染四宮格大拼圖 =================

function renderPuzzleBoard() {

    const board = document.getElementById("puzzle-board");

    board.innerHTML = "";

    gameData.forEach((zone, index) => {

        // 只要該區有一個成就解鎖，就點亮該區
        const isZoneExplored = zone.achievements.some(
            ach => ach.unlocked
        );

        const pieceDiv = document.createElement("div");

        pieceDiv.className = `
            puzzle-piece
            ${zone.pieceClass}
            ${isZoneExplored ? "explored" : "unexplored"}
            ${index === selectedZoneIndex ? "selected" : ""}
        `;

        pieceDiv.dataset.index = index;

        // 不再建立 img，因為整張地圖已經是 puzzle-board 的背景
        pieceDiv.innerHTML = `
            <span class="piece-label">
                ${zone.zoneName.split("：")[0]}
                ${isZoneExplored ? "★" : "🔒"}
            </span>
        `;

        // 點擊拼圖區域
        pieceDiv.addEventListener("click", () => {

            selectedZoneIndex = index;

            renderPuzzleBoard();

        });

        board.appendChild(pieceDiv);

    });

    // 更新下方控制面板
    renderZoneDetail(selectedZoneIndex);

}

// ================= 3. 下方區域資訊面板 =================

function renderZoneDetail(index) {

    const zone = gameData[index];

    document.getElementById("panel-zone-name")
        .textContent = zone.zoneName;

    document.getElementById("panel-zone-desc")
        .textContent =
        "Reach this landmark or tap the simulation button below to unlock the achievement and light up this section of the puzzle:";

    // 判斷區域是否已探索
    const isZoneExplored = zone.achievements.some(
        ach => ach.unlocked
    );

    // 顯示或隱藏 Zoom In 按鈕
    const zoomButton = document.getElementById("btn-zoom-zone");

    zoomButton.classList.toggle(
        "hidden",
        !isZoneExplored
    );

    const taskList = document.getElementById("panel-task-list");

    taskList.innerHTML = "";

    zone.achievements.forEach(ach => {

        const row = document.createElement("div");

        row.className = "task-row";

        row.innerHTML = `
            <div>
                <strong>${ach.title}</strong>

                <div style="font-size:11px; color:#777;">
                    ${ach.desc}
                </div>
            </div>

            <button
                class="demo-unlock-btn ${ach.unlocked ? "done" : ""}"
                ${ach.unlocked ? "disabled" : ""}
            >
                ${ach.unlocked ? "Unlocked ✓" : "Unlock by simulating arrival"}
            </button>
        `;

        if (!ach.unlocked) {

            row.querySelector("button").addEventListener("click", () => {

                unlockAchievement(index, ach.id);

            });

        }

        taskList.appendChild(row);

    });

}

// ================= 4. 區域放大探索 =================

document.getElementById("btn-zoom-zone")
    .addEventListener("click", () => {

        const zone = gameData[selectedZoneIndex];

        // 尚未解鎖不能進入
        const isZoneExplored = zone.achievements.some(
            ach => ach.unlocked
        );

        if (!isZoneExplored) return;

        openZoneZoom(selectedZoneIndex);

    });

    function openZoneZoom(index) {

    const zone = gameData[index];

    // 更新區域標題
    document.getElementById("zoom-zone-title")
        .textContent = zone.zoneName;

    const mapBox = document.getElementById("zoomed-map-box");

    const mapImg = document.getElementById("zoomed-map-img");

    // 載入完整校園地圖
    mapImg.src = zone.image;

    // 移除舊有的放大位置
    mapBox.classList.remove(
        "zoom-0",
        "zoom-1",
        "zoom-2",
        "zoom-3"
    );

    // 套用目前區域的裁切位置
    mapBox.classList.add(`zoom-${index}`);

    // 生成目前區域的圖釘
    renderLandmarkPins(zone.landmarks);

    // 重設介紹卡
    document.getElementById("story-title")
        .textContent = "Tap a Pin Above";

    document.getElementById("story-content")
        .textContent =
        "Discover hidden facts and history about NCHU landmarks.";

    // 切換至放大探索頁面
    showPage("page-zone-zoom");

}

// ================= 5. 地圖地標圖釘 =================

function renderLandmarkPins(landmarks) {

    const layer = document.getElementById("zoomed-pins-layer");

    layer.innerHTML = "";

    landmarks.forEach(landmark => {

        const pin = document.createElement("button");

        pin.className = "map-pin";

        pin.textContent = "📍 " + landmark.name;

        // 使用百分比設定位置
        pin.style.left = landmark.x + "%";
        pin.style.top = landmark.y + "%";

        // 點擊圖釘
        pin.addEventListener("click", () => {

            // 清除其他圖釘的選取狀態
            layer.querySelectorAll(".map-pin").forEach(p => {

                p.classList.remove("active");

            });

            pin.classList.add("active");

            // 顯示建築物介紹
            showLandmarkStory(landmark);

            // ✅ 【新增】放大進入該建築物的戶外廣場與室內互動場景
            if (typeof LandmarkScene !== "undefined") {
                LandmarkScene.openBuildingScene(landmark);
            }

        });

        layer.appendChild(pin);

    });

}

// ================= 6. 地標詳細介紹 =================

function showLandmarkStory(landmark) {

    document.getElementById("story-title")
        .textContent = landmark.name;

    document.getElementById("story-content")
        .textContent = landmark.description;

}


// ================= 7. 核心成就解鎖函式 =================

function unlockAchievement(zoneIndex, achId) {

    const zone = gameData[zoneIndex];

    const targetAch = zone.achievements.find(
        a => a.id === achId
    );

    if (targetAch && !targetAch.unlocked) {

        targetAch.unlocked = true;

        saveGame();

        // 更新拼圖顏色與區域資訊
        renderPuzzleBoard();

        // 顯示祝賀彈窗
        document.getElementById("modal-ach-title")
            .textContent = targetAch.title;

        document.getElementById("modal-ach-desc")
            .textContent =
            `【${zone.zoneName}】Area explored!${targetAch.desc}`;

        document.getElementById("unlock-modal")
            .classList.remove("hidden");

    }

}

document.getElementById('btn-close-modal').addEventListener('click', () => {
  document.getElementById('unlock-modal').classList.add('hidden');
});

// ================= 5. 渲染「Achievement 頁面」（依區塊分類） =================
function renderAchievementsPage() {
  const container = document.getElementById('achievement-categories');
  container.innerHTML = "";

  gameData.forEach(zone => {
    const unlockedCount = zone.achievements.filter(a => a.unlocked).length;
    const totalCount = zone.achievements.length;

    const blockDiv = document.createElement('div');
    blockDiv.className = 'category-block';

    let cardsHTML = "";
    zone.achievements.forEach(ach => {
      cardsHTML += `
        <div class="badge-item ${ach.unlocked ? 'unlocked' : 'locked'}">
          <img src="images/badge.png" alt="${ach.title}" />
          <span class="badge-name">${ach.title}</span>
          <span class="badge-desc">${ach.unlocked ? ach.desc : 'Not Yet Unlocked'}</span>
        </div>
      `;
    });

    blockDiv.innerHTML = `
      <div class="category-header">
        <span class="category-title">${zone.zoneName}</span>
        <span class="category-status">${unlockedCount} / ${totalCount}</span>
      </div>
      <div class="category-cards">
        ${cardsHTML}
      </div>
    `;

    container.appendChild(blockDiv);
  });
}

// ================= 6. Profile 頁面進度連動與重置 =================
function updateProfileProgress() {
  let total = 0;
  let unlocked = 0;
  gameData.forEach(zone => {
    zone.achievements.forEach(ach => {
      total++;
      if (ach.unlocked) unlocked++;
    });
  });

  document.getElementById('progress-count').textContent = `${unlocked} / ${total}`;
  const percent = Math.round((unlocked / total) * 100);
  document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}

const savedName = localStorage.getItem('nchu_player_name');
if (savedName) document.getElementById('display-name').textContent = savedName;

document.getElementById('btn-save-name').addEventListener('click', () => {
  const inputVal = document.getElementById('input-name').value.trim();
  if (inputVal !== "") {
    document.getElementById('display-name').textContent = inputVal;
    localStorage.setItem('nchu_player_name', inputVal);
    document.getElementById('input-name').value = "";
    alert("Nickname saved!");
  }
});

// 一鍵重置所有存檔（方便在教室上台 Demo 前把進度歸零重新展示）
document.getElementById('btn-reset-save').addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all exploration puzzles and achievement progress?")) {
    localStorage.removeItem("nchu_game_save");
    gameData = JSON.parse(JSON.stringify(defaultGameData));
    updateProfileProgress();
    alert("All progress has been reset!");
  }
});

