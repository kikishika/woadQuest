/* =============================================
   WordQuest – Main App Logic
   ============================================= */

// ===== STATE =====
const STATE = {
  wordSets: [],          // { name, words: [{en, ko, emoji}] }
  activeWords: [],       // merged active set
  playerData: {
    xp: 0, level: 1, title: '모험가', avatar: '🐣',
    badges: [], learnedSet: new Set(), monsterSet: new Set()
  },
  currentMode: null,
  currentIndex: 0,
  orderMode: 'original', // 'original' or 'random'
};

// ===== LEVEL CONFIG =====
const LEVELS = [
  { level: 1, xp: 0,    title: '모험가',    avatar: '🐣' },
  { level: 2, xp: 100,  title: '단어 새싹',  avatar: '🐥' },
  { level: 3, xp: 250,  title: '알파벳 용사', avatar: '🐦' },
  { level: 4, xp: 450,  title: '발음 마스터', avatar: '🦅' },
  { level: 5, xp: 700,  title: '스펠링 영웅', avatar: '🦁' },
  { level: 6, xp: 1000, title: '단어 전설',   avatar: '🐉' },
  { level: 7, xp: 1400, title: '영어 챔피언',  avatar: '👑' },
];

// ===== BADGES CONFIG =====
const BADGES_DEF = [
  { id: 'first_word',     emoji: '🌱', name: '첫 단어!',      desc: '첫 번째 단어 학습',  cond: p => p.learnedSet.size >= 1 },
  { id: 'learned_10',     emoji: '🔥', name: '10단어 돌파!',  desc: '10개 단어 완료',     cond: p => p.learnedSet.size >= 10 },
  { id: 'learned_30',     emoji: '💎', name: '30단어 마스터', desc: '30개 단어 완료',     cond: p => p.learnedSet.size >= 30 },
  { id: 'scramble_ace',   emoji: '🔤', name: '스크램블 에이스', desc: '스크램블 5회 성공', cond: p => (p.scrambleWins || 0) >= 5 },
  { id: 'hangman_hero',   emoji: '🎯', name: '행맨 영웅',      desc: '행맨 5회 성공',     cond: p => (p.hangmanWins || 0) >= 5 },
  { id: 'voice_star',     emoji: '⭐', name: '발음 스타',      desc: '발음 퀴즈 5회 성공', cond: p => (p.voiceWins || 0) >= 5 },
  { id: 'monster_slayer', emoji: '⚔️', name: '몬스터 사냥꾼', desc: '몬스터 단어 5개 퇴치', cond: p => (p.monsterSlain || 0) >= 5 },
  { id: 'level_5',        emoji: '🏆', name: '레벨 5 달성!',  desc: '레벨 5 도달',        cond: p => p.level >= 5 },
];

// ===== EMOJI MAP (demo) =====
const EMOJI_MAP = {
  apple:'🍎', banana:'🍌', cat:'🐱', dog:'🐶', fish:'🐟', bird:'🐦',
  sun:'☀️', moon:'🌙', star:'⭐', tree:'🌳', flower:'🌸', book:'📚',
  house:'🏠', car:'🚗', bus:'🚌', train:'🚂', plane:'✈️', ship:'🚢',
  ball:'⚽', pen:'✏️', hat:'🎩', bag:'👜', shoe:'👟', cup:'☕',
  milk:'🥛', water:'💧', fire:'🔥', ice:'🧊', rain:'🌧️', snow:'❄️',
  tiger:'🐯', rabbit:'🐰', horse:'🐴', cow:'🐮', pig:'🐷', frog:'🐸',
  dragon:'🐲', king:'👑', queen:'👸', boy:'👦', girl:'👧', baby:'👶',
  happy:'😊', sad:'😢', angry:'😠', scared:'😨', love:'❤️', friend:'🤝',
  jump:'🦘', run:'🏃', swim:'🏊', fly:'🦅', eat:'🍽️', sleep:'😴',
  big:'🐘', small:'🐭', fast:'⚡', slow:'🐢', hot:'🌡️', cold:'🥶',
  red:'🔴', blue:'🔵', green:'🟢', yellow:'🟡', black:'⬛', white:'⬜',
  one:'1️⃣', two:'2️⃣', three:'3️⃣', four:'4️⃣', five:'5️⃣',
  door:'🚪', window:'🪟', table:'🪑', chair:'🪑', bed:'🛏️', clock:'🕐',
  phone:'📱', music:'🎵', dance:'💃', game:'🎮', school:'🏫', teacher:'👩‍🏫',
};

// ===== DEMO WORD SET =====
const DEMO_WORDS = [
  { en: 'apple',   ko: '사과',    emoji: '🍎' },
  { en: 'banana',  ko: '바나나',  emoji: '🍌' },
  { en: 'cat',     ko: '고양이',  emoji: '🐱' },
  { en: 'dog',     ko: '강아지',  emoji: '🐶' },
  { en: 'fish',    ko: '물고기',  emoji: '🐟' },
  { en: 'bird',    ko: '새',      emoji: '🐦' },
  { en: 'sun',     ko: '태양',    emoji: '☀️' },
  { en: 'moon',    ko: '달',      emoji: '🌙' },
  { en: 'star',    ko: '별',      emoji: '⭐' },
  { en: 'tree',    ko: '나무',    emoji: '🌳' },
  { en: 'flower',  ko: '꽃',      emoji: '🌸' },
  { en: 'book',    ko: '책',      emoji: '📚' },
  { en: 'house',   ko: '집',      emoji: '🏠' },
  { en: 'car',     ko: '자동차',  emoji: '🚗' },
  { en: 'happy',   ko: '행복한',  emoji: '😊' },
  { en: 'big',     ko: '큰',      emoji: '🐘' },
  { en: 'small',   ko: '작은',    emoji: '🐭' },
  { en: 'red',     ko: '빨간색',  emoji: '🔴' },
  { en: 'blue',    ko: '파란색',  emoji: '🔵' },
  { en: 'school',  ko: '학교',    emoji: '🏫' },
];

// ===== UTILITY FUNCTIONS =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getEmoji(word) {
  return EMOJI_MAP[word.en?.toLowerCase()] || word.emoji || '📝';
}

function speak(text, lang = 'en-US') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang; 
  utt.rate = 0.95; 
  utt.pitch = 1.05; // Slightly higher pitch for female feel
  
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  
  const findVoice = () => {
    const preferred = ['Samantha', 'Google US English', 'Zira', 'Victoria', 'Ava', 'Mei-Jia'];
    let v = null;
    for (const p of preferred) {
      v = voices.find(v => v.name.includes(p) && v.lang.startsWith('en'));
      if (v) break;
    }
    if (!v) v = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Female'.toLowerCase())));
    if (!v) v = voices.find(v => v.lang.startsWith('en'));
    return v;
  };

  const v = findVoice();
  if (v) utt.voice = v;
  synth.speak(utt);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.scrollTop = 0; }
}

// ===== LOCAL STORAGE =====
function savePlayer() {
  const data = {
    ...STATE.playerData,
    learnedSet: [...STATE.playerData.learnedSet],
    monsterSet: [...STATE.playerData.monsterSet],
  };
  localStorage.setItem('wq_player', JSON.stringify(data));
}

function loadPlayer() {
  const raw = localStorage.getItem('wq_player');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    data.learnedSet = new Set(data.learnedSet || []);
    data.monsterSet = new Set(data.monsterSet || []);
    STATE.playerData = data;
  } catch(e) { console.warn('Player load failed', e); }
}

function saveSets() {
  localStorage.setItem('wq_sets', JSON.stringify(STATE.wordSets));
}

function loadSets() {
  const raw = localStorage.getItem('wq_sets');
  if (!raw) return;
  try { STATE.wordSets = JSON.parse(raw); } catch(e) {}
}

// ===== XP & LEVELING =====
function addXP(amount) {
  STATE.playerData.xp += amount;
  const prevLevel = STATE.playerData.level;
  // Find new level
  let newLevelData = LEVELS[0];
  for (const ld of LEVELS) {
    if (STATE.playerData.xp >= ld.xp) newLevelData = ld;
  }
  STATE.playerData.level = newLevelData.level;
  STATE.playerData.title = newLevelData.title;
  STATE.playerData.avatar = newLevelData.avatar;
  savePlayer();
  updatePlayerUI();
  checkBadges();
  if (STATE.playerData.level > prevLevel) showLevelUp(newLevelData);
}

function checkBadges() {
  BADGES_DEF.forEach(b => {
    if (!STATE.playerData.badges.includes(b.id) && b.cond(STATE.playerData)) {
      STATE.playerData.badges.push(b.id);
      savePlayer();
      showBadgeToast(b);
    }
  });
}

function showBadgeToast(badge) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #f7971e, #ffd200);
    color: #1a1a2e; padding: 12px 24px; border-radius: 16px;
    font-weight: 800; font-size: 0.9rem; z-index: 9999;
    box-shadow: 0 8px 32px rgba(255,210,0,0.5);
    animation: slideIn 0.4s ease;
  `;
  toast.textContent = `🏅 새 배지 획득! ${badge.emoji} ${badge.name}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showLevelUp(levelData) {
  document.getElementById('levelup-emoji').textContent = levelData.avatar;
  document.getElementById('levelup-title').textContent = `레벨 ${levelData.level} 달성! 🎉`;
  document.getElementById('levelup-msg').textContent = `이제 "${levelData.title}" 칭호를 얻었어요!`;
  document.getElementById('modal-levelup').style.display = 'flex';
  fireConfetti();
}

// ===== UPDATE UI =====
function updatePlayerUI() {
  const p = STATE.playerData;
  // Upload screen
  document.getElementById('avatar-display').textContent = p.avatar;
  document.getElementById('level-badge').textContent = `Lv.${p.level}`;
  document.getElementById('xp-name').textContent = p.title;
  const nextLevel = LEVELS.find(l => l.level === p.level + 1);
  const prevXP = LEVELS.find(l => l.level === p.level)?.xp || 0;
  const nextXP = nextLevel ? nextLevel.xp : prevXP + 500;
  const pct = Math.min(100, ((p.xp - prevXP) / (nextXP - prevXP)) * 100);
  document.getElementById('xp-bar').style.width = pct + '%';
  document.getElementById('xp-text').textContent = `${p.xp} / ${nextXP} XP`;
  // Top bar
  document.getElementById('top-xp').textContent = `⭐ ${p.xp} XP`;
  document.getElementById('avatar-sm').textContent = p.avatar;
  // Stats
  document.getElementById('stat-learned').textContent = p.learnedSet.size;
  document.getElementById('stat-monsters').textContent = p.monsterSet.size;
}

function updateWordStats() {
  const total    = STATE.activeWords.length;
  const learned  = STATE.playerData.learnedSet.size;
  const monsters = STATE.playerData.monsterSet.size;
  // Main screen stats
  const se = id => document.getElementById(id);
  if (se('stat-total'))    se('stat-total').textContent    = total;
  if (se('stat-learned'))  se('stat-learned').textContent  = learned;
  if (se('stat-monsters')) se('stat-monsters').textContent = monsters;
  // Upload screen sidebar stats (PC)
  if (se('ustat-total'))    se('ustat-total').textContent    = total;
  if (se('ustat-learned'))  se('ustat-learned').textContent  = learned;
  if (se('ustat-monsters')) se('ustat-monsters').textContent = monsters;
}


// ===== CONFETTI =====
function fireConfetti() {
  const wrap = document.getElementById('confetti-wrap');
  wrap.style.display = 'block';
  wrap.innerHTML = '';
  const colors = ['#f093fb','#f5576c','#43e97b','#38f9d7','#ffd200','#f7971e','#667eea'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random()*100}%;
      top: -10px;
      width: ${6 + Math.random()*8}px;
      height: ${6 + Math.random()*8}px;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay: ${Math.random()*0.8}s;
      animation-duration: ${1.2 + Math.random()*0.8}s;
    `;
    wrap.appendChild(el);
  }
  setTimeout(() => { wrap.style.display = 'none'; wrap.innerHTML = ''; }, 2500);
}

// ===== SMART TEXT PARSER (handles OCR / PDF / plain text) =====
// Recognises many formats:
//   apple,사과  |  apple - 사과  |  apple : 사과  |  apple = 사과
//   apple (사과)  |  1. apple 사과  |  apple\t사과
//   Two-column: English line then Korean line (or vice-versa)
function smartParse(rawText) {
  const words = [];
  const KOREAN = /[\uAC00-\uD7A3]/;
  // Bug fix: Allow parentheses and quotes in English word detection
  const ENGLISH_WORD = /^[a-zA-Z"(\[][a-zA-Z\s'().,"[\]]{0,60}$/;

  // Remove garbage OCR characters
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim()
      .replace(/^[\d]+[.)\-\s]+/, '')  // strip leading numbers / bullets
      .replace(/[^a-zA-Z\uAC00-\uD7A3,|:\-=()\s'.']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    )
    .filter(Boolean);

  const SEPS = [',', '|', '\t', ' - ', ' – ', ' : ', ' : ', ' = ', ' — '];

  // Pass 1: Inline pairs (separator-based)
  const remaining = [];
  for (const line of lines) {
    if (!line) continue;
    let found = false;
    for (const sep of SEPS) {
      if (line.includes(sep)) {
        const parts = line.split(sep);
        if (parts.length >= 2) {
          const left  = parts[0].trim();
          const right = parts.slice(1).join(sep).trim();
          // Determine which side is English and which is Korean
          const leftKO  = KOREAN.test(left);
          const rightKO = KOREAN.test(right);
          if (!leftKO && rightKO && ENGLISH_WORD.test(left)) {
            words.push({ en: left, ko: right, emoji: getEmoji({en: left}) || '📝' });
            found = true; break;
          } else if (leftKO && !rightKO && ENGLISH_WORD.test(right)) {
            words.push({ en: right, ko: left, emoji: getEmoji({en: right}) || '📝' });
            found = true; break;
          }
        }
      }
    }
    // Inline: parentheses  apple (사과) or 사과 (apple)
    if (!found) {
      const parens = line.match(/^(.+?)\s*\((.+?)\)/);
      if (parens) {
        const a = parens[1].trim(), b = parens[2].trim();
        if (!KOREAN.test(a) && KOREAN.test(b) && ENGLISH_WORD.test(a)) {
          words.push({ en: a, ko: b, emoji: getEmoji({en:a})||'📝' }); found = true;
        } else if (KOREAN.test(a) && !KOREAN.test(b) && ENGLISH_WORD.test(b)) {
          words.push({ en: b, ko: a, emoji: getEmoji({en:b})||'📝' }); found = true;
        }
      }
    }
    if (!found) remaining.push(line);
  }

  // Pass 2: Alternating lines (EN then KO or KO then EN)
  for (let i = 0; i < remaining.length - 1; i++) {
    const a = remaining[i], b = remaining[i + 1];
    const aKO = KOREAN.test(a), bKO = KOREAN.test(b);
    if (!aKO && bKO && ENGLISH_WORD.test(a)) {
      words.push({ en: a, ko: b, emoji: getEmoji({en:a})||'📝' }); i++;
    } else if (aKO && !bKO && ENGLISH_WORD.test(b)) {
      words.push({ en: b, ko: a, emoji: getEmoji({en:b})||'📝' }); i++;
    }
  }

  // Deduplicate
  const seen = new Set();
  return words.filter(w => {
    const key = w.en.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

// Legacy structured parser (JSON / CSV / TXT with clear separators)
function parseFile(name, content) {
  const words = [];
  if (name.toLowerCase().endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      const arr = Array.isArray(data) ? data : data.words || [];
      arr.forEach(item => {
        if (item.en && item.ko) words.push({ en: item.en.trim(), ko: item.ko.trim(), emoji: item.emoji || getEmoji({en: item.en}) || '📝' });
      });
    } catch(e) { alert('JSON 파싱 오류: ' + e.message); }
    return words;
  }
  // TXT / CSV: try smart parser first
  return smartParse(content);
}

// ===== RENDER SETS LIST =====
function renderSetsList() {
  const list = document.getElementById('sets-list');
  list.innerHTML = '';
  STATE.wordSets.forEach((set, i) => {
    const typeIcon  = set.sourceType === 'image' ? '📸' : set.sourceType === 'pdf' ? '📄' : '📚';
    const typeLbl   = set.sourceType === 'image' ? '사진 OCR' : set.sourceType === 'pdf' ? 'PDF' : '텍스트';
    const item = document.createElement('div');
    item.className = 'set-item';
    item.innerHTML = `
      <div class="set-icon">${typeIcon}</div>
      <div class="set-info">
        <div class="set-name">${escHTML(set.name)}</div>
        <div class="set-count">${set.words.length}개 단어 &nbsp;<span class="set-type-badge">${typeLbl}</span></div>
      </div>
      <button class="set-remove" data-i="${i}" title="삭제">🗑️</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.set-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = parseInt(e.currentTarget.dataset.i);
      STATE.wordSets.splice(i, 1);
      saveSets(); renderSetsList(); renderSetCheckboxes();
    });
  });

  const selector = document.getElementById('set-selector');
  selector.style.display = STATE.wordSets.length > 0 ? 'block' : 'none';
  renderSetCheckboxes();
}

function renderSetCheckboxes() {
  const wrap = document.getElementById('set-checkboxes');
  wrap.innerHTML = '';
  STATE.wordSets.forEach((set, i) => {
    const item = document.createElement('label');
    item.className = 'set-check-item';
    item.dataset.i = i;
    item.innerHTML = `
      <input type="checkbox" checked data-i="${i}" />
      <div class="set-check-tick">✓</div>
      <div class="set-info">
        <div class="set-name">📚 ${escHTML(set.name)}</div>
        <div class="set-count">${set.words.length}개 단어</div>
      </div>
    `;
    item.classList.add('selected');
    item.querySelector('input').addEventListener('change', e => {
      item.classList.toggle('selected', e.target.checked);
    });
    wrap.appendChild(item);
  });
}

function escHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== COLLECT ACTIVE WORDS =====
function collectActiveWords() {
  const checked = [...document.querySelectorAll('#set-checkboxes input[type=checkbox]:checked')];
  const indices = checked.map(c => parseInt(c.dataset.i));
  let all = [];
  indices.forEach(i => { if (STATE.wordSets[i]) all.push(...STATE.wordSets[i].words); });
  
  // Deduplicate by en
  const seen = new Set();
  const unique = all.filter(w => { if (seen.has(w.en)) return false; seen.add(w.en); return true; });
  
  // Apply Ordering
  if (STATE.orderMode === 'random') {
    STATE.activeWords = shuffle(unique);
  } else {
    STATE.activeWords = unique; // Upload order
  }
  
  updateWordStats();
}

// ===== UPLOAD SCREEN INIT =====
function initUploadScreen() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('drag-over');
    handleFiles([...e.dataTransfer.files]);
  });

  fileInput.addEventListener('change', () => { handleFiles([...fileInput.files]); fileInput.value = ''; });

  document.getElementById('btn-demo').addEventListener('click', () => {
    if (!STATE.wordSets.find(s => s.name === '데모 단어장')) {
      STATE.wordSets.push({ name: '데모 단어장', words: DEMO_WORDS });
      saveSets(); renderSetsList();
    }
  });

  document.getElementById('btn-start-study').addEventListener('click', startStudy);

  // Order Toggle Buttons
  const btnOrder = document.getElementById('btn-order-original');
  const btnRandom = document.getElementById('btn-order-random');

  if (btnOrder) {
    btnOrder.addEventListener('click', () => {
      STATE.orderMode = 'original';
      btnOrder.classList.add('active');
      btnRandom.classList.remove('active');
    });
  }
  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      STATE.orderMode = 'random';
      btnRandom.classList.add('active');
      btnOrder.classList.remove('active');
    });
  }

  document.getElementById('btn-badges').addEventListener('click', () => {
    renderBadgeGrid();
    document.getElementById('modal-badges').style.display = 'flex';
  });
  document.getElementById('close-badges').addEventListener('click', () => {
    document.getElementById('modal-badges').style.display = 'none';
  });
  document.getElementById('close-levelup').addEventListener('click', () => {
    document.getElementById('modal-levelup').style.display = 'none';
  });
  initPreviewModal();
}

// ===== FILE HANDLING ROUTER =====
async function handleFiles(files) {
  for (const file of files) {
    const name = file.name;
    const ext  = name.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','bmp','webp'].includes(ext)) {
      await handleImageFile(file);
    } else if (ext === 'pdf') {
      await handlePdfFile(file);
    } else {
      await handleTextFile(file);
    }
  }
}

// ----- PROCESSING MODAL HELPERS -----
function showProcessing(title, desc) {
  document.getElementById('proc-title').textContent = title;
  document.getElementById('proc-desc').textContent  = desc;
  setProgress(0);
  document.getElementById('modal-processing').style.display = 'flex';
}
function hideProcessing() {
  document.getElementById('modal-processing').style.display = 'none';
}
function setProgress(pct, desc) {
  document.getElementById('proc-bar').style.width = pct + '%';
  document.getElementById('proc-pct').textContent  = Math.round(pct) + '%';
  if (desc) document.getElementById('proc-desc').textContent = desc;
}

// ----- TEXT / CSV / JSON -----
function handleTextFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const words = parseFile(file.name, e.target.result);
      if (!words.length) {
        alert(`"${file.name}"에서 단어를 찾지 못했어요.\n형식: 영어,한국어 (한 줄에 하나)`);
      } else {
        showPreview(file.name.replace(/\.[^.]+$/,''), words, 'text');
      }
      resolve();
    };
    reader.readAsText(file, 'UTF-8');
  });
}

// ----- IMAGE → TESSERACT OCR -----
async function handleImageFile(file) {
  const setName = file.name.replace(/\.[^.]+$/,'');
  showProcessing('📸 사진 인식 중...', '이미지에서 글자를 읽고 있어요');

  try {
    const worker = await Tesseract.createWorker(['kor', 'eng'], 1, {
      logger: m => {
        if (m.status === 'recognizing text') setProgress(m.progress * 100, '글자 인식 중...');
        else if (m.status === 'loading language traineddata') setProgress(10, '언어 데이터 로딩...');
        else if (m.status === 'initializing api') setProgress(20, '준비 중...');
      }
    });

    setProgress(30, '이미지 분석 중...');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    setProgress(100, '완료!');
    hideProcessing();

    const words = smartParse(text);
    if (!words.length) {
      alert(`사진에서 단어-뜻 쌍을 찾지 못했어요.\n사진이 선명한지 확인하거나 TXT 파일을 사용해보세요.`);
    } else {
      showPreview(setName, words, 'image');
    }
  } catch(err) {
    hideProcessing();
    console.error(err);
    alert('이미지 인식 중 오류가 발생했어요: ' + err.message);
  }
}

// ----- PDF → PDF.js TEXT EXTRACTION -----
async function handlePdfFile(file) {
  const setName = file.name.replace(/\.[^.]+$/,'');
  showProcessing('📄 PDF 분석 중...', 'PDF에서 텍스트를 추출하고 있어요');

  try {
    // Set up PDF.js worker
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let p = 1; p <= numPages; p++) {
      setProgress((p / numPages) * 90, `페이지 ${p}/${numPages} 읽는 중...`);
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      fullText += content.items.map(i => i.str).join(' ') + '\n';
    }

    setProgress(100, '완료!');
    hideProcessing();

    const words = smartParse(fullText);
    if (!words.length) {
      alert(`PDF에서 단어-뜻 쌍을 찾지 못했어요.\nPDF가 스캔 이미지 형식이면 사진으로 업로드해보세요.`);
    } else {
      showPreview(setName, words, 'pdf');
    }
  } catch(err) {
    hideProcessing();
    console.error(err);
    alert('PDF 처리 중 오류가 발생했어요: ' + err.message);
  }
}

// ----- WORD PREVIEW MODAL -----
let _previewWords = [], _previewType = 'text', _previewSetName = '';

function showPreview(setName, words, type) {
  _previewWords   = words;
  _previewType    = type;
  _previewSetName = setName;

  document.getElementById('preview-title').textContent  = `🔍 인식된 단어 확인 (${words.length}개)`;
  document.getElementById('preview-source').textContent = `파일: ${setName}`;

  const list = document.getElementById('preview-list');
  list.innerHTML = '';

  words.forEach((w, i) => {
    const item = document.createElement('div');
    item.className = 'preview-item selected';
    item.dataset.i  = i;
    item.innerHTML = `
      <div class="preview-tick">✓</div>
      <div class="preview-emoji">${getEmoji(w)}</div>
      <div style="flex:1">
        <div class="preview-word-en">${escHTML(w.en)}</div>
        <div class="preview-word-ko">${escHTML(w.ko)}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      updatePreviewCount();
    });
    list.appendChild(item);
  });

  updatePreviewCount();
  document.getElementById('modal-preview').style.display = 'flex';
}

function updatePreviewCount() {
  const sel = document.querySelectorAll('.preview-item.selected').length;
  document.getElementById('preview-count').textContent = `${sel}개 선택`;
}

function confirmPreview() {
  const selected = [...document.querySelectorAll('.preview-item.selected')]
    .map(el => _previewWords[parseInt(el.dataset.i)]);

  if (!selected.length) { alert('단어를 하나 이상 선택해주세요!'); return; }

  let setName = _previewSetName, n = 1;
  while (STATE.wordSets.find(s => s.name === setName)) setName = `${_previewSetName} (${++n})`;

  STATE.wordSets.push({ name: setName, words: selected, sourceType: _previewType });
  saveSets(); renderSetsList();
  document.getElementById('modal-preview').style.display = 'none';
}

function initPreviewModal() {
  document.getElementById('close-preview').addEventListener('click', () => {
    document.getElementById('modal-preview').style.display = 'none';
  });
  document.getElementById('preview-cancel').addEventListener('click', () => {
    document.getElementById('modal-preview').style.display = 'none';
  });
  document.getElementById('preview-confirm').addEventListener('click', confirmPreview);
  document.getElementById('preview-check-all').addEventListener('click', () => {
    document.querySelectorAll('.preview-item').forEach(el => el.classList.add('selected'));
    updatePreviewCount();
  });
  document.getElementById('preview-uncheck-all').addEventListener('click', () => {
    document.querySelectorAll('.preview-item').forEach(el => el.classList.remove('selected'));
    updatePreviewCount();
  });
}

function startStudy() {
  collectActiveWords();
  if (STATE.activeWords.length === 0) { alert('단어를 선택해주세요!'); return; }
  updateWordStats();
  showScreen('screen-main');
}

// ===== MAIN SCREEN =====
function initMainScreen() {
  document.getElementById('btn-home').addEventListener('click', () => showScreen('screen-upload'));

  document.querySelectorAll('.mode-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      launchMode(mode);
    });
  });
}

function launchMode(mode) {
  STATE.currentMode = mode;
  STATE.currentIndex = 0;

  let words = STATE.activeWords;
  if (mode === 'monsters') {
    words = STATE.activeWords.filter(w => STATE.playerData.monsterSet.has(w.en));
    if (words.length === 0) { alert('몬스터 단어가 없어요! 😊\n틀린 단어가 생기면 여기에 나타납니다.'); return; }
    STATE.activeWords = words; // use monster words
  }

  if (mode === 'flash' || mode === 'monsters') initFlashCard();
  else if (mode === 'scramble') initScramble();
  else if (mode === 'hangman') initHangman();
  else if (mode === 'voice') initVoice();
  else if (mode === 'list') initWordList();
}

// ===== BACK BUTTONS =====
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.back;
    if (target === 'screen-main') {
      collectActiveWords();
      updateWordStats();
    }
    showScreen(target);
  });
});

// ===== FLASH CARD MODE =====
let flashWords = [];

function initFlashCard() {
  if (!STATE.activeWords || STATE.activeWords.length === 0) {
    alert('학습할 단어가 없어요! 단어장을 업로드하거나 선택해주세요.');
    showScreen('screen-main');
    return;
  }

  if (STATE.orderMode === 'random') {
    flashWords = shuffle([...STATE.activeWords]);
  } else {
    flashWords = [...STATE.activeWords];
  }
  
  STATE.currentIndex = 0;
  showScreen('screen-flash');
  renderFlashCard();

  // Navigation
  document.getElementById('flash-prev').onclick = () => {
    if (STATE.currentIndex > 0) {
      STATE.currentIndex--;
      renderFlashCard();
    }
  };
  
  document.getElementById('flash-next').onclick = () => {
    if (STATE.currentIndex < flashWords.length - 1) {
      STATE.currentIndex++;
      renderFlashCard();
    } else {
      fireConfetti();
      alert('🎉 마지막 단어입니다!');
    }
  };

  document.getElementById('flash-tts').onclick = () => {
    if (flashWords[STATE.currentIndex]) {
      speak(flashWords[STATE.currentIndex].en);
    }
  };

  document.getElementById('flash-good').onclick = () => {
    const w = flashWords[STATE.currentIndex];
    if (w) {
      STATE.playerData.learnedSet.add(w.en);
      STATE.playerData.monsterSet.delete(w.en);
      addXP(10);
    }
    if (STATE.currentIndex < flashWords.length - 1) {
      STATE.currentIndex++;
      renderFlashCard();
    } else {
      fireConfetti();
      alert('🎉 모든 학습을 마쳤습니다!');
      showScreen('screen-main');
    }
  };

  document.getElementById('flash-bad').onclick = () => {
    const w = flashWords[STATE.currentIndex];
    if (w) {
      STATE.playerData.monsterSet.add(w.en);
      savePlayer();
      updateWordStats();
    }
    if (STATE.currentIndex < flashWords.length - 1) {
      STATE.currentIndex++;
      renderFlashCard();
    }
  };
}

function renderFlashCard() {
  if (!flashWords || !flashWords[STATE.currentIndex]) return;
  const w = flashWords[STATE.currentIndex];
  
  const wrd = document.getElementById('card-word');
  const mng = document.getElementById('card-meaning');
  
  if (wrd) wrd.textContent = w.en || '';
  if (mng) mng.textContent = w.ko || '';
  
  document.getElementById('flash-progress').textContent = `${STATE.currentIndex + 1} / ${flashWords.length}`;
  renderFlashDots();
}

function renderFlashDots() {
  const wrap = document.getElementById('flash-dots');
  wrap.innerHTML = '';
  const max = Math.min(flashWords.length, 12);
  const step = flashWords.length <= 12 ? 1 : Math.floor(flashWords.length / 12);
  for (let i = 0; i < max; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    const mappedIdx = i * step;
    if (mappedIdx === STATE.currentIndex) dot.classList.add('active');
    else if (mappedIdx < STATE.currentIndex) dot.classList.add('done');
    wrap.appendChild(dot);
  }
}

// ===== SCRAMBLE GAME =====
let scrambleWords = [], scrambleWord = null, scrambleAnswer = [], scramblePool = [];

function initScramble() {
  if (STATE.orderMode === 'random') {
    scrambleWords = shuffle([...STATE.activeWords]);
  } else {
    scrambleWords = [...STATE.activeWords];
  }
  STATE.currentIndex = 0;
  showScreen('screen-scramble');
  nextScramble();

  document.getElementById('scramble-hint').onclick = () => {
    if (!scrambleWord) return;
    // Fill first unfilled slot
    const firstEmpty = scrambleAnswer.findIndex(c => c === null);
    if (firstEmpty === -1) return;
    scrambleAnswer[firstEmpty] = scrambleWord.en[firstEmpty];
    // Remove from pool
    const idx = scramblePool.indexOf(scrambleWord.en[firstEmpty]);
    if (idx !== -1) scramblePool.splice(idx, 1);
    renderScramble();
    addXP(-2);
  };

  document.getElementById('scramble-skip').onclick = () => {
    STATE.playerData.monsterSet.add(scrambleWords[STATE.currentIndex]?.en);
    savePlayer();
    nextScramble();
  };

  document.getElementById('scramble-tts').onclick = () => {
    if (scrambleWord) speak(scrambleWord.en);
  };
}

function nextScramble() {
  if (STATE.currentIndex >= scrambleWords.length) {
    fireConfetti();
    alert('🎉 모든 스크램블 완료!');
    showScreen('screen-main');
    return;
  }
  scrambleWord = scrambleWords[STATE.currentIndex];
  scrambleAnswer = new Array(scrambleWord.en.length).fill(null);
  scramblePool = shuffle([...scrambleWord.en]);
  document.getElementById('scramble-progress').textContent = `${STATE.currentIndex + 1} / ${scrambleWords.length}`;
  document.getElementById('scramble-clue').textContent = `뜻: ${scrambleWord.ko}`;
  document.getElementById('scramble-image').textContent = getEmoji(scrambleWord);
  document.getElementById('scramble-result').textContent = '';
  renderScramble();
}

function renderScramble() {
  renderAnswerSlots();
  renderLetterPool();
}

function renderAnswerSlots() {
  const container = document.getElementById('answer-slots');
  container.innerHTML = '';
  scrambleAnswer.forEach((ch, i) => {
    const tile = document.createElement('div');
    tile.className = 'letter-tile' + (ch ? ' answer-tile' : ' empty-tile');
    tile.textContent = ch ? ch.toUpperCase() : '';
    if (ch) {
      tile.addEventListener('click', () => {
        scramblePool.push(ch);
        scrambleAnswer[i] = null;
        renderScramble();
      });
    }
    container.appendChild(tile);
  });
}

function renderLetterPool() {
  const container = document.getElementById('letter-pool');
  container.innerHTML = '';
  scramblePool.forEach((ch, i) => {
    const tile = document.createElement('div');
    tile.className = 'letter-tile pool-tile';
    tile.textContent = ch.toUpperCase();
    tile.addEventListener('click', () => {
      const firstEmpty = scrambleAnswer.findIndex(c => c === null);
      if (firstEmpty === -1) return;
      scrambleAnswer[firstEmpty] = ch;
      scramblePool.splice(i, 1);
      renderScramble();
      checkScrambleAnswer();
    });
    container.appendChild(tile);
  });
}

function checkScrambleAnswer() {
  if (scrambleAnswer.includes(null)) return;
  const ans = scrambleAnswer.join('').toLowerCase();
  const correct = scrambleWord.en.toLowerCase();
  const resultEl = document.getElementById('scramble-result');
  if (ans === correct) {
    resultEl.textContent = '✅ 정답!';
    resultEl.style.color = '#43e97b';
    STATE.playerData.learnedSet.add(scrambleWord.en);
    STATE.playerData.monsterSet.delete(scrambleWord.en);
    STATE.playerData.scrambleWins = (STATE.playerData.scrambleWins || 0) + 1;
    addXP(20);
    speak(scrambleWord.en);
    setTimeout(() => { STATE.currentIndex++; nextScramble(); }, 1200);
  } else {
    resultEl.textContent = '❌ 다시 해봐요!';
    resultEl.style.color = '#f857a6';
    setTimeout(() => {
      scrambleAnswer = new Array(scrambleWord.en.length).fill(null);
      scramblePool = shuffle([...scrambleWord.en]);
      renderScramble();
      resultEl.textContent = '';
    }, 900);
  }
}

// ===== HANGMAN GAME =====
let hangmanWords = [], hangmanWord = null, hangmanGuessed = [], hangmanWrong = [];
const MAX_WRONG = 6;

function initHangman() {
  if (STATE.orderMode === 'random') {
    hangmanWords = shuffle([...STATE.activeWords]);
  } else {
    hangmanWords = [...STATE.activeWords];
  }
  STATE.currentIndex = 0;
  showScreen('screen-hangman');
  nextHangman();
  document.getElementById('hangman-tts').onclick = () => {
    if (hangmanWord) speak(hangmanWord.en);
  };
}

function nextHangman() {
  if (STATE.currentIndex >= hangmanWords.length) {
    fireConfetti(); alert('🎉 모든 행맨 완료!'); showScreen('screen-main'); return;
  }
  hangmanWord = hangmanWords[STATE.currentIndex];
  hangmanGuessed = [];
  hangmanWrong = [];
  document.getElementById('hangman-progress').textContent = `${STATE.currentIndex + 1} / ${hangmanWords.length}`;
  document.getElementById('hangman-clue').textContent = `뜻: ${hangmanWord.ko}`;
  document.getElementById('hangman-result').textContent = '';
  buildAlphaKeyboard();
  drawHangman(0);
  renderHangmanBlanks();
  renderHangmanWrong();
}

function buildAlphaKeyboard() {
  const keyboard = document.getElementById('alpha-keyboard');
  keyboard.innerHTML = '';
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => {
    const key = document.createElement('button');
    key.className = 'alpha-key';
    key.textContent = ch.toUpperCase();
    key.id = `key-${ch}`;
    key.addEventListener('click', () => guessLetter(ch, key));
    keyboard.appendChild(key);
  });
}

function guessLetter(ch, keyEl) {
  if (hangmanGuessed.includes(ch)) return;
  hangmanGuessed.push(ch);
  keyEl.disabled = true;

  if (hangmanWord.en.toLowerCase().includes(ch)) {
    keyEl.classList.add('correct');
  } else {
    hangmanWrong.push(ch);
    keyEl.classList.add('wrong');
    drawHangman(hangmanWrong.length);
  }

  renderHangmanBlanks();
  renderHangmanWrong();
  checkHangmanEnd();
}

function renderHangmanBlanks() {
  const container = document.getElementById('hangman-blanks');
  container.innerHTML = '';
  [...hangmanWord.en].forEach(ch => {
    const div = document.createElement('div');
    div.className = 'hangman-blank';
    if (ch === ' ') div.style.borderBottom = 'none';
    div.textContent = hangmanGuessed.includes(ch.toLowerCase()) || ch === ' ' ? ch.toUpperCase() : '';
    container.appendChild(div);
  });
}

function renderHangmanWrong() {
  document.getElementById('hangman-wrong-letters').textContent = hangmanWrong.join(' ').toUpperCase();
}

function checkHangmanEnd() {
  const word = hangmanWord.en.toLowerCase().replace(/ /g, '');
  const allGuessed = [...word].every(ch => hangmanGuessed.includes(ch));
  const result = document.getElementById('hangman-result');

  if (allGuessed) {
    result.textContent = '🎉 정답! 훌륭해요!';
    result.style.color = '#43e97b';
    STATE.playerData.learnedSet.add(hangmanWord.en);
    STATE.playerData.monsterSet.delete(hangmanWord.en);
    STATE.playerData.hangmanWins = (STATE.playerData.hangmanWins || 0) + 1;
    addXP(25);
    speak(hangmanWord.en);
    setTimeout(() => { STATE.currentIndex++; nextHangman(); }, 1500);
  } else if (hangmanWrong.length >= MAX_WRONG) {
    result.textContent = `💀 실패! 정답은 "${hangmanWord.en}"`;
    result.style.color = '#f857a6';
    STATE.playerData.monsterSet.add(hangmanWord.en);
    savePlayer();
    speak(hangmanWord.en);
    setTimeout(() => { STATE.currentIndex++; nextHangman(); }, 2000);
  }
}

function drawHangman(wrong) {
  const canvas = document.getElementById('hangman-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 200, 220);
  ctx.strokeStyle = '#38f9d7';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Gallows
  ctx.beginPath();
  ctx.moveTo(20, 210); ctx.lineTo(180, 210); // base
  ctx.moveTo(60, 210); ctx.lineTo(60, 20);   // pole
  ctx.moveTo(60, 20);  ctx.lineTo(130, 20);  // top
  ctx.moveTo(130, 20); ctx.lineTo(130, 45);  // rope
  ctx.stroke();

  ctx.strokeStyle = '#f093fb';

  if (wrong >= 1) { // Head
    ctx.beginPath(); ctx.arc(130, 62, 17, 0, Math.PI*2); ctx.stroke();
  }
  if (wrong >= 2) { // Body
    ctx.beginPath(); ctx.moveTo(130, 79); ctx.lineTo(130, 140); ctx.stroke();
  }
  if (wrong >= 3) { // Left arm
    ctx.beginPath(); ctx.moveTo(130, 95); ctx.lineTo(100, 120); ctx.stroke();
  }
  if (wrong >= 4) { // Right arm
    ctx.beginPath(); ctx.moveTo(130, 95); ctx.lineTo(160, 120); ctx.stroke();
  }
  if (wrong >= 5) { // Left leg
    ctx.beginPath(); ctx.moveTo(130, 140); ctx.lineTo(105, 175); ctx.stroke();
  }
  if (wrong >= 6) { // Right leg
    ctx.beginPath(); ctx.moveTo(130, 140); ctx.lineTo(155, 175); ctx.stroke();
  }
}

// ===== VOICE QUIZ =====
let voiceWords = [], voiceWord = null;
let recognition = null;

function initVoice() {
  if (STATE.orderMode === 'random') {
    voiceWords = shuffle([...STATE.activeWords]);
  } else {
    voiceWords = [...STATE.activeWords];
  }
  STATE.currentIndex = 0;
  showScreen('screen-voice');
  nextVoice();

  document.getElementById('voice-tts').onclick = () => { if (voiceWord) speak(voiceWord.en); };
  document.getElementById('voice-next').onclick = () => { STATE.currentIndex++; nextVoice(); };

  const micBtn = document.getElementById('mic-btn');
  micBtn.onclick = startRecognition;
}

function nextVoice() {
  if (STATE.currentIndex >= voiceWords.length) {
    fireConfetti(); alert('🎉 발음 퀴즈 완료!'); showScreen('screen-main'); return;
  }
  voiceWord = voiceWords[STATE.currentIndex];
  document.getElementById('voice-word').textContent = voiceWord.en;
  document.getElementById('voice-meaning').textContent = voiceWord.ko;
  document.getElementById('voice-image').textContent = getEmoji(voiceWord);
  document.getElementById('voice-progress').textContent = `${STATE.currentIndex + 1} / ${voiceWords.length}`;
  document.getElementById('voice-result').textContent = '';
  document.getElementById('voice-heard').textContent = '';
  document.getElementById('mic-btn').classList.remove('listening');
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('이 브라우저는 음성 인식을 지원하지 않아요.\nChrome 브라우저를 사용해주세요!');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  const micBtn = document.getElementById('mic-btn');
  micBtn.classList.add('listening');
  micBtn.querySelector('.mic-label').textContent = '듣는 중...';

  recognition.onresult = e => {
    micBtn.classList.remove('listening');
    micBtn.querySelector('.mic-label').textContent = '눌러서 말하기';

    const alts = [...e.results[0]].map(r => r.transcript.toLowerCase().trim());
    const target = voiceWord.en.toLowerCase().trim();
    document.getElementById('voice-heard').textContent = `들린 말: "${alts[0]}"`;

    const correct = alts.some(a => a === target || a.includes(target) || target.includes(a));
    const resultEl = document.getElementById('voice-result');

    if (correct) {
      resultEl.textContent = '✅ 완벽한 발음!';
      resultEl.style.color = '#43e97b';
      STATE.playerData.learnedSet.add(voiceWord.en);
      STATE.playerData.monsterSet.delete(voiceWord.en);
      STATE.playerData.voiceWins = (STATE.playerData.voiceWins || 0) + 1;
      addXP(30);
      fireConfetti();
      setTimeout(() => { STATE.currentIndex++; nextVoice(); }, 1500);
    } else {
      resultEl.textContent = '🔄 다시 해봐요!';
      resultEl.style.color = '#f857a6';
      speak(voiceWord.en);
    }
  };

  recognition.onerror = e => {
    micBtn.classList.remove('listening');
    micBtn.querySelector('.mic-label').textContent = '눌러서 말하기';
    if (e.error === 'not-allowed') alert('마이크 권한이 필요해요!');
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    micBtn.querySelector('.mic-label').textContent = '눌러서 말하기';
  };

  recognition.start();
}

// ===== WORD LIST =====
function initWordList() {
  showScreen('screen-list');
  renderWordList('');
  const searchEl = document.getElementById('list-search');
  searchEl.value = '';
  searchEl.oninput = () => renderWordList(searchEl.value.toLowerCase());
}

function renderWordList(query) {
  const wrap = document.getElementById('word-list-wrap');
  wrap.innerHTML = '';
  const words = STATE.activeWords.filter(w =>
    !query || w.en.toLowerCase().includes(query) || w.ko.includes(query)
  );
  if (words.length === 0) {
    wrap.innerHTML = '<div style="text-align:center;color:var(--color-muted);padding:40px">검색 결과가 없어요 🔍</div>';
    return;
  }
  words.forEach(w => {
    const div = document.createElement('div');
    const isMonster = STATE.playerData.monsterSet.has(w.en);
    div.className = 'word-row' + (isMonster ? ' monster-word' : '');
    div.innerHTML = `
      <div class="word-emoji">${getEmoji(w)}</div>
      <div class="word-info">
        <div class="word-en">${escHTML(w.en)}${isMonster ? ' 👾' : ''}</div>
        <div class="word-ko">${escHTML(w.ko)}</div>
      </div>
      <button class="word-tts${isMonster?' monster':''}" title="발음 듣기">🔊</button>
    `;
    div.querySelector('.word-tts').addEventListener('click', () => speak(w.en));
    wrap.appendChild(div);
  });
}

// ===== BADGES MODAL =====
function renderBadgeGrid() {
  const grid = document.getElementById('badge-grid');
  grid.innerHTML = '';
  BADGES_DEF.forEach(b => {
    const unlocked = STATE.playerData.badges.includes(b.id);
    const item = document.createElement('div');
    item.className = 'badge-item ' + (unlocked ? 'unlocked' : 'locked');
    item.innerHTML = `
      <div class="badge-emoji">${b.emoji}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    `;
    grid.appendChild(item);
  });
}

// ===== MAIN INIT =====
function init() {
  loadPlayer();
  loadSets();
  updatePlayerUI();
  renderSetsList();
  initUploadScreen();
  initMainScreen();
  showScreen('screen-upload');

  // Preload voices
  window.speechSynthesis.getVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
  }
}

document.addEventListener('DOMContentLoaded', init);
