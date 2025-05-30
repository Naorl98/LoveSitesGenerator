// === Constants and Helpers ===
const $ = (id) => document.getElementById(id);

const gallery        = $("gallery");
const bg1            = $("bg1");
const bg2            = $("bg2");
const mainTitle      = $("mainTitle");
const loveTimer      = $("loveTimer");
const letterBox      = $("letterBox");
const letterBtn      = $("letterBtn");
const editLetterBtn  = $("editLetterBtn");
const saveLetterBtn  = $("saveLetterBtn");
const letterTextView = $("letterTextView");
const letterEditSec  = $("letterEditSection");
const letterTextDisp = $("letterTextDisplay");
const loveBtn        = $("playBtn");
const boomBtn        = $("boomBtn");
const shuffleBtn     = $("shuffleGalleryBtn");
const uploadImgBtn   = $("uploadImgBtn");
const uploadSongBtn  = $("uploadSongBtn");
const uploadHeroBg   = $("uploadHeroBg");
const footerText     = $("footerText");
const player         = $("player");
const songPlayerBtn  = $("songPlayerBtn"); // Optional: Only if exists

if (songPlayerBtn) songPlayerBtn.addEventListener("click", playNext);

let galleryImages = window.GALLERY_IMAGES || [];
let heroBgUrl    = "";

// =========== GALLERY (up to 20 images) ===========
function populateGallery() {
  gallery.innerHTML = "";
  let images = galleryImages.slice(0, 20);
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = typeof src === "string" && src.startsWith("data:") ? src : `./img/${src}`;
    img.alt = `תמונה מתוך הגלריה - ${i+1}`;
    img.loading = "lazy";
    img.addEventListener("click", () => showLightbox(img.src));
    gallery.appendChild(img);
  });
}
function showLightbox(src) {
  $("lightbox-img").src = src;
  $("lightbox").classList.add("visible");
}
function hideLightbox() {
  $("lightbox").classList.remove("visible");
  $("lightbox-img").src = "";
}
$("lightbox").addEventListener("click", (e) => {
  if (e.target === $("lightbox")) hideLightbox();
});

// =========== HERO BACKGROUND ===========
function switchBackground() {
  if (!galleryImages.length) return;
  const idx = Math.floor(Math.random()*galleryImages.length);
  const url = typeof galleryImages[idx] === "string" && galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `./img/${galleryImages[idx]}`;
  const next = bg1.classList.contains("visible") ? bg2 : bg1;
  const curr = bg1.classList.contains("visible") ? bg1 : bg2;
  next.style.backgroundImage = `url("${url}")`;
  next.classList.add("visible");
  curr.classList.remove("visible");
}
function initBackgrounds() {
  if (!galleryImages.length) return;
  bg1.style.backgroundImage = bg2.style.backgroundImage =
    `url("${typeof galleryImages[0] === "string" && galleryImages[0].startsWith("data:") ? galleryImages[0] : `./img/${galleryImages[0]}`}")`;
  bg1.classList.add("visible");
  setInterval(switchBackground, 7000);
}
uploadHeroBg && uploadHeroBg.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    bg1.style.backgroundImage = bg2.style.backgroundImage = `url('${ev.target.result}')`;
  };
  reader.readAsDataURL(file);
});

// =========== HEARTS (LOVE U) ===============
function createHearts() {
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = 3 + Math.random()*2 + "s";
    heart.style.fontSize = 16 + Math.random()*24 + "px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
  }
}

// =========== BOOM! ===============
function createBoomExplosion() {
  if (!galleryImages.length) return;
  const idx = Math.floor(Math.random()*galleryImages.length);
  const src = typeof galleryImages[idx] === "string" && galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `./img/${galleryImages[idx]}`;
  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "boom-img";
    img.style.left = Math.random()*100 + "vw";
    img.style.animationDuration = 3 + Math.random()*2 + "s";
    img.style.width = 40 + Math.random()*40 + "px";
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 5000);
  }
}

// =========== SHUFFLE GALLERY ===========
shuffleBtn.addEventListener("click", () => {
  if (!galleryImages.length) return;
  let idx = Math.floor(Math.random()*galleryImages.length);
  showLightbox(typeof galleryImages[idx] === "string" && galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `./img/${galleryImages[idx]}`);
});

// =========== MUSIC PLAYER ===========
let songs = [];
let queue = [];
function playNext() {
  if (!songs.length) return;
  if (!queue.length) queue = shuffle([...songs]);
  const next = queue.shift();
  player.src = next;
  player.play().catch(err => console.warn("Autoplay block:", err));
  showPlayerToast(next);
}
player.addEventListener("ended", playNext);

function showPlayerToast(songName) {
  let toast = $("nowPlayingToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "nowPlayingToast";
    toast.className = "toast persistent-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <button id="prevBtn">⏮️</button>
    <button id="togglePlayBtn">⏸️</button>
    <button id="nextBtn">⏭️</button>
    <span><strong>${songName.replace(".mp3", "")}</strong> 💖</span>
  `;
  $("togglePlayBtn").onclick = () => {
    if (player.paused) {
      player.play();
      $("togglePlayBtn").textContent = "⏸️";
    } else {
      player.pause();
      $("togglePlayBtn").textContent = "▶️";
    }
  };
  $("nextBtn").onclick = playNext;
  $("prevBtn").onclick = () => {
    if (player.currentTime > 5) {
      player.currentTime = 0;
    } else {
      if (player.src) {
        const currentSong = player.src;
        queue.unshift(currentSong);
      }
      queue = shuffle([...songs]);
      playNext();
    }
  };
}

// =========== UPLOADS ===========
uploadImgBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = () => {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        galleryImages.unshift(ev.target.result);
        populateGallery();
      };
      reader.readAsDataURL(file);
    });
  };
  input.click();
});
uploadSongBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.multiple = true;
  input.onchange = () => {
    Array.from(input.files).forEach(file => {
      const url = URL.createObjectURL(file);
      songs.push(url);
    });
    queue = shuffle([...songs]);
    playNext();
  };
  input.click();
});

// =========== LOVE LETTER POPUP ===========
function showLetterPopup() {
  letterBox.classList.add("visible");
  letterEditSec.style.display = "none";
  letterTextView.style.display = "";
}
function hideLetter() {
  letterBox.classList.remove("visible");
}
letterBtn.addEventListener("click", showLetterPopup);

editLetterBtn.addEventListener("click", () => {
  letterEditSec.style.display = "";
  letterTextView.style.display = "none";
  $("loveLetterInput").value = letterTextDisp.textContent;
});
saveLetterBtn.addEventListener("click", () => {
  const val = $("loveLetterInput").value;
  letterTextDisp.textContent = val;
  letterEditSec.style.display = "none";
  letterTextView.style.display = "";
  sendEmail("letter", val);
});

// =========== BUTTON EVENTS ===========
loveBtn.addEventListener("click", () => {
  createHearts();
  sendEmail("love");
});
boomBtn.addEventListener("click", createBoomExplosion);

// =========== LOVE TIMER ===========
const startDate = new Date("2025-03-06T14:26:00");
function updateLoveTimer() {
  const now = new Date();
  let diff = Math.floor((now - startDate)/1000);
  const days = Math.floor(diff/86400); diff %= 86400;
  const hours = Math.floor(diff/3600); diff %= 3600;
  const mins = Math.floor(diff/60); diff %= 60;
  const secs = diff;
  loveTimer.textContent = `מאוהב קשות כבר ${days} ימים ${hours} שעות ${mins} דקות ${secs} שניות`;
}
setInterval(updateLoveTimer, 1000);

// =========== EMAILJS ===========
function sendEmail(type, msg) {
    // משתמשים בקונסול כדי לבדוק אם EmailJS קיים
    if (typeof emailjs === "undefined") {
      console.log("EmailJS not loaded!");
      return;
    }
    // ערכים אמיתיים
    const serviceID    = "service_5z3zm6i";
    const templateID   = "template_ndb3wcx";
    const userID       = "mfq1Yd_yCw97pCAJF";
    const toEmail      = "naorman12@email.com";
    const fromName     = "Naor";
    const replyEmail   = "naorman12@email.com";
    const siteTitle    = "Love Site";
    let subject = "";
    let message = "";
    if (type === "love") {
      subject = "Love Message from " + siteTitle;
      message = "I LOVE YOU! " + new Date().toLocaleString();
    } else if (type === "letter") {
      subject = "יש מכתב חדש באתר " + siteTitle;
      message = msg;
    }
    emailjs.init(userID);
    emailjs.send(serviceID, templateID, {
      to_email: toEmail,
      from_name: fromName,
      from_email: replyEmail,
      subject,
      message,
      date: new Date().toLocaleString()
    }).then(() => {
      showToast("המייל נשלח בהצלחה!");
    }).catch((err) => {
      showToast("שגיאה בשליחת המייל!");
      console.error("EmailJS error", err);
    });
  }
// =========== TOAST ===========
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = 1;
  setTimeout(() => { toast.style.opacity = 0; }, 2600);
}

// =========== INIT ===========
function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    if (window.GALLERY_IMAGES_JSON) galleryImages = JSON.parse(window.GALLERY_IMAGES_JSON);
  } catch {}
  populateGallery();
  initBackgrounds();
  updateLoveTimer();
});
