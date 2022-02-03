var currentColor = "white";

function changeColor(buttonId) {
    currentColor = buttonId;
    document.getElementById("mainBody").style.backgroundColor = currentColor;
}