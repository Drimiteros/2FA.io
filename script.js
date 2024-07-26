// Prevent user from accessing dev tools
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
    }
});

// If "Get key" button is pressed, trigger the generate string function
document.getElementById('generateButton').addEventListener('click', function() {
    const pass = document.getElementById('nameInput').value;
    const encrypted = encryptMessage(pass);
    generateString(encrypted);
    // Call the countdown function
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
    const progressBar2 = document.getElementById('progressBarContainer');
    const progressWidth = (currentSecond / 60) * 100; // Calculate width percentage
    progressBar.style.width = `${progressWidth}%`;
    progressBarContainer.style.width = `${100}%`;
    
    if (remainingTime <= 1) {
        document.getElementById('valid').innerText = "Your number is no longer valid\nclick \"Get key\" to retry";
        clearInterval(window.countdownInterval);
    } else {
        document.getElementById('valid').innerText = `The key will be valid for ${remainingTime} seconds`;
    }
}
