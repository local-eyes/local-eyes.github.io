import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getDatabase, ref, set, update, get, child, connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyD2Q53YOsXBQBEqgqoayCReYYXhemTVCUI",
    authDomain: "localeyes-95d0d.firebaseapp.com",
    projectId: "localeyes-95d0d",
    appId: "1:847201898317:web:7a72d72afb4d81bcd53104",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// connectDatabaseEmulator(db, "localhost", 9000);

document.addEventListener("DOMContentLoaded", () => {
    // if query parameter 'source' is set, increase the counter for that source
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");
    if (source) {
        const sourceRef = ref(db, `downloads/${source}`);
        get(child(sourceRef, "count")).then((snapshot) => {
            if (snapshot.exists()) {
                update(sourceRef, {
                    count: snapshot.val() + 1,
                });
                console.log("updated");
            } else {
                set(sourceRef, {
                    count: 1,
                });
            }
        });
    } else {
        const sourceRef = ref(db, `downloads/qr`);
        get(child(sourceRef, "count")).then((snapshot) => {
            if (snapshot.exists()) {
                update(sourceRef, {
                    count: snapshot.val() + 1,
                });
                console.log("updated");
            } else {
                set(sourceRef, {
                    count: 1,
                });
            }
        });
    }
    // redirect to playstore
    window.location.href = "https://play.google.com/store/apps/details?id=tech.dagurmittal.app";
});