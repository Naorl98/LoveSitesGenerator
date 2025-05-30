const APPROVED_ICON = `./img/approved.png`;
const $ = (id) => document.getElementById(id);

const gallery     = $("gallery");
const lightbox    = $("lightbox");
const lightboxImg = $("lightbox-img");
const letterBox   = $("letterBox");
const loveTimer   = $("loveTimer");

let images = [];
try {
  images = JSON.parse('["user_1.jpg", "user_2.jpg", "user_3.jpg", "user_4.jpg", "user_5.jpg", "user_6.jpg", "user_7.jpg", "user_8.jpg", "user_9.jpg", "user_10.jpg", "user_11.jpeg", "user_12.jpg", "user_13.jpg", "user_14.jpg", "user_15.jpg", "user_16.jpg", "user_17.jpg", "user_18.jpg", "user_19.jpg", "user_20.jpg", "user_21.jpg", "user_22.jpg", "user_23.jpg", "user_24.jpg"]');
} catch {
  images = [];
  for (let i = 1; i <= 20; ++i)
    images.push(`user_${i}.png`);
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
function populateGallery() {
  let imgs = [...images];
  if (imgs.length > 20) shuffle(imgs);
  imgs = imgs.slice(0, 20);
  gallery.innerHTML = "";
  imgs.forEach(file => {
    const img = document.createElement("img");
    img.src  = `./img/${file}`;
    img.alt  = `Gallery image - ${file}`;
    img.loading = "lazy";
    img.addEventListener("click", () => showLightbox(img.src));
    gallery.appendChild(img);
  });
}
function showLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add("visible");
}
function hideLightbox() {
  lightbox.classList.remove("visible");
  lightboxImg.src = "";
}
if (lightbox) lightbox.addEventListener("click", (e) => e.target === lightbox && hideLightbox());

function createHearts() {
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "😘";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = 3 + Math.random()*2 + "s";
    heart.style.fontSize = 16 + Math.random()*24 + "px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
  }
}

const startDate = new Date("2024-12-31T14:26:00");
function updateLoveTimer() {
  const now = new Date();
  let diff = Math.floor((now - startDate)/1000);
  const days = Math.floor(diff/86400); diff %= 86400;
  const hours = Math.floor(diff/3600); diff %= 3600;
  const mins = Math.floor(diff/60); diff %= 60;
  const secs = diff;
  loveTimer.textContent = "Falling in love for {{days}} days, {{hours}} hours, {{mins}} minutes, and {{secs}} seconds"
    .replace("{{days}}", days)
    .replace("{{hours}}", hours)
    .replace("{{mins}}", mins)
    .replace("{{secs}}", secs);
}

function wireEvents() {
  if($("playBtn")) $("playBtn").addEventListener("click", () => {
    createHearts();
    sendLoveMail();
  });
  if($("letterBtn")) $("letterBtn").addEventListener("click", () => letterBox.style.display = "block");
  if($("shuffleGalleryBtn")) $("shuffleGalleryBtn").addEventListener("click", shuffleAndRepopulateGallery);
  if($("approvedBtn")) $("approvedBtn").addEventListener("click", createApprovedExplosion);
}
function shuffleAndRepopulateGallery() {
  shuffle(images);
  populateGallery();
}
function createApprovedExplosion() {
  for (let i = 0; i < 12; i++) {
    const img = document.createElement("img");
    img.src = APPROVED_ICON;
    img.className = "approved-explosion";
    img.style.left = Math.random()*100 + "vw";
    img.style.animationDuration = 3 + Math.random()*2 + "s";
    img.style.width = 40 + Math.random()*40 + "px";
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 5000);
  }
}
window.hideLetter = () => letterBox.style.display = "none";

// ============ EmailJS ==============
(function(){
    emailjs.init("mfq1Yd_yCw97pCAJF");
})();
function sendLoveMail() {
    const now = new Date();
    const dateString = now.toLocaleString('he-IL');
    emailjs.send("service_5z3zm6i", "template_ndb3wcx", {
        email: "naorlad98@gmail.com",
        name: "test",
        replay_email: "naorman12@gmail.com",
        subject: "Love Message from TEST SITE",
        message: "I LOVE U! Sent automatically from my site. Date: {{date}}",
        date: dateString,
    }).then(() => alert("Love message sent!")).catch(() => alert("Error sending email."));
}
function sendLetterMail() {
    const now = new Date();
    const dateString = now.toLocaleString('he-IL');
    const content = document.getElementById("editLetterInput").value;
    emailjs.send("service_5z3zm6i", "template_ndb3wcx", {
        email: "naorlad98@gmail.com",
        name: "test",
        replay_email: "naorman12@gmail.com",
        subject: "New Love Letter - TEST SITE",
        message: content,
        date: dateString,
    }).then(() => alert("Letter sent!")).catch(() => alert("Error sending email."));
}
document.addEventListener("DOMContentLoaded", () => {
  populateGallery();
  wireEvents();
  updateLoveTimer();
  setInterval(updateLoveTimer, 1000);
});
