let autoScroll = false;
let scrollSpeedLevel = 2; // เริ่มต้นที่ระดับกลาง (0 = ช้า, 4 = เร็วมาก)
let scrollInterval;

const chantSelector = document.getElementById('chantSelector');
const chantContainer = document.getElementById('chantContainer');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const audio = document.getElementById('chantAudio');

chantSelector.addEventListener('change', loadChant);
fontSizeSlider.addEventListener('input', () => {
  chantContainer.style.fontSize = fontSizeSlider.value + "px";
});

const speedDisplay = document.getElementById('speedDisplay');

const speedSettings = [
  { label: 'ช้ามาก', step: 1, interval: 100 },
  { label: 'ช้า', step: 1, interval: 60 },
  { label: 'กลาง', step: 2, interval: 50 },
  { label: 'เร็ว', step: 3, interval: 40 },
  { label: 'เร็วมาก', step: 4, interval: 30 }
];


function loadChant() {
  const selected = chantSelector.value;
  fetch(`chants/${selected}.json`)
    .then(res => res.json())
    .then(data => {
      chantContainer.innerHTML = '';
      data.forEach(line => {
        chantContainer.innerHTML += `
		  <p><strong>${line.th}</strong><br/>${line.en}<br/><em>${line.trans}</em></p>
        `;
      });

      // อัปเดตเสียงตามบทสวด
      audio.src = `audio/${selected}.mp3`;
    });
}

function updateSpeedLabel() {
  speedDisplay.textContent = speedSettings[scrollSpeedLevel].label;
}

function increaseScrollSpeed() {
  if (scrollSpeedLevel < speedSettings.length - 1) {
    scrollSpeedLevel++;
    updateSpeedLabel();
    restartScrollIfActive();
  }
}

function decreaseScrollSpeed() {
  if (scrollSpeedLevel > 0) {
    scrollSpeedLevel--;
    updateSpeedLabel();
    restartScrollIfActive();
  }
}

function restartScrollIfActive() {
  if (autoScroll) {
    clearInterval(scrollInterval);
    startAutoScroll();
  }
}

function startAutoScroll() {
  const { step, interval } = speedSettings[scrollSpeedLevel];
  scrollInterval = setInterval(() => {
    chantContainer.scrollBy({ top: step, behavior: 'smooth' });
  }, interval);
}

function toggleAutoScroll() {
  autoScroll = !autoScroll;
  if (autoScroll) {
    startAutoScroll();
  } else {
    clearInterval(scrollInterval);
  }
}

function toggleAudio() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function speakText(text, lang = 'th-TH') {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // ความเร็ว (1 = ปกติ)
  utterance.pitch = 1.0; // โทนเสียง

  // เลือกเสียงที่รองรับภาษา
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang === lang);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    console.warn(`ไม่พบ voice สำหรับภาษา ${lang}`);
  }

  speechSynthesis.speak(utterance);
}

function readChant() {
  const pTags = chantContainer.querySelectorAll('p');
  pTags.forEach(p => {
    const lines = p.innerText.split('\n');
    speakText(lines[0], 'th-TH');  // บรรทัดแรกเป็นบทสวดไทย
    speakText(lines[1], 'en-US');  // บรรทัดสองเป็นอังกฤษ
  });
}

async function loadChants() {
  const response = await fetch('chants.json');
  const chants = await response.json();
  return chants;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

async function searchByPurpose() {
  const query = document.getElementById("purposeSearch").value.trim().toLowerCase();
  const resultsEl = document.getElementById("chantResults");
  resultsEl.innerHTML = "";

  if (!query) return;

  const chants = await loadChants();
  const results = chants.filter(chant =>
    chant.purpose.some(purpose => purpose.toLowerCase().includes(query))
  );

  if (results.length === 0) {
    resultsEl.innerHTML = "<li>ไม่พบบทสวดที่ตรงกับจุดประสงค์</li>";
    return;
  }

  results.forEach(chant => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${chant.title}</strong><br><small>วัตถุประสงค์: ${chant.purpose.join(", ")}</small>`;
    li.style.cursor = "pointer";
    li.onclick = () => showChantContent(chant); // ฟังก์ชันโหลดบทสวด
    resultsEl.appendChild(li);
  });
}

document.getElementById("purposeSearch")
  .addEventListener("input", debounce(searchByPurpose, 300));

  
  function showChantContent(chant) { //
    chantContainer.innerHTML = `
      <h3>${chant.title}</h3>
      <p>${chant.content.th}</p>
      <hr>
      <p><em>${chant.content.en}</em></p>
    `;
    chantContainer.scrollTop = 0;
  }


window.onload = () => {
  speechSynthesis.getVoices(); // โหลดเสียง
  updateSpeedLabel();
  loadChant();
  chantContainer.style.fontSize = fontSizeSlider.value + "px";
};
