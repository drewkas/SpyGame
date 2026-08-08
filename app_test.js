alert("app.js loaded");

console.log("window.supabase =", window.supabase);

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://cevpdsrjsqavrrtlpyoa.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnBkc3Jqc3FhdnJydGxweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE3NTUsImV4cCI6MjEwMTcwNzc1NX0.nl5HKXm2AOcQYFDSQARmcRVXvCRe9cf32OEj3P5Jk6w";

console.log(window.supabase);

try {

    const supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log("Supabase client created");

} catch (err) {

    console.error(err);

}

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

function generateCode(length = 4) {

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

console.log("Looking for Create Game button");

const button = document.getElementById("createGameBtn");

console.log(button);

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
    .addEventListener("click", joinGame);

async function joinGame() {

    const code =
        document
            .getElementById("gameCode")
            .value
            .trim()
            .toUpperCase();

    const playerName =
        document
            .getElementById("playerName")
            .value
            .trim();

    if (!code || !playerName) {

        alert(
            "Please enter both a game code and player name."
        );

        return;
    }

    // Find the game

    const {
        data: game,
        error: gameError
    } = await supabase
        .from("games")
        .select("*")
        .eq("game_code", code)
        .single();

    if (gameError || !game) {

        alert("Game not found.");

        console.error(gameError);

        return;
    }

    // Add the player

    const {
        data: player,
        error: playerError
    } = await supabase
        .from("players")
        .insert({
            game_id: game.id,
            player_name: playerName
        })
        .select()
        .single();

    if (playerError) {

        alert("Unable to join game.");

        console.error(playerError);

        return;
    }

    // Remember this player

    localStorage.setItem(
        "gameId",
        game.id
    );

    localStorage.setItem(
        "playerId",
        player.id
    );

    localStorage.setItem(
        "playerName",
        playerName
    );

    alert(
        playerName + " joined the game."
    );

    // Show waiting room

    document.getElementById(
        "home"
    ).style.display = "none";

    document.getElementById(
        "waitingRoom"
    ).style.display = "block";
}


// ======================================
// Update Waiting Room
// ======================================

async function updatePlayerList() {

    const { data: players } =
        await supabase
            .from("players")
            .select("*")
            .eq("game_id", currentGame.id);

    const list =
        document.getElementById(
            "playerList"
        );

    list.innerHTML = "";

    players.forEach(player => {

        const li =
            document.createElement("li");

        li.textContent =
            player.player_name;

        list.appendChild(li);
    });
}

// ======================================
// Start Game
// ======================================

document
    .getElementById("startGameBtn")
    .addEventListener("click", startGame);

async function startGame() {

    const { data: players, error } =
        await supabase
            .from("players")
            .select("*");

    if (error) {

        console.error(error);
        return;
    }

    console.log(players);

    if (players.length < 3) {

        alert("Need at least 3 players.");
        return;
    }

    assignRoles(players);
}

// ======================================
// Assign Spy And Roles
// ======================================

function assignRoles(players) {

    const spyIndex =
        Math.floor(
            Math.random() * players.length
        );
    
    const sheetNames =
        workbook.SheetNames;

    const randomSheet =
        sheetNames[
            Math.floor(
                Math.random() *
                sheetNames.length
            )
        ];

    const worksheet =
        workbook.Sheets[randomSheet];

    const roles =
        XLSX.utils
            .sheet_to_json(
                worksheet,
                { header: 1 }
            )
            .flat()
            .filter(Boolean);

    if (
        roles.length <
        players.length - 1
    ) {

        alert(
            "Not enough roles in selected sheet."
        );

        return;
    }

    const shuffledRoles =
        shuffle(roles);

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
   
