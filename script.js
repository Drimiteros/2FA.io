// Prevent user from accessing dev tools
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
    }
});

// Save ID to IndexedDB
function saveIDToIndexedDB(ID) {
    const request = indexedDB.open("IDDatabase", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("IDs")) {
            db.createObjectStore("IDs", { keyPath: "id" });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(["IDs"], "readwrite");
        const objectStore = transaction.objectStore("IDs");
        const requestUpdate = objectStore.put({ id: "verificationID", value: ID });
        requestUpdate.onerror = function(event) {
            console.log("Error updating ID in IndexedDB");
        };
        requestUpdate.onsuccess = function(event) {
            console.log("ID successfully updated in IndexedDB");
        };
    };

    request.onerror = function(event) {
        console.log("Error opening IndexedDB");
    };
}

// Retrieve ID from IndexedDB
function getIDFromIndexedDB(callback) {
    const request = indexedDB.open("IDDatabase", 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(["IDs"], "readonly");
        const objectStore = transaction.objectStore("IDs");
        const requestGet = objectStore.get("verificationID");

        requestGet.onerror = function(event) {
            console.log("Error retrieving ID from IndexedDB");
        };

        requestGet.onsuccess = function(event) {
            if (requestGet.result) {
                const ID = requestGet.result.value;
                document.getElementById('idInfo').innerText = `Your ID: ${ID}`; // Display existing ID
                if (callback) callback(true, ID);
            } else {
                console.log("No ID found in IndexedDB");
                document.getElementById('idInfo').innerText = "No ID found."; // Display if no ID found
                if (callback) callback(false, null);
            }
        };
    };

    request.onerror = function(event) {
        console.log("Error opening IndexedDB");
        if (callback) callback(false, null);
    };
}

// Check if ID exists and generate if not
function checkAndGenerateID(ID, callback) {
    console.log(`Checking and generating ID with initial ID: ${ID}`);
    getIDFromIndexedDB(function(IDExists, existingID) {
        if (!IDExists) {
            saveIDToIndexedDB(ID);
            document.getElementById('idInfo').innerText = `Your ID: ${ID}`; // Display newly generated ID
        } else {
            document.getElementById('idInfo').innerText = `Your ID: ${existingID}`;
        }
        if (callback) callback();
    });
}

// GENERATE A UNIQUE KEY
function getBrowserAndOS(callback) {
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

    document.getElementById('browserInfo').innerText = `Browser: ${browserName}`;
    document.getElementById('osInfo').innerText = `Operating System: ${osName}`;

    // Check if ID exists and generate if not
    checkAndGenerateID(ID, callback);
}

// If "Get key" button is pressed, trigger the generate string function
document.getElementById('generateButton').addEventListener('click', function() {
    const pass = document.getElementById('nameInput').value;
    const encrypted = encryptMessage(pass);
    getBrowserAndOS(); // Pass a callback function if needed
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