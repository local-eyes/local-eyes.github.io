import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, setDoc, updateDoc, doc, query, where, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyD2Q53YOsXBQBEqgqoayCReYYXhemTVCUI",
    authDomain: "localeyes-95d0d.firebaseapp.com",
    projectId: "localeyes-95d0d",
    appId: "1:847201898317:web:7a72d72afb4d81bcd53104",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentPage = 1;
let uid;
let globalUserData;
let isProgressDone = false;
let totalAnswers;
let totalLocalQuestions;
let totalLocalAnnouncements;
let totalCityQuestions;
let totalCityAnnouncements;


// create a promise that returns user data referral data and user meta data about the user uid
const getUserData = async(uid) => {
    const userRef = doc(db, "users", uid);
    const userReferralRef = doc(db, "referralData", uid);
    const userMetaRef = doc(db, "userMetaData", uid);
    const userDoc = await getDoc(userRef);
    const userReferralDoc = await getDoc(userReferralRef);
    const userMetaDoc = await getDoc(userMetaRef);

    let userData;
    let userReferralData;
    let userMetaData;
    if (userDoc.exists()) {
        userData = userDoc.data();
    } else {
        console.log("No Data for User!");
    }
    if (userReferralDoc.exists()) {
        userReferralData = userReferralDoc.data();
    } else {
        userReferralData = {
            "code": "HNY2023",
            "referrents": [],
            "wallet": {
                "balance": 0,
            }
        }
    }
    if (userMetaDoc.exists()) {
        userMetaData = userMetaDoc.data();
    } else {
        userMetaData = {
            "activeDays": [],
            "appOpenStreak": 0,
            "notifOpens": {
                "local": 0,
                "city": 0,
            },
            "weeklyActivity": {
                "2022dec25jan1": {
                    "local": 0,
                    "city": 0
                }
            }
        }
    }
    return {
        "userData": userData,
        "referralData": userReferralData,
        "metaData": userMetaData
    };
};

document.addEventListener("DOMContentLoaded", function() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    uid = params.uid;
    console.log("uid detected: " + uid);
    if (uid) {
        getUserData(uid).then((data) => {
            // document.getElementById("spinner").remove();
            console.log("setting global user data");
            if (data.userData.createdOn.seconds > 1671148799) {
                console.info("Account Created After 15th December 2022");
                document.getElementById("preload-text").innerText = "Not Enough Data for this Account!"
                setTimeout(() => {
                    sessionStorage.setItem('userImg', data.userData.imageURL);
                    window.location.href = `/newbie/?name=${data.userData.fullname}&createdOn=${data.userData.createdOn.seconds}`;
                }, 1000)
            } else {
                console.info("Account Created Before 15th December 2022");
                globalUserData = data;
                sessionStorage.setItem("userData", JSON.stringify(data));
                startLoading();
            }
        });
    } else {
        // create a sign in with google button
        const provider = new GoogleAuthProvider();
        const signInBtn = document.createElement("button");
        signInBtn.innerText = "Sign In with Google";
        signInBtn.id = "signInBtn";
        document.getElementById("preload-text").innerText = "Please Sign In to Continue";
        document.getElementById("preload-text").appendChild(signInBtn);
        signInBtn.addEventListener("click", () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    uid = result.user.uid;
                    getUserData(uid).then((data) => {
                        // document.getElementById("spinner").remove();
                        console.log("setting global user data");
                        if (data.userData.createdOn.seconds > 1671148799) {
                            console.info("Account Created After 15th December 2022");
                            document.getElementById("preload-text").innerText = "Not Enough Data for this Account!"
                            setTimeout(() => {
                                sessionStorage.setItem('userImg', data.userData.imageURL);
                                window.location.href = `/newbie/?name=${data.userData.fullname}&createdOn=${data.userData.createdOn.seconds}`;
                            }, 1000)
                        } else {
                            console.info("Account Created Before 15th December 2022");
                            globalUserData = data;
                            sessionStorage.setItem("userData", JSON.stringify(data));
                            startLoading();
                        }
                    });
                })
        });
    }
});

function startLoading() {
    let progress = 0;
    document.getElementById("progress_wrapper").style.visibility = `visible`;
    document.getElementById("preload-text").innerText = "Good things take time"
    const progressInterval = setInterval(() => {
        progress = progress + 10;
        document.getElementById("progress_bar_slider").style.width = `${progress}%`;
        isProgressDone = true;
        goToNextPage();
        if (progress >= 100) {
            isProgressDone = false;
            clearInterval(progressInterval);
            document.getElementById("progress_bar_slider").innerText = "Ready to Roll!";
            loadPage(1);
            currentPage = 1;
            displayNavigations();
            setTimeout(() => {
                document.getElementById("generator").remove();
            }, 1700)
        }
    }, 1000);
}

function displayNavigations() {
    const forwardBtn = document.getElementById("forward");
    const backBtn = document.getElementById("back");
    const sectionElem = document.getElementById("section1");
    let blur = 0;
    const blurInterval = setInterval(() => {
        forwardBtn.style.backgroundColor = `rgba(250, 250, 250, 0.5)`;
        backBtn.style.backgroundColor = "rgba(150, 150, 150, 0.5)";
        sectionElem.style.filter = `blur(${blur}px)`;
        forwardBtn.innerHTML = "Tap to<br>Go Ahead<br>👉🏻";
        backBtn.innerHTML = "👈🏻<br>Go Back";
        blur = blur + 1;
        if (blur > 5) {
            clearInterval(blurInterval);
        }
    }, 100);
    setTimeout(() => {
        const unBlurInterval = setInterval(() => {
            sectionElem.style.filter = `blur(${blur}px)`;
            blur = blur - 0.5;
            if (blur < 0) {
                clearInterval(unBlurInterval);
                isProgressDone = true;
            }
        }, 50);
        forwardBtn.style.backgroundColor = "transparent";
        backBtn.style.backgroundColor = "transparent";
        forwardBtn.innerHTML = "";
        backBtn.innerHTML = "";
    }, 4000);
}

function goToNextPage() {
    if (isProgressDone === true) {
        loadPage(currentPage + 1);
        console.log("current page is ", currentPage);
    } else {
        console.log("load not complete");
    }
}

function goToPrevPage() {
    if (isProgressDone === true) {
        loadPage(currentPage - 1);
        console.log("current page is ", currentPage);
    } else {
        console.log("load not complete");
    }
}

function loadPage(page) {
    setTimeout(() => { document.getElementById(`section${page}`).scrollIntoView(); }, 500);
    switch (parseInt(page)) {
        case 1:
            currentPage = 1;
            break;
        case 2:
            currentPage = 2;
            document.getElementById("user-name").innerHTML = globalUserData.userData.fullname;
            break;
        case 3:
            timeSinceUser();
            break;
        case 4:
            appOpenStreak()
            break;
        case 5:
            faveNotification();
            break;
        case 6:
            localAskerAnnouncer();
            break;
        case 7:
            cityAskerAnnouncer();
            break;
        case 8:
            answersGiven();
            break;
        case 9:
            mostActiveWeek();
            break;
        case 10:
            referrals();
            break;
        case 11:
            profileScore();
            break;
        default:
            break;
    }
}

function timeSinceUser() {
    currentPage = 3
    const createdOn = globalUserData.userData.createdOn.seconds + "000";
    const time = getTimeDiff(parseInt(createdOn), Date.now(), true);
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

function appOpenStreak() {
    currentPage = 4
    const appStreaks = globalUserData.metaData.appOpenStreak;
    let title;
    let subtitle;
    if (appStreaks <= 4) {
        title = "Enjoy missing out on all the fun? You've opened the app only";
        subtitle = "Don't worry, we'll know you'll love it here!";
    } else if (appStreaks <= 10 && appStreaks > 4) {
        title = "It's a good thing you like us, because you've visited us";
        subtitle = "We're glad you chose us"
    } else {
        title = "You've always kept the conversation going. We've seen you";
        subtitle = "And we just can't get enough of you!";
    }
    document.getElementById("app-open-title").innerText = title;
    document.getElementById("app-open-subtitle").innerText = subtitle;
    console.log(appStreaks);
    countUpTo(appStreaks, 'app-streaks');
}

async function faveNotification() {
    currentPage = 5
    let notifs;
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
    if (globalUserData.metaData.notifOpens === undefined) {
        notifs = {
            "local": 0,
            "city": 0,
            "comment": 0,
        }
    } else {
        notifs = globalUserData.metaData.notifOpens;
    }
    console.log(notifs);
    let topNotifCount = []
    let topNotifNames = []
    for (const notif in notifs) {
        topNotifCount.push(notifs[notif])
        topNotifNames.push(notif)
    }
    const maxNotifName = topNotifNames[topNotifCount.indexOf(topNotifCount.max())];
    const maxNotif = topNotifCount.max();
    topNotifNames.splice(topNotifNames.indexOf(maxNotifName), 1)
    topNotifCount.splice(topNotifCount.indexOf(maxNotif), 1)
    document.getElementById("fave-notif").innerText = maxNotifName.toUpperCase();
    countUpTo(maxNotif, 'fave-notif-count');
}

async function localAskerAnnouncer() {
    currentPage = 6
    const localQuestionQuery = query(collection(db, "local"), where("author.uid", "==", globalUserData.userData.uid), where("type", "==", "question"));
    const localAnnouncementQuery = query(collection(db, "local"), where("author.uid", "==", globalUserData.userData.uid), where("type", "==", "announcement"));

    const localQuestionsDocs = await getDocs(localQuestionQuery)
    const localAnnouncementsDocs = await getDocs(localAnnouncementQuery)

    totalLocalQuestions = localQuestionsDocs.size
    totalLocalAnnouncements = localAnnouncementsDocs.size

    let localPersonality
    let localSubtitlePre
    let localSubtitlePost
    let localSubtitle

    if (totalLocalAnnouncements > totalLocalQuestions) {
        // announcements are more than questions, hence the user is an announcer
        localPersonality = "Avid Announcer"
        localSubtitlePre = "You have made"
        localSubtitlePost = "Announcements"
        countUpTo(totalLocalAnnouncements, "local-count");
        if (totalLocalAnnouncements > 10) {
            // too many announcements
            localSubtitle = "You've made so many announcements, we're starting to wonder if there is anything which can be hidden from you in your locality. 🤯"
        } else if (totalLocalAnnouncements > 2 && totalLocalAnnouncements <= 10) {
            // some announcements
            localSubtitle = "If you're already here, why not start a conversation with the people around you? It's Fun!"
        } else {
            // only one or zero announcement
            localSubtitle = "You've been lurking in the shadows, now step into the spotlight and Start connecting with more people on LocalEyes!"
        }
    } else {
        localPersonality = "Avid Asker"
        localSubtitlePre = "You have asked"
        localSubtitlePost = "Questions"
        countUpTo(totalLocalQuestions, "local-count");
        if (totalLocalQuestions > 10) {
            // too many Questions
            localSubtitle = "You've made so many Questions, we're starting to wonder if there is anything which can be hidden from you in your locality. 🤯"
        } else if (totalLocalQuestions > 2 && totalLocalQuestions <= 10) {
            // some Questions
            localSubtitle = "If you're already here, why not start a conversation with the people around you? It's Fun!"
        } else {
            // only one or zero Question
            localSubtitle = "You've been lurking in the shadows, now step into the spotlight and Start connecting with more people on LocalEyes!"
        }
    }

    document.getElementById("local-personality").innerText = localPersonality
    document.getElementById("local-subtitle-pre").innerText = localSubtitlePre
    document.getElementById("local-subtitle-post").innerText = localSubtitlePost
    document.getElementById("local-subtitle").innerText = localSubtitle

    console.log("Local Questions: ", totalLocalQuestions);
    console.log("Local Announcements: ", totalLocalAnnouncements);
}

async function cityAskerAnnouncer() {
    currentPage = 7
    const cityQuestionQuery = query(collection(db, "city"), where("author.uid", "==", globalUserData.userData.uid), where("type", "==", "question"));
    const cityAnnouncementQuery = query(collection(db, "city"), where("author.uid", "==", globalUserData.userData.uid), where("type", "==", "announcement"));

    const cityQuestionsDocs = await getDocs(cityQuestionQuery)
    const cityAnnouncementsDocs = await getDocs(cityAnnouncementQuery)

    if (!cityAnnouncementQuery.empty && !cityQuestionQuery.empty) {
        totalCityQuestions = cityQuestionsDocs.size
        totalCityAnnouncements = cityAnnouncementsDocs.size
    } else {
        totalCityQuestions = 0
        totalCityAnnouncements = 0
    }

    document.getElementById("city-personality").innerText = totalCityAnnouncements > totalCityQuestions ? "Avid Announcer" : "Avid Asker"
    document.getElementById("city-subtitle-pre").innerText = totalCityAnnouncements > totalCityQuestions ? "You have made" : "You have asked"
    totalCityAnnouncements > totalCityQuestions ? countUpTo(totalCityAnnouncements, "city-count") : countUpTo(totalCityQuestions, "city-count")
    document.getElementById("city-subtitle-post").innerText = totalCityAnnouncements > totalCityQuestions ? " Announcements" : " Questions"

    console.log("City Questions: ", totalCityQuestions);
    console.log("City Announcements: ", totalCityAnnouncements);
}

async function answersGiven() {
    currentPage = 8
    const answerQuery = query(collection(db, "comments"), where("author.uid", "==", globalUserData.userData.uid))
    const answerDocs = await getDocs(answerQuery)

    if (!answerQuery.empty) {
        totalAnswers = answerDocs.size;
    } else {
        totalAnswers = 0
    }
    countUpTo(totalAnswers, "answers");
}

async function mostActiveWeek() {
    currentPage = 9;
    let weeks;
    const weekFullNames = {
        "jan": "Jan",
        "feb": "Feb",
        "mar": "Mar",
        "apr": "Apr",
        "may": "May",
        "jun": "Jun",
        "jul": "Jul",
        "aug": "Aug",
        "sep": "Sep",
        "oct": "Oct",
        "nov": "Nov",
        "dec": "Dec",
    }
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
    if (globalUserData.metaData.weeklyActivity === undefined) {
        globalUserData.metaData.weeklyActivity = {
            "2022dec25jan1": {
                "answers": 0,
                "local": {
                    "announcements": 0,
                    "questions": 0
                },
                "city": {
                    "announcements": 0,
                    "questions": 0
                }
            }
        }
    }
    weeks = Object.keys(globalUserData.metaData.weeklyActivity)
    const answerMultiplier = 5
    const localMultiplier = 2
    const cityMultiplier = 1
    let weeklyScore = [];
    for (let week of weeks) {
        let keys = Object.keys(globalUserData.metaData.weeklyActivity[week])
        let answerScore = 0;
        let localScore = 0;
        let cityScore = 0;
        for (let key of keys) {
            if (key === 'answers') {
                answerScore += globalUserData.metaData.weeklyActivity[week].answers * answerMultiplier
            } else if (key === 'local') {
                let localSum = Object.values(globalUserData.metaData.weeklyActivity[week].local).reduce((a, b) => a + b, 0)
                localScore += localSum * localMultiplier
            } else if (key === 'city') {
                let citySum = Object.values(globalUserData.metaData.weeklyActivity[week].city).reduce((a, b) => a + b, 0)
                cityScore += citySum * cityMultiplier
            }
        }
        weeklyScore.push(answerScore + localScore + cityScore);
    }
    const mostActiveWeek = weeks[weeklyScore.indexOf(weeklyScore.max())]
    const fromWeek = weekFullNames[mostActiveWeek.match(/[a-zA-Z]+/g)[0]]
    const toWeek = weekFullNames[mostActiveWeek.match(/[a-zA-Z]+/g)[1]]
    const fromDate = mostActiveWeek.match(/[0-9]+/g)[1]
    const toDate = mostActiveWeek.match(/[0-9]+/g)[2]
    document.getElementById("active-week").innerHTML = `${fromDate} ${fromWeek}<br>to<br>${toDate} ${toWeek}`;
    const topWeek = globalUserData.metaData.weeklyActivity[mostActiveWeek]
    for (let key of Object.keys(topWeek)) {
        if (key === 'answers') {
            document.getElementById(`activity-answers`).innerText = `You gave ${topWeek[key]} answers,`
        } else {
            let total = Object.values(topWeek[key]).reduce((a, b) => a + b, 0)
            document.getElementById(`activity-${key}`).innerText = `made ${total} ${key} posts`
        }
    }
}

function referrals() {
    currentPage = 10;
    document.getElementById('referral-count').innerText = globalUserData.referralData.referrents.length;
}

async function profileScore() {
    currentPage = 11;
    const profilePicture = document.getElementById('profile-picture');
    profilePicture.src = globalUserData.userData.imageURL;
    profilePicture.style.borderRadius = "50%";
    profilePicture.style.border = "5px solid #62c9d5";
    document.getElementById('name').innerText = globalUserData.userData.fullname;
    let daysSinceUser = (Date.now() - globalUserData.userData.createdOn.seconds * 1000) / 1000 / 60 / 60 / 24;
    let appOpenStreak = globalUserData.metaData.appOpenStreak;
    countUpTo(appOpenStreak, "streaks");
    let answersGiven = totalAnswers;
    countUpTo(answersGiven, "answers-score");
    let totalLocalPosts = totalLocalAnnouncements + totalLocalQuestions;
    countUpTo((totalLocalQuestions + totalCityQuestions), "questions");
    let totalCityPosts = totalCityAnnouncements + totalCityQuestions;
    countUpTo((totalLocalAnnouncements + totalCityAnnouncements), "announcements");
    let referredUsers = globalUserData.referralData.referrents.length;
    // calculate total notification taps from notifOpens
    let totalNotifTaps = 0;
    for (let key of Object.keys(globalUserData.metaData.notifOpens)) {
        totalNotifTaps += globalUserData.metaData.notifOpens[key];
    }

    let totalScore = appOpenStreak * 2 + answersGiven * 1.5 + totalLocalPosts * 1 + totalCityPosts * 1 + referredUsers * 1.5 + totalNotifTaps * 0.7 + daysSinceUser * 0.01;
    totalScore = Math.round(totalScore);
    let profileTag;
    if (totalScore < 100) {
        profileTag = "Explorer-to-be"
    } else if (totalScore >= 100 && totalScore < 200) {
        profileTag = "Expert"
    } else if (totalScore >= 200 && totalScore < 600) {
        profileTag = "Master"
    } else if (totalScore >= 600 && totalScore < 1000) {
        profileTag = "Legend"
    } else if (totalScore >= 1000) {
        profileTag = "God"
    }
    document.getElementById('profile-tag').innerText = profileTag;

    let personality1Short = totalLocalPosts > totalCityPosts ? "L" : "C";
    let personality1Long = totalLocalPosts > totalCityPosts ? "ocal Legend" : "ity Champion";
    let personality2Short = answersGiven > 50 ? "H" : "C";
    let personality2Long = answersGiven > 50 ? "elpful" : "urious";
    // let personality 3 be "veteran" if the user has been using the app for more than 6 months
    let personality3Short;
    let personality3Long;
    if (daysSinceUser >= 180) {
        personality3Short = "V";
        personality3Long = "eteran";
    } else if (daysSinceUser < 180 && daysSinceUser >= 90) {
        personality3Short = "M";
        personality3Long = "aster";
    } else if (daysSinceUser < 90 && daysSinceUser >= 30) {
        personality3Short = "F";
        personality3Long = "reshman";
    } else {
        personality3Short = "R";
        personality3Long = "ookie";
    }

    let personality4Short;
    let personality4Long;
    if (appOpenStreak > 40) {
        personality4Short = "F";
        personality4Long = "amiliar Face";
    } else if (appOpenStreak < 40 && appOpenStreak >= 20) {
        personality4Short = "C";
        personality4Long = "ontinuous Companion";
    } else if (appOpenStreak < 20 && appOpenStreak >= 5) {
        personality4Short = "T";
        personality4Long = "ypical Tourist";
    } else {
        personality4Short = "R";
        personality4Long = "are Rambler";
    }
    document.getElementById("profile-short").innerText = `${personality1Short} • ${personality2Short} • ${personality3Short} • ${personality4Short}`;
    document.getElementById("profile-long").innerHTML = `<span class='bold'>${personality1Short}</span>${personality1Long} • <span class='bold'>${personality2Short}</span>${personality2Long} • <span class='bold'>${personality3Short}</span>${personality3Long} • <span class='bold'>${personality4Short}</span>${personality4Long}`;
    // add everything to user Meta Data in firestore
    await updateDoc(doc(db, "userMetaData", globalUserData.userData.uid), {
        "flashBack.hasSeen": true,
        "flashBack.totalScore": totalScore,
        "flashBack.profileTag": profileTag,
        "flashBack.personalityShort": personality1Short + personality2Short + personality3Short + personality4Short,
        "flashBack.personalityLong": [`${personality1Short}${personality1Long}`, `${personality2Short}${personality2Long}`, `${personality3Short}${personality3Long}`, `${personality4Short}${personality4Long}`]
    });
    // scale the score to 3 digits if it is more than 3 digits
    if (totalScore > 999) {
        totalScore = (totalScore / 1000).toFixed(1) + "K+";
    }
    document.getElementById('profile-score').innerText = totalScore;
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

window.loadPage = loadPage;
window.goToNextPage = goToNextPage;
window.goToPrevPage = goToPrevPage;