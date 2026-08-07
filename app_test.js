alert("app.js loaded");

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://cevpdsrjsqavrrtlpyoa.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnBkc3Jqc3FhdnJydGxweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE3NTUsImV4cCI6MjEwMTcwNzc1NX0.nl5HKXm2AOcQYFDSQARmcRVXvCRe9cf32OEj3P5Jk6w";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let workbook = null;
let currentGame = null;

// =====================================================
// LOAD EXCEL WORKBOOK
// =====================================================

async function loadWorkbook() {

    try {

        const response =
            await fetch("locations.xlsx");

        const arrayBuffer =
            await response.arrayBuffer();

        workbook =
            XLSX.read(arrayBuffer, {
                type: "array"
            });

        console.log(
            "Workbook loaded:",
            workbook.SheetNames
        );

    } catch (err) {

        console.error(
            "Failed to load workbook",
            err
        );
    }
}

loadWorkbook();

// =====================================================
// GENERATE GAME CODE
// =====================================================

function generateCode(length = 6) {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (let i = 0; i < length; i++) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];
    }

    return result;
}

// =====================================================
// SHUFFLE ARRAY
// =====================================================

function shuffle(array) {

    const arr = [...array];

    for (
        let i = arr.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [arr[i], arr[j]] =
            [arr[j], arr[i]];
    }

    return arr;
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
}

// ======================================
// Assign Spy And Roles
// ======================================

function assignRoles() {

    const shuffledRoles =
        shuffle([...roles]);

    const spyIndex =
        Math.floor(
            Math.random() * players.length
        );

    let roleIndex = 0;

    players.forEach((player, index) => {

        if (index === spyIndex) {

            player.assignment =
                "You are the Spy";

        } else {

            player.assignment =
                shuffledRoles[roleIndex];

            roleIndex++;
        }
    });

    showAssignments();
}

// ======================================
// Demo Results Screen
// ======================================

function showAssignments() {

    console.clear();

    console.log("Assignments");

    players.forEach(player => {

        console.log(
            player.name +
            " -> " +
            player.assignment
        );
    });

    const name = prompt(
        "Enter your player name to view your role:"
    );

    const player =
        players.find(
            p =>
                p.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (!player) {

        alert("Player not found.");

        return;
    }

    document.getElementById(
        "hostPanel"
    ).style.display = "none";

    document.getElementById(
        "roleScreen"
    ).style.display = "block";

    const roleResult =
        document.getElementById(
            "roleResult"
        );

    if (
        player.assignment ===
        "You are the Spy"
    ) {

        roleResult.innerHTML =
            '<div class="spy">YOU ARE THE SPY</div>';

    } else {

        roleResult.innerHTML =
            `<div class="role">${player.assignment}</div>`;
    }
}
   
