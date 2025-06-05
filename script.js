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

window.onload = () => {
  loadChant();
  chantContainer.style.fontSize = fontSizeSlider.value + "px";
};
