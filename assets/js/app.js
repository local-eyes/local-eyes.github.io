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
})

var genz = document.getElementById("list-home-list");
var millenial = document.getElementById("list-profile-list");
var boomer = document.getElementById("list-messages-list");
var id_list = [genz, millenial, boomer];
var active_btn = 0;

var animator = setInterval(async() => {
    // console.log(active_btn);
    id_list[active_btn + 1].click();
    active_btn++;
    if (active_btn >= 2) {
        active_btn = -1;
    }
}, 3500);

function stopAnimation() {
    window.clearInterval(animator);
}