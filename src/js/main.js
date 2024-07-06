import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://endorsement-96e52-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementsData = ref(database, "user");

const textarea = document.getElementById("textarea");
const from = document.getElementById("from");
const toEl = document.getElementById("to");
const publishBtn = document.getElementById("publish-btn");
const endorsementsList = document.getElementById("endorsements-list");

publishBtn.addEventListener("click", handlePublishClick);
publishBtn.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handlePublishClick();
  }
});

function handlePublishClick() {
  const reviewText = textarea.value.trim();
  const fromData = from.value.trim();
  const toData = toEl.value.trim();

  if (reviewText && fromData && toData) {
    clearFields();
    pushData(reviewText, fromData, toData);
    resetBorders();
  } else {
    highlightEmptyFields();
  }
}

function clearFields() {
  textarea.value = "";
  from.value = "";
  toEl.value = "";
}

function resetBorders() {
  textarea.style.border = "none";
  from.style.border = "none";
  toEl.style.border = "none";
}

function highlightEmptyFields() {
  [textarea, from, toEl].forEach((el) => {
    el.style.border = el.value.trim() ? "none" : "2px solid red";
  });
}

function pushData(review, sender, recipient) {
  const data = [review, sender, recipient, 0];
  push(endorsementsData, data).catch((error) => {
    console.error("Error pushing data to Firebase:", error);
  });
}

onValue(endorsementsData, (snapshot) => {
  endorsementsList.innerHTML = "";
  if (snapshot.exists()) {
    const itemsArray = Object.entries(snapshot.val());
    itemsArray.forEach((item) => {
      appendReviewToEndorsements(item);
    });
  } else {
    endorsementsList.textContent = "No endorsements available.";
  }
}, (error) => {
  console.error("Error reading data from Firebase:", error);
});

function appendReviewToEndorsements([reviewId, reviewData]) {
  const [reviewText, reviewFrom, reviewTo, reviewLikes] = reviewData;

  const deleteEl = document.createElement("div");
  const newEl = document.createElement("li");
  const mainConEl = document.createElement("div");
  const toEl = document.createElement("h3");
  const reviewEl = document.createElement("p");
  const flexEl = document.createElement("div");
  const from = document.createElement("h3");
  const likesEl = document.createElement("div");

  deleteEl.textContent = "❌";
  toEl.textContent = `To ${reviewTo}`;
  reviewEl.textContent = reviewText;
  from.textContent = `From ${reviewFrom}`;
  likesEl.textContent = `💖 ${reviewLikes}`;

  mainConEl.append(deleteEl, toEl, reviewEl, flexEl);
  flexEl.append(from, likesEl);
  newEl.appendChild(mainConEl);

  deleteEl.classList.add("delete-btn");
  deleteEl.style.color = "red";
  reviewEl.classList.add("review-text");
  flexEl.classList.add("flex-container");
  likesEl.classList.add("like-btn");

  likesEl.addEventListener("click", () => {
    const newLikes = reviewLikes + 1;
    const exactLocationDB = ref(database, `user/${reviewId}`);
    update(exactLocationDB, {
      3: newLikes,
    }).catch((error) => {
      console.error("Error updating likes in Firebase:", error);
    });
  });

  deleteEl.addEventListener("click", () => {
    deleteReview(reviewId);
  });

  endorsementsList.appendChild(newEl);
}

function deleteReview(reviewId) {
  const exactLocationDB = ref(database, `user/${reviewId}`);
  remove(exactLocationDB).catch((error) => {
    console.error("Error deleting review from Firebase:", error);
  });
}
