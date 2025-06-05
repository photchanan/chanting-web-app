let autoScroll = false;
let scrollInterval;

const chantSelector = document.getElementById('chantSelector');
const chantContainer = document.getElementById('chantContainer');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const audio = document.getElementById('chantAudio');

chantSelector.addEventListener('change', loadChant);
fontSizeSlider.addEventListener('input', () => {
  chantContainer.style.fontSize = fontSizeSlider.value + "px";
});

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


function toggleAutoScroll() {
  autoScroll = !autoScroll;
  if (autoScroll) {
    scrollInterval = setInterval(() => {
      chantContainer.scrollBy({ top: 1, behavior: 'smooth' });
    }, 100);
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

window.onload = () => {
  loadChant();
  chantContainer.style.fontSize = fontSizeSlider.value + "px";
};
