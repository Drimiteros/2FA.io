// Prevent user from accessing dev tools
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', function(){
    var id = generateID();
    document.getElementById('id').innerText = `"${id}"`;
});

// GENERATE A UNIQUE ID
function generateID() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown Browser";
    let ID = 0;

    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Mozilla Firefox";
        ID = 1;
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browserName = "Samsung Internet";
        ID = 2;
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browserName = "Opera";
        ID = 3;
    } else if (userAgent.indexOf("Trident") > -1) {
        browserName = "Microsoft Internet Explorer";
        ID = 4;
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Microsoft Edge";
        ID = 5;
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Google Chrome";
        ID = 6;
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Apple Safari";
        ID = 7;
    }

    let osName = "Unknown OS";
    if (userAgent.indexOf("Win") > -1) {
        osName = "Windows";
        ID += 1;
    } else if (userAgent.indexOf("Mac") > -1) {
        osName = "MacOS";
        ID += 2;
    } else if (userAgent.indexOf("X11") > -1) {
        osName = "UNIX";
        ID += 3;
    } else if (userAgent.indexOf("Linux") > -1) {
        osName = "Linux";
        ID += 4;
    } else if (userAgent.indexOf("Android") > -1) {
        osName = "Android";
        ID += 5;
    } else if (userAgent.indexOf("like Mac") > -1) {
        osName = "iOS";
        ID += 6;
    }

    const language = navigator.language;
    const platform = navigator.platform;
    

    ID = ID * (window.screen.width / window.screen.height);
    ID = ID ^ 15605;
    let newID = Math.abs(ID % 100000);
    return ID;
}

// If "Get key" button is pressed, trigger the generate string function
document.getElementById('generateButton').addEventListener('click', function() {
    const pass = document.getElementById('nameInput').value;
    const encrypted = encryptMessage(pass);
    generateString(encrypted);
    startCountdown();
});

function encryptMessage(pass) {
    const FIXED_IV = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
    const message = pass;
    const key = CryptoJS.enc.Utf8.parse(pass); // Use pass as the key
    const encrypted = CryptoJS.AES.encrypt(message, key, { iv: FIXED_IV }).toString();
    return encrypted;
}

// Generate string
function generateString(encrypted) {
    let sum = 0;
    for (let i = 0; i < encrypted.length; i++) {
        sum += encrypted.charCodeAt(i) * (i + 1);
    }
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    // Introduce more variability by combining the current hour and minute in a more complex way
    const timeFactor = (currentHour + 1) * (currentMinute + 1) * 137; // Example multiplier to add complexity
    sum = (sum * timeFactor) ^ (currentHour * currentMinute); // Use XOR to further mix the bits
    let number = Math.abs(sum % 100000);
    document.getElementById('result').innerText = `Your verification key: ${number}`;
}

// Start countdown
function startCountdown() {
    clearInterval(window.countdownInterval);
    getValidTime();
    window.countdownInterval = setInterval(getValidTime, 1000);
}

// Update the time remaining and progress bar
function getValidTime() {
    const currentDate = new Date();
    const currentSecond = currentDate.getSeconds();
    const remainingTime = 60 - currentSecond;

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressWidth = ((currentSecond + 1) / 60) * 100; // Calculate width percentage
    progressBar.style.width = `${progressWidth}%`;
    progressBarContainer.style.width = `${100}%`;

    if (remainingTime <= 1) {
        document.getElementById('valid').innerText = "Your number is no longer valid\nclick \"Get key\" to retry";
        clearInterval(window.countdownInterval);
    } else {
        document.getElementById('valid').innerText = `The key will be valid for ${remainingTime} seconds`;
    }
}