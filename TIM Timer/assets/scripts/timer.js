const isNumber = /^[0-9]+$/
const isMinutes = /^[0-9]+m$/

// localStorage variables:
var preset1 = 0
var preset2 = 0
var preset3 = 0
var preset4 = 0
var preset5 = 0
var selectedSound = "bell"
var soundEnabled = false

// timer control variables:
let startingTime
let goalTime
let deltaTime
let remainingTime
let displayTextTime
let timerRunning
let timerMode
let alarmSound

const setupTimer = () => {
	if (localStorage.getItem("preset1") != null) {
		preset1 = localStorage.getItem("preset1")
	}
	if (localStorage.getItem("preset2") != null) {
		preset2 = localStorage.getItem("preset2")
	}
	if (localStorage.getItem("preset3") != null) {
		preset3 = localStorage.getItem("preset3")
	}
	if (localStorage.getItem("preset4") != null) {
		preset4 = localStorage.getItem("preset4")
	}
	if (localStorage.getItem("preset5") != null) {
		preset5 = localStorage.getItem("preset5")
	}
	if (localStorage.getItem("selectedSound") != null) {
		selectedSound = localStorage.getItem("selectedSound")
	}
	if (localStorage.getItem("soundEnabled") != null) {
		soundEnabled = localStorage.getItem("soundEnabled")
	}

	setTimePreset(1, preset1)
	setTimePreset(2, preset2)
	setTimePreset(3, preset3)
	setTimePreset(4, preset4)
	setTimePreset(5, preset5)

	var selectedSoundSelect = document.getElementById("selectedSound")
	selectedSoundSelect.value = selectedSound

	var soundEnabledButton = document.getElementById("soundEnabled")
	soundEnabledButton.innerHTML = "Sound: " + (soundEnabled == "true" ? "ON" : "OFF")
}

const playAudio = () => {
	try {
		alarmSound.pause()
	} catch (error) {
		console.log(error)
	} finally {
		var selectedSoundSelect = document.getElementById("selectedSound")
		alarmSound = new Audio(`./assets/audio/${selectedSoundSelect.value}.mp3`);
		alarmSound.volume = 0.5;
		alarmSound.play()
	}
}

const soundEnabledClick = target => {
	var soundEnabledButton = document.getElementById("soundEnabled")
	if (soundEnabledButton.innerHTML == "Sound: OFF") {
		soundEnabledButton.innerHTML = "Sound: ON"
		localStorage.setItem("soundEnabled", true);
	} else {
		soundEnabledButton.innerHTML = "Sound: OFF"
		localStorage.setItem("soundEnabled", false);
	}
}

const selectedSoundChange = target => {
	var selectedSoundSelect = document.getElementById("selectedSound")
	localStorage.setItem("selectedSound", selectedSoundSelect.value)
}

const presetClick = target => {
	if (target.innerHTML == "Set Time") {
		var useAsMinutes = false;
		var preset = target.id
		var amount = prompt("Enter the duration you want to set this button to:")
		if (isMinutes.test(amount.trim().toLowerCase())) {
			useAsMinutes = true;
			amount = amount.toLowerCase().replace("m", "");
		}
		var parsedAmount = parseInt(amount)
		if (isNaN(parsedAmount) || !isNumber.test(amount.trim())) {
			alert("Entered amount is invalid.")
			return
		}
		if (useAsMinutes) parsedAmount = parsedAmount * 60;
		if (parsedAmount <= 0 || parsedAmount > 5999) {
			alert("Duration can't be lower than 1 second or higher than 5999 seconds.")
			return
		}
		setTimePreset(preset.replace("preset", ""), parsedAmount)
	} else {
		var timeString = target.innerHTML
		var minutes = parseInt(timeString.split(":")[0])
		var seconds = parseInt(timeString.split(":")[1])
		var totalSeconds = (minutes*60)+seconds
		console.log(`Starting ${target.id}, timer set to ${totalSeconds} second(s).`)
		resetTimer()
		document.getElementById("timerColor").className = "text-[#00ff00]"
		timerMode = 1
		timerRunning = true
		goalTime = totalSeconds * 1000
		document.getElementById("stopwatch").innerHTML = "Stop"
	}
}

const manualTimer = () => {
	var useAsMinutes = false;
	var amount = prompt("Enter the duration you want to set this button to:")
	if (isMinutes.test(amount.trim().toLowerCase())) {
		useAsMinutes = true;
		amount = amount.toLowerCase().replace("m", "");
	}
	var parsedAmount = parseInt(amount)
	if (isNaN(parsedAmount) || !isNumber.test(amount.trim())) {
		alert("Entered amount is invalid.")
		return
	}
	if (useAsMinutes) parsedAmount = parsedAmount * 60;
	if (parsedAmount <= 0 || parsedAmount > 5999) {
		alert("Duration can't be lower than 1 second or higher than 5999 seconds.")
		return
	}
	console.log(`Starting manually, timer set to ${parsedAmount} second(s).`)
	resetTimer()
	document.getElementById("timerColor").className = "text-[#00ff00]"
	timerMode = 1
	timerRunning = true
	goalTime = parsedAmount * 1000
	document.getElementById("stopwatch").innerHTML = "Stop"
}

const presetClear = target => {
	if (target.innerHTML == "Set Time") return false
	var response = confirm(`Press OK to clear this preset (${target.innerHTML}).`)
	if (response) setTimePreset(target.id.replace("preset", ""), 0)
	return false
}

const setTimePreset = (slot, time) => {
	localStorage.setItem("preset" + slot, time)
	console.log(`Preset ${slot} has been set to ${time} second(s).`)
	var timePresetButton = document.getElementById("preset" + slot)
	if (time == 0) timePresetButton.innerHTML = "Set Time"
	else {
		var minutes = Math.floor(time / 60)
		var seconds = time - minutes * 60
		timePresetButton.innerHTML = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0")
	}
}

setInterval(function() {
	// Test Button
	let testButton = document.getElementById("test");
	let soundButton = document.getElementById("soundEnabled");
	testButton.disabled = timerRunning || soundButton.innerHTML == "Sound: OFF"

	if (timerRunning) {
		const currentTime = Date.now()
		deltaTime = currentTime - startingTime

		// Stopwatch
		if (timerMode == 0) {
			setDisplayTimeText(deltaTime)
			if (deltaTime >= goalTime) {
				resetTimer()
			}
		}

		// Timer (countdown)
		if (timerMode == 1) {
			remainingTime = goalTime - deltaTime
			setDisplayTimeText(remainingTime)
			if (deltaTime >= goalTime) {
				resetTimer()
				playAudio()
			}
		}
	}


}, 45)

const resetTimer = () => {
	timerRunning = false
	timerMode = 0
	startingTime = Date.now()
	deltaTime = 0
	goalTime = 0
	remainingTime = 0
	document.getElementById("stopwatch").innerHTML = "Start";
	document.getElementById("timerColor").className = "text-[#ff0000]"
	setDisplayTimeText(0)
}

const millisecondsToDisplayText = milliseconds => {
	const seconds = Math.floor((milliseconds / 1000) % 60)
	const minutes = Math.floor((milliseconds / 1000 / 60))
	milliseconds = milliseconds - (seconds * 1000) - (minutes * 1000 * 60)
	const formattedTime = `${(minutes + "").padStart(2,'0')}:${(seconds + "").padStart(2,'0')}.${(milliseconds + "").padStart(3,'0')}`
	return formattedTime
}

const setDisplayTimeText = milliseconds => {
	displayTimeText = (millisecondsToDisplayText(milliseconds))
	document.getElementById("time").innerHTML = displayTimeText
}

const stopwatch = target => {
	if (target.innerHTML == "Start") {
		resetTimer()
		document.getElementById("timerColor").className = "text-[#0096ff]"
		timerMode = 0
		timerRunning = true
		// 99:99.999, fail-safe... just in case.
		goalTime = 6039999
		document.getElementById("stopwatch").innerHTML = "Stop"
	} else {
		resetTimer()
	}
}