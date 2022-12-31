import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, setDoc, updateDoc, doc, query, where, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyD2Q53YOsXBQBEqgqoayCReYYXhemTVCUI",
    authDomain: "localeyes-95d0d.firebaseapp.com",
    projectId: "localeyes-95d0d",
    appId: "1:847201898317:web:7a72d72afb4d81bcd53104",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentPage = 1;
let username;
let userTime;
let userImg;
let userId;

document.addEventListener('DOMContentLoaded', () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    username = params.name;
    userTime = params.createdOn;
    userImg = sessionStorage.getItem('userImg');
    userId = params.userId;
    console.log(username, userTime, userImg, userId);
});

function goToNextPage() {
    loadPage(currentPage + 1);
    console.log("current page is ", currentPage);
}

function goToPrevPage() {
    loadPage(currentPage - 1);
    console.log("current page is ", currentPage);
}

function loadPage(page) {
    setTimeout(() => { document.getElementById(`section${page}`).scrollIntoView(); }, 500);
    switch (parseInt(page)) {
        case 2:
            currentPage = 2;
            document.getElementById("user-name").innerHTML = username;
            break;
        case 3:
            timeSinceUser();
            break;
        case 4:
            profileScore();
            break;
        default:
            break;
    }
}

function timeSinceUser() {
    currentPage = 3
    const time = getTimeDiff(parseInt(`${userTime}000`), Date.now(), true);
    console.log(time);
    const years = time.year;
    const days = time.days;
    const hours = time.hours;
    const minutes = time.minutes;
    countUpTo(parseInt(years), 'date-year');
    countUpTo(parseInt(days), 'date-days');
    countUpTo(parseInt(hours), 'date-hours');
    countUpTo(parseInt(minutes), 'date-mins');
}

function profileScore() {
    currentPage = 4;
    const profilePicture = document.getElementById('profile-picture');
    profilePicture.src = userImg;
    profilePicture.style.borderRadius = "50%";
    profilePicture.style.border = "5px solid #62c9d5";
    document.getElementById('name').innerText = username;
    // get totalScore as first 2 and last 2 digits of userTime
    const totalScore = parseInt(`${userTime}`.slice(0, 2) + `${userTime}`.slice(-2));
    countUpTo(parseInt(Math.ceil(totalScore / 100)), "profile-score");
    updateDoc(doc(db, "userMetaData", userId), {
        "flashBack.hasSeen": true,
        "flashBack.totalScore": parseInt(Math.ceil(totalScore / 100)),
        "flashBack.profileTag": "Newbie",
        "flashBack.personalityShort": "NERR",
        "flashBack.personalityLong": ["Newcomer", "Explorer", "Rookie", "Rare resident"],
    });
}

function countUpTo(count, elementId) {
    if (count === 0) {
        document.getElementById(elementId).innerText = 0;
        return;
    }
    let current = 0;
    let multiplier = 1;
    // set multiplier according to the number of digits in count
    if (count > 0 && count < 10) {
        multiplier = 1;
    } else if (count >= 10 && count < 50) {
        multiplier = 2;
    } else if (count >= 50 && count < 100) {
        multiplier = 5;
    } else if (count >= 100 && count < 500) {
        multiplier = 10;
    }
    setTimeout(() => {
        let interval = setInterval(() => {
            current += multiplier;
            document.getElementById(elementId).innerText = current;
            if (current >= count) {
                clearInterval(interval);
                document.getElementById(elementId).innerText = count;
            }
        }, 100);
    }, 1000);
}

function getTimeDiff(join, lastSeen, now = false) {
    let t1 = new Date(join).getTime(),
        t2 = new Date(lastSeen).getTime(),
        milliseconds = 0,
        time = {};
    if (now) t2 = Date.now();
    if (isNaN(t1) || isNaN(t2)) return '';
    if (t1 < t2) milliseconds = t2 - t1;
    else milliseconds = t1 - t2;
    var days = Math.floor(milliseconds / 1000 / 60 / (60 * 24));
    var date_diff = new Date(milliseconds);
    if (days > 365) {
        time['year'] = Math.floor(days / 365);
        time['days'] = days - 365;
    } else {
        time['year'] = 0;
        time['days'] = days;
    }
    if (date_diff.getHours() && date_diff.getHours() > 0) { time['hours'] = date_diff.getHours() } else { time['hours'] = 0 };
    if (date_diff.getMinutes() && date_diff.getMinutes() > 0) { time['minutes'] = date_diff.getMinutes() } else { time['minutes'] = 0 };
    return time;
}

window.loadPage = loadPage;
window.goToNextPage = goToNextPage;
window.goToPrevPage = goToPrevPage;