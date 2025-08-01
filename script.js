const firebaseConfig = {
  apiKey: "AIzaSyBBrjqLqLvdUqhIIj-50Bt2sd3DA1BCtcE",
  authDomain: "guesstherank-c3abd.firebaseapp.com",
  databaseURL: "https://guesstherank-c3abd-default-rtdb.firebaseio.com",
  projectId: "guesstherank-c3abd",
  storageBucket: "guesstherank-c3abd.firebasestorage.app",
  messagingSenderId: "593433190092",
  appId: "1:593433190092:web:17c5389bc69a067a66ec69",
  measurementId: "G-LS3WFQXTVD",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const ranks = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Ascendant",
  "Immortal",
  "Radiant",
];

let currentClip = null;
const video = document.getElementById("videoPlayer");
const result = document.getElementById("result");
const rankButtons = document.getElementById("rankButtons");

function extractYouTubeID(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : "";
}

async function loadRandomClip() {
  const snapshot = await db
    .collection("clips")
    .where("guessed", "==", false)
    .orderBy("timestamp")
    .get();

  const videoContainer = document.getElementById("videoContainer");
  const title = document.getElementById("title");

  if (snapshot.empty) {
    video.src = "";
    videoContainer.style.display = "none";
    result.innerText = "🎉 No more clips!";
    rankButtons.innerHTML = "";
    title.innerText = "Guess The Rank - RecklessJ4 (No clips remaining)";
    return;
  } else {
    videoContainer.style.display = "block";
    title.innerText = `Guess The Rank - RecklessJ4 (Clips remaining: ${snapshot.size})`;
  }

  currentClip = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)];
  const data = currentClip.data();
  const vidId = extractYouTubeID(data.url);

  video.src = `https://www.youtube.com/embed/${vidId}?autoplay=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${vidId}`;

  result.innerText = "";
  rankButtons.innerHTML = "";

  enableRankButtons();

  ranks.forEach((rank) => {
    const img = document.createElement("img");
    img.src = `images/${rank}.webp`; // path to your images folder
    img.alt = rank;
    img.title = rank;
    img.style.cursor = "pointer";
    img.style.width = "100px"; // adjust size as you like
    img.style.margin = "5px";
    img.style.borderRadius = "8px";
    img.style.transition = "transform 0.2s";

    // Optional: scale up on hover
    img.onmouseover = () => (img.style.transform = "scale(1.1)");
    img.onmouseout = () => (img.style.transform = "scale(1)");

    img.onclick = () => handleGuess(rank, data.rank);
    rankButtons.appendChild(img);
  });
}

function disableRankButtons() {
  const imgs = rankButtons.querySelectorAll("img");
  imgs.forEach((img) => {
    img.style.pointerEvents = "none"; // disable clicking
    img.style.opacity = "0.6"; // optionally visually show disabled state
    img.style.cursor = "default";
  });
}

function enableRankButtons() {
  const imgs = rankButtons.querySelectorAll("img");
  imgs.forEach((img) => {
    img.style.pointerEvents = "auto";
    img.style.opacity = "1";
    img.style.cursor = "pointer";
  });
}

async function handleGuess(guess, correct) {
  if (!currentClip) return;

  const data = currentClip.data();
  const name = data.name || "This clip";

  result.innerText =
    guess === correct
      ? `✅ Correct! ${name} was ${correct}`
      : `❌ Wrong! ${name} was ${correct}`;

  await db.collection("clips").doc(currentClip.id).update({
    guessed: true,
    guessedRank: guess,
  });

  disableRankButtons();

  const imgs = rankButtons.querySelectorAll("img");
  imgs.forEach((img) => {
    if (img.alt === correct) {
      img.classList.add("highlight-correct");
    }
  });
}

document.getElementById("nextBtn").addEventListener("click", loadRandomClip);

document.getElementById("removeBtn").addEventListener("click", async () => {
  if (!currentClip) return;
  await db.collection("clips").doc(currentClip.id).delete();
  loadRandomClip();
});

// Load first clip on page load
loadRandomClip();
