document.addEventListener("DOMContentLoaded", async() => {
    var placeholder = document.getElementById("rotation");
    // console.log(word.innerText);
    var wordsArray = ["Places", "Shops", "Parks", "Malls", "People"]

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    console.log("Hello. So How's it going? Make sure to sign up for early access if you're this interested in knowing how we work");
    let i = 0
    while (i < 5) {
        finalword = ""
        for (let j = 0; j <= wordsArray[i].length - 1; j++) {
            finalword += wordsArray[i][j];
            // console.log(finalword);
            placeholder.innerText = finalword;
            await sleep(100)
        }
        // placeholder.innerText = wordsArray[i];
        // console.log(i);
        i++
        await sleep(2500);
        if (i == 5) {
            i = 0;
        }
    }
    console.log("after 2 sec");

    var home = document.getElementById("list-home");
    var profile = document.getElementById("list-profile");
    var msg = document.getElementById("list-messages");
    // await sleep(2500);
    home.classList.remove("active");
    profile.classList.add("active");
    await sleep(2500);
    profile.classList.remove("active");
    msg.classList.add("active");
})