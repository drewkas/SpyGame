// ======================================
// Game Data
// ======================================

let players = [];

// Example worksheet roles
let roles = [
    "Pilot",
    "Flight Attendant",
    "Gate Agent",
    "Security Officer",
    "Baggage Handler",
    "Air Traffic Controller",
    "Mechanic",
    "Customs Agent"
];

let gameCode = "";

// ======================================
// Generate Random Game Code
// ======================================

function generateCode(length = 6) {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < length; i++) {

        code += chars[
            Math.floor(Math.random() * chars.length)
        ];
    }

    return code;
}

// ======================================
// Shuffle Array
// ======================================

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}

// ======================================
// Create Game
// ======================================

document
    .getElementById("createGameBtn")
    .addEventListener("click", () => {

        gameCode = generateCode();

        document.getElementById(
            "displayCode"
        ).textContent = gameCode;

        document.getElementById(
            "home"
        ).style.display = "none";

        document.getElementById(
            "hostPanel"
        ).style.display = "block";
    });

// ======================================
// Join Game
// ======================================

document
    .getElementById("joinGameBtn")
    .addEventListener("click", () => {

        const playerName =
            document.getElementById(
                "playerName"
            ).value.trim();

        if (playerName === "") {
            alert("Enter a player name.");
            return;
        }

        const player = {
            id: Date.now(),
            name: playerName
        };

        players.push(player);

        updatePlayerList();

        alert(
            playerName +
            " joined the game."
        );

        document.getElementById(
            "playerName"
        ).value = "";
    });

// ======================================
// Update Waiting Room
// ======================================

function updatePlayerList() {

    const list =
        document.getElementById(
            "playerList"
        );

    list.innerHTML = "";

    players.forEach(player => {

        const li =
            document.createElement("li");

        li.textContent =
            player.name;

        list.appendChild(li);
    });
}

// ======================================
// Start Game
// ======================================

document
    .getElementById("startGameBtn")
    .addEventListener("click", startGame);

function startGame() {

    if (players.length < 3) {

        alert(
            "Need at least 3 players."
        );

        return;
    }

    if (roles.length < players.length - 1) {

        alert(
            "Not enough roles."
        );

        return;
    }

    assignRoles();
