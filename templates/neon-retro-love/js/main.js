// === AWS S3 CONFIG ===
const BUCKET   = "{{BUCKET}}";
const IMG_DIR  = "{{IMG_DIR}}";
const SONG_DIR = "{{SONG_DIR}}";

// === MAIN DATA (מוזרק מ-main.py) ===
let galleryImages = JSON.parse('{{GALLERY_IMAGES}}');
let heroBgUrl     = "{{HERO_BG}}";
let floatingEmoji = "{{EMOJI}}";

// === EMAILJS CONFIG ===
const EMAILJS_USER_ID     = "{{EMAILJS_USER_ID}}";
const EMAILJS_SERVICE_ID  = "{{EMAILJS_SERVICE_ID}}";
const EMAILJS_TEMPLATE_ID = "{{EMAILJS_TEMPLATE_ID}}";
const TO_EMAIL            = "{{TO_EMAIL}}";
const FROM_NAME           = "{{FROM_NAME}}";

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
const loveBtn        = $("loveBtn");
const boomBtn        = $("boomBtn");
const shuffleBtn     = $("shuffleGalleryBtn");
const uploadImgBtn   = $("uploadImgBtn");
const uploadSongBtn  = $("uploadSongBtn");
const uploadHeroBg   = $("uploadHeroBg");
const footerText     = $("footerText");
const player         = $("player");
const songPlayerBtn  = $("songPlayerBtn");

let images = [];
let songs  = [];
let queue  = [];

window.hideLetter = function hideLetter() {
  letterBox.classList.remove("visible");
};

// ===== GALLERY =====
function populateGallery() {
  gallery.innerHTML = "";
  images = galleryImages.slice(0, 30);
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src.startsWith("http") || src.startsWith("data:")
      ? src
      : `${BUCKET}/${IMG_DIR}${src}`;
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

// ===== HERO BACKGROUND =====
function switchBackground() {
  if (!galleryImages.length) return;
  const idx = Math.floor(Math.random() * galleryImages.length);
  const url = galleryImages[idx].startsWith("http") || galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `${BUCKET}/${IMG_DIR}${galleryImages[idx]}`;
  const next = bg1.classList.contains("visible") ? bg2 : bg1;
  const curr = bg1.classList.contains("visible") ? bg1 : bg2;
  next.style.backgroundImage = `url("${url}")`;
  next.classList.add("visible");
  curr.classList.remove("visible");
}
function initBackgrounds() {
  if (heroBgUrl && heroBgUrl !== '""') {
    bg1.style.backgroundImage = bg2.style.backgroundImage = `url("${BUCKET}/${heroBgUrl.replace(/^["']|["']$/g, "")}")`;
  } else if (galleryImages.length) {
    const firstImg = galleryImages[0].startsWith("http") || galleryImages[0].startsWith("data:")
      ? galleryImages[0]
      : `${BUCKET}/${IMG_DIR}${galleryImages[0]}`;
    bg1.style.backgroundImage = bg2.style.backgroundImage = `url("${firstImg}")`;
  }
  bg1.classList.add("visible");
  setInterval(switchBackground, 7000);
}
uploadHeroBg && uploadHeroBg.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const key = `hero_${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
  const url = `${BUCKET}/${IMG_DIR}${key}`;
  await uploadFileToS3(url, file);
  bg1.style.backgroundImage = bg2.style.backgroundImage = `url('${url}')`;
  galleryImages.unshift(key);
  populateGallery();
});

// ===== HEARTS (LOVE U) =====
function createHearts() {
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = floatingEmoji || "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = 3 + Math.random()*2 + "s";
    heart.style.fontSize = 16 + Math.random()*24 + "px";
    heart.style.position = "fixed";
    heart.style.zIndex = 4000;
    heart.style.top = "80px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
  }
}

// ===== BOOM! =====
function createBoomExplosion() {
  if (!galleryImages.length) return;
  const idx = Math.floor(Math.random()*galleryImages.length);
  const src = galleryImages[idx].startsWith("http") || galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `${BUCKET}/${IMG_DIR}${galleryImages[idx]}`;
  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "boom-img";
    img.style.left = Math.random()*100 + "vw";
    img.style.animationDuration = 3 + Math.random()*2 + "s";
    img.style.width = 40 + Math.random()*40 + "px";
    img.style.position = "fixed";
    img.style.zIndex = 3000;
    img.style.top = "130px";
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 5000);
  }
}

// ===== SHUFFLE GALLERY =====
shuffleBtn.addEventListener("click", () => {
  if (!galleryImages.length) return;
  let idx = Math.floor(Math.random()*galleryImages.length);
  const src = galleryImages[idx].startsWith("http") || galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `${BUCKET}/${IMG_DIR}${galleryImages[idx]}`;
  showLightbox(src);
});

// ===== MUSIC PLAYER =====
function playNext() {
  if (!songs.length) return;
  if (!queue.length) queue = shuffle([...songs]);
  const next = queue.shift();
  player.src = next.startsWith("http")
    ? next
    : `${BUCKET}/${SONG_DIR}${next}`;
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

// ===== UPLOADS (to S3) =====
async function uploadFileToS3(url, file) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });
  if (!res.ok) {
    alert(`❌ Upload failed: ${file.name}`);
    throw new Error(`Upload failed: ${file.name}`);
  }
}

uploadImgBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = async () => {
    for (const file of input.files) {
      const key = `${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
      const url = `${BUCKET}/${IMG_DIR}${key}`;
      await uploadFileToS3(url, file);
      galleryImages.unshift(key);
    }
    populateGallery();
  };
  input.click();
});

uploadSongBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.multiple = true;
  input.onchange = async () => {
    for (const file of input.files) {
      const key = `${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
      const url = `${BUCKET}/${SONG_DIR}${key}`;
      await uploadFileToS3(url, file);
      songs.push(key);
    }
    queue = shuffle([...songs]);
    playNext();
  };
  input.click();
});

// ===== LOVE LETTER POPUP =====
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

// ===== BUTTON EVENTS =====
loveBtn.addEventListener("click", () => {
  createHearts();
  sendEmail("love");
});
boomBtn.addEventListener("click", createBoomExplosion);

// ===== LOVE TIMER =====
const startDate = new Date("{{TIMER_DATE}}");
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

// ===== EMAILJS =====
function sendEmail(type, msg) {
    if (typeof emailjs === "undefined") {
      console.log("EmailJS not loaded!");
      return;
    }
    let subject = "";
    let message = "";
    if (type === "love") {
      subject = "Love Message from your Love Site";
      message = "I LOVE U " + new Date().toLocaleString();
    } else if (type === "letter") {
      subject = "New Letter in your Love Site";
      message = msg;
    }
    emailjs.init(EMAILJS_USER_ID);
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: TO_EMAIL,
      from_name: FROM_NAME,
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
  
// ===== TOAST =====
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

// ===== INIT =====
function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
}

function setRandomBackground() {
  let url = "";
  if (heroBgUrl && heroBgUrl !== '""') {
    url = `${BUCKET}/${heroBgUrl.replace(/^["']|["']$/g, "")}`;
  } else {
    url = getRandomImage();
  }
  document.body.style.backgroundImage = `url('${url}')`;
}
function getRandomImage() {
  if (!galleryImages.length) return "";
  const idx = Math.floor(Math.random() * galleryImages.length);
  return galleryImages[idx].startsWith("http") || galleryImages[idx].startsWith("data:")
    ? galleryImages[idx]
    : `${BUCKET}/${IMG_DIR}${galleryImages[idx]}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // ישירות מה-main.py! הכל מוזרק
  populateGallery();
  initBackgrounds();
  updateLoveTimer();
  setRandomBackground();
  setInterval(updateLoveTimer, 1000);
  setInterval(createHearts, 200000);
  setInterval(setRandomBackground, 1000 * 60 * 4);
  if (songPlayerBtn) songPlayerBtn.addEventListener("click", playNext);
});
