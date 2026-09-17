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

const home = document.getElementById('homeBtn');

let index = 0;
let musicStarted = false;


/* =========================
   MUSIC
========================= */

song.src = 'audio/v09044g40000cbal4n3c77ufcrd3qlg0.m4a';
song.loop = true;
song.preload = 'metadata';
song.load();


async function startMusic() {
  try {
    song.muted = false;
    song.volume = 1;

    await song.play();

    musicStarted = true;
    music.textContent = '♫';
    music.setAttribute('aria-label', 'Pause music');

  } catch (error) {
    console.log('Music waiting for user interaction.');
    music.textContent = '♫';
  }
}


/* =========================
   CHAPTERS
========================= */

const chapterNames = [
  'Chapter 01',
  'Chapter 02',
  'Chapter 03',
  'Chapter 04',
  'Chapter 05',
  'A letter',
  'Open when…'
];


function showChapter(newIndex) {

  index = Math.max(
    0,
    Math.min(chapters.length - 1, newIndex)
  );

  chapters.forEach((chapter, i) => {
    chapter.classList.toggle(
      'active',
      i === index
    );
  });

  label.textContent = chapterNames[index];

  const progress =
    ((index + 1) / chapters.length) * 100;

  bar.style.width = progress + '%';

  prev.style.visibility =
    index === 0 ? 'hidden' : 'visible';

  next.textContent =
    index === chapters.length - 1
      ? 'Replay'
      : 'Next';

  story.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


/* =========================
   BEGIN
========================= */

begin.addEventListener('click', async () => {

  opening.style.display = 'none';

  story.classList.add('visible');
  story.setAttribute('aria-hidden', 'false');

  showChapter(0);

  await startMusic();
});


/* =========================
   NEXT
========================= */

next.addEventListener('click', () => {

  if (index === chapters.length - 1) {

    showChapter(0);

    story.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    return;
  }

  showChapter(index + 1);
});


/* =========================
   BACK
========================= */

prev.addEventListener('click', () => {

  if (index > 0) {
    showChapter(index - 1);
  }
});


/* =========================
   HOME
========================= */

home.addEventListener('click', () => {

  story.classList.remove('visible');

  story.setAttribute(
    'aria-hidden',
    'true'
  );

  opening.style.display = 'grid';

  song.pause();
  song.currentTime = 0;

  musicStarted = false;

  showChapter(0);
});


/* =========================
   MUSIC BUTTON
========================= */

music.addEventListener('click', async () => {

  if (song.paused) {

    await startMusic();

  } else {

    song.pause();

    music.textContent = '▶';
    music.setAttribute(
      'aria-label',
      'Play music'
    );
  }
});


/* =========================
   OPEN WHEN
========================= */

const modal = document.getElementById('whenModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');


const messages = {

  'When you miss me':
    'If you miss me, close your eyes for a moment and remember that somewhere, someone is thinking about you too.',

  "When you're having a hard day":
    'You do not have to have everything figured out today. Take a breath, take your time, and remember that tomorrow is another page.',

  'When you need a smile':
    'Here is your reminder: you are loved, you are special, and there is at least one person who will always want to see you smile.'
};


document.querySelectorAll(
  '.when-list button'
).forEach(button => {

  button.addEventListener('click', () => {

    const message =
      button.dataset.message;

    modalTitle.textContent = message;

    modalText.textContent =
      messages[message] ||
      'No matter what happens, remember that you are cared for and deeply appreciated.';

    modal.classList.add('open');

    modal.setAttribute(
      'aria-hidden',
      'false'
    );
  });
});


/* =========================
   CLOSE MODAL
========================= */

function closeWhenModal() {

  modal.classList.remove('open');

  modal.setAttribute(
    'aria-hidden',
    'true'
  );
}


closeModal.addEventListener(
  'click',
  closeWhenModal
);


/* Close when tapping outside */

modal.addEventListener('click', event => {

  if (event.target === modal) {
    closeWhenModal();
  }
});


/* Close with Escape */

document.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Escape') {
      closeWhenModal();
    }

    if (event.key === 'ArrowRight') {
      showChapter(index + 1);
    }

    if (event.key === 'ArrowLeft') {
      showChapter(index - 1);
    }
  }
);


/* =========================
   INITIAL STATE
========================= */

showChapter(0);
