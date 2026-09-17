const opening = document.getElementById('opening');
const story = document.getElementById('story');
const begin = document.getElementById('beginBtn');
const chapters = [...document.querySelectorAll('.chapter')];
const label = document.getElementById('chapterLabel');
const bar = document.getElementById('progressBar');
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');
const song = document.getElementById('song');
const music = document.getElementById('musicBtn');

let index = 0;

song.src = 'audio/v09044g40000cbal4n3c77ufcrd3qlg0-3.m4a';
song.load();

function show(i) {
  index = Math.max(0, Math.min(chapters.length - 1, i));

  chapters.forEach((c, n) => {
    c.classList.toggle('active', n === index);
  });

  const names = [
    'Chapter 01',
    'Chapter 02',
    'Chapter 03',
    'Chapter 04',
    'Chapter 05',
    'A letter',
    'Open when…'
  ];

  label.textContent = names[index];
  bar.style.width = ((index + 1) / chapters.length * 100) + '%';
  prev.style.visibility = index === 0 ? 'hidden' : 'visible';
  next.textContent = index === chapters.length - 1 ? 'Replay' : 'Next';

  window.scrollTo(0, 0);
}

async function startMusic() {
  try {
    song.muted = false;
    song.volume = 1;
    await song.play();

    music.textContent = '♫';
    music.setAttribute('aria-label', 'Pause music');
  } catch (error) {
    console.error('Audio could not start:', error);
    music.textContent = '♫';
    music.setAttribute('aria-label', 'Play music');
  }
}

begin.addEventListener('click', async () => {
  opening.style.display = 'none';

  story.classList.add('visible');
  story.setAttribute('aria-hidden', 'false');

  show(0);

  await startMusic();
});

prev.addEventListener('click', () => {
  show(index - 1);
});

next.addEventListener('click', () => {
  if (index === chapters.length - 1) {
    show(0);
  } else {
    show(index + 1);
  }
});

document.getElementById('homeBtn').addEventListener('click', () => {
  story.classList.remove('visible');
  story.setAttribute('aria-hidden', 'true');
  opening.style.display = 'grid';

  song.pause();
  song.currentTime = 0;
});

music.addEventListener('click', async () => {
  if (song.paused) {
    await startMusic();
  } else {
    song.pause();
    music.textContent = '▶';
    music.setAttribute('aria-label', 'Play music');
  }
});

document.querySelectorAll('.when-list button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = btn.dataset.message;
    document.getElementById('whenModal').classList.add('open');
  });
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('whenModal').classList.remove('open');
});

show(0);
