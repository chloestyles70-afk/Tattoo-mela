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


/* MUSIC */

song.src = 'audio/v09044g40000cbal4n3c77ufcrd3qlg0.m4a';
song.loop = true;
song.preload = 'metadata';
song.load();


async function startMusic() {
  try {
    song.muted = false;
    song.volume = 1;
    await song.play();

    music.textContent = '♫';
    music.setAttribute('aria-label', 'Pause music');

  } catch (error) {
    console.log('Music could not start:', error);
  }
}


/* VIDEO AUTOPLAY */

function stopAllVideos() {
  document.querySelectorAll('.chapter video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
}


function playChapterVideos() {
  const activeChapter = chapters[index];

  if (!activeChapter) return;

  activeChapter.querySelectorAll('video').forEach(video => {
    video.muted = true;
    video.playsInline = true;

    video.play().catch(() => {
      console.log('Video autoplay was blocked.');
    });
  });
}


/* CHAPTERS */

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

  stopAllVideos();

  index = Math.max(
    0,
    Math.min(chapters.length - 1, newIndex)
  );

  chapters.forEach((chapter, i) => {
    chapter.classList.toggle('active', i === index);
  });

  label.textContent = chapterNames[index];

  bar.style.width =
    ((index + 1) / chapters.length * 100) + '%';

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

  setTimeout(playChapterVideos, 150);
}


/* BEGIN */

begin.addEventListener('click', async () => {

  opening.style.display = 'none';

  story.classList.add('visible');
  story.setAttribute('aria-hidden', 'false');

  showChapter(0);

  await startMusic();
});


/* NEXT */

next.addEventListener('click', () => {

  if (index === chapters.length - 1) {
    showChapter(0);
  } else {
    showChapter(index + 1);
  }

});


/* BACK */

prev.addEventListener('click', () => {

  if (index > 0) {
    showChapter(index - 1);
  }

});


/* HOME */

home.addEventListener('click', () => {

  stopAllVideos();

  story.classList.remove('visible');
  story.setAttribute('aria-hidden', 'true');

  opening.style.display = 'grid';

  song.pause();
  song.currentTime = 0;

  showChapter(0);

});


/* MUSIC BUTTON */

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

  'When you miss me': `Melaaa ❤️

So you miss me huh? 😂

Well, I miss you too. Probably more than I’ll actually admit.

I wish I could just appear beside you right now, annoy you a little, make you laugh, and then just stay there with you.

But since I can't magically teleport 😂, just remember that no matter where we are or what's happening, you're still on my mind.

So when you miss me, come here and read this again.

And don't miss me too much, okay? 😂❤️

I love you, Mela.

— Alfred`,


  "When you're having a hard day": `Mela ❤️

Okay, come here for a second.

I know sometimes things just don't go the way you want them to, and some days can just be tiring.

But please don't let one bad day make you forget how amazing you are.

You don't have to have everything figured out right now. Just breathe, relax a little, and take things one step at a time.

And if nobody has told you today, I'm proud of you.

Even if today wasn't your best day, you still made it through.

So rest, smile a little, and remember that I'm always rooting for you.

And yeah… tomorrow better be nicer to you 😂❤️

— Alfred`,


  'When you need a smile': `Melaaa 😂❤️

If you’re reading this, then I’m guessing you need a little smile.

So first of all, smile for me. Yes, right now. Don’t pretend you didn’t see this part 😂.

I just want you to remember that there’s someone who genuinely loves you, thinks about you, misses you, and cares about you more than you probably realise.

And yeah, sometimes I might annoy you, stress you, or do something stupid 😂, but at the end of the day, you’re still my person.

So forget whatever is making you sad for a moment.

Smile, pretty girl.

And if you’re still not smiling after this… then I guess I’ll have to come and make you smile myself 😂❤️

— Alfred`
};


/* OPEN MESSAGE */

document.querySelectorAll('.when-list button').forEach(button => {

  button.addEventListener('click', () => {

    const message = button.dataset.message;

    modalTitle.textContent = message;

    modalText.textContent =
      messages[message];

    modal.classList.add('open');

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

  });

});


/* CLOSE MESSAGE */

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


/* TAP OUTSIDE TO CLOSE */

modal.addEventListener('click', event => {

  if (event.target === modal) {
    closeWhenModal();
  }

});


/* KEYBOARD */

document.addEventListener('keydown', event => {

  if (event.key === 'Escape') {
    closeWhenModal();
  }

  if (event.key === 'ArrowRight') {
    showChapter(index + 1);
  }

  if (event.key === 'ArrowLeft') {
    showChapter(index - 1);
  }

});


/* INITIAL STATE */

showChapter(0);
