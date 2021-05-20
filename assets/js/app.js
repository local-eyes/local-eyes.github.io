document.addEventListener("DOMContentLoaded", async() => {
    var placeholder = document.getElementById("rotation");
    // console.log(word.innerText);
    var wordsArray = ["Places", "Shops", "Parks", "Malls"]

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    console.log("before sleep");
    let i = 0
    while (i < 4) {
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
        await sleep(2000);
        if (i == 4) {
            i = 0;
        }
    }
    console.log("after 2 sec");
})