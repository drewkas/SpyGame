// ========================
// Startup
// ========================

// alert("app.js loaded");

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://cevpdsrjsqavrrtlpyoa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnBkc3Jqc3FhdnJydGxweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE3NTUsImV4cCI6MjEwMTcwNzc1NX0.nl5HKXm2AOcQYFDSQARmcRVXvCRe9cf32OEj3P5Jk6w";

const mySupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

try {
    console.log(
        "Supabase client created"
    );
} catch (err) {
    console.error(err);
}

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let workbook = null;
let currentGame = null;
let sheetName = null;

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

        console.log("Workbook loaded:", workbook.SheetNames);

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
        "ABCDEFGHJKLMNPQRSTUVWXY23456789";

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

const button = document.getElementById("createGameBtn");

document
    .getElementById("createGameBtn")
    .addEventListener(
        "click",
        createGame
    );

async function createGame() {

    const gameCode = generateCode();

    console.log("Created game code:", gameCode);

    const hostName =
        document
            .getElementById("playerName")
            .value
            .trim();

    if (!hostName) {
        alert("Please enter your name.");
        return;
    }
    
    const {
        data,
        error
    } = await mySupabase
        .from("games")
        .insert({
            game_code: gameCode,
            status: "waiting"
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        alert(
            "Unable to create game."
        );

        return;
    }
 
    const {
        data: hostPlayer,
        error: playerError
    } = await mySupabase
        .from("players")
        .insert({
            game_id: data.id,
            player_name: hostName,
            is_host: true
        })
        .select()
        .single();

    localStorage.setItem(
    "playerId",
    hostPlayer.id
    );
    
    localStorage.setItem(
        "gameId",
        data.id
    );
    
    localStorage.setItem(
        "playerName",
        hostName
    );

    currentGame = data;

    document.getElementById(
        "displayCode"
    ).textContent =
        gameCode;

    document.getElementById(
        "home"
    ).style.display =
        "none";

    document.getElementById(
        "hostPanel"
    ).style.display =
        "block";

    updatePlayerList();
}

// ======================================
// Join Game
// ======================================

document
    .getElementById("joinGameBtn")
    .addEventListener(
        "click",
        joinGame
    );

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
            "Enter a game code and player name."
        );

        return;
    }

    console.log("Searching for game:", code);
    
    const {
        data: game,
        error: gameError
    } = await mySupabase
        .from("games")
        .select("*")
        .eq("game_code", code)
        .single();

    if (gameError || !game) {
        alert("Game not found.");
        return;
    }

    const {
        data: player,
        error: playerError
    } = await mySupabase
        .from("players")
        .insert({
            game_id: game.id,
            player_name: playerName
        })
        .select()
        .single();

    if (playerError) {

        console.error(playerError);

        alert(
            "Unable to join game."
        );

        return;
    }

    localStorage.setItem(
        "playerId",
        player.id
    );

    localStorage.setItem(
        "gameId",
        game.id
    );

    localStorage.setItem(
        "playerName",
        playerName
    );

    document.getElementById(
        "home"
    ).style.display =
        "none";

    document.getElementById(
        "waitingRoom"
    ).style.display =
        "block";
}


// =====================================================
// PLAYER LIST
// =====================================================

async function updatePlayerList() {

    if (!currentGame) {
        return;
    }

    const {
        data: players,
        error
    } = await mySupabase
        .from("players")
        .select("*")
        .eq(
            "game_id",
            currentGame.id
        );

    if (error) {

        console.error(error);

        return;
    }

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

// refresh waiting room every 3 seconds

setInterval(() => {
    if (currentGame) {
        updatePlayerList();
    }
}, 3000);


// =====================================================
// RANDOM SHEET
// =====================================================

function chooseRandomSheet() {

    const sheets =
        workbook.SheetNames;

    const index =
        Math.floor(
            Math.random() *
            sheets.length
        );
    
    return sheets[index];
}

// =====================================================
// GET ROLES FROM SHEET
// =====================================================

function getRoles(sheetName) {

    const worksheet =
        workbook.Sheets[sheetName];

    return XLSX.utils
        .sheet_to_json(worksheet)
        .map(
            row => row.Role
        )
        .filter(Boolean);
}

// ======================================
// Start Game
// ======================================

document
    .getElementById("startGameBtn")
    .addEventListener(
        "click",
        startGame
    );

async function startGame() {

    const {
        data: players,
        error
    } = await mySupabase
        .from("players")
        .select("*")
        .eq(
            "game_id",
            currentGame.id
        );

    if (error) {
        console.error(error);
        return;
    }

    if (players.length < 1) {
        alert(
            "Need at least 3 players."
        );
        return;
    }

    const sheetName = chooseRandomSheet();

    const roles = getRoles(sheetName);

    if (
        roles.length <
        players.length - 1
    ) {
        alert(
            "Not enough roles in "
            + sheetName
        );
        return;
    }

    const shuffledRoles = shuffle(roles);

    const spyIndex =
        Math.floor(
            Math.random() *
            players.length
        );

    let roleIndex = 0;

    for (
        let i = 0;
        i < players.length;
        i++
    ) {

        const player =
            players[i];

        if (i === spyIndex) {

            await mySupabase
                .from("players")
                .update({
                    is_spy: true,
                    assigned_role: null
                })
                .eq(
                    "id",
                    player.id
                );

        } else {

            await mySupabase
                .from("players")
                .update({
                    is_spy: false,
                    assigned_role:
                        shuffledRoles[
                            roleIndex
                        ]
                })
                .eq(
                    "id",
                    player.id
                );

            roleIndex++;
        }
    }

    await mySupabase
        .from("games")
        .update({
            status: "started",
            sheet_name:
                sheetName
        })
        .eq(
            "id",
            currentGame.id
        );

    alert(
        "Round Started!"
    );
}


// ======================================
// Assign Spy And Roles
// ======================================

async function revealRole() {

    const playerId =
        localStorage.getItem(
            "playerId"
        );

    if (!playerId) {
        return;
    }

    const {
        data: player,
        error
    } = await mySupabase
        .from("players")
        .select("*")
        .eq(
            "id",
            playerId
        )
        .single();

    if (error || !player) {
        return;
    }

    document.getElementById(
        "waitingRoom"
    ).style.display =
        "none";

    document.getElementById(
        "roleScreen"
    ).style.display =
        "block";

    const result =
        document.getElementById(
            "roleResult"
        );

    // if (player.is_spy) {
    //     result.innerHTML =
    //         '<div class="spy">YOU ARE THE SPY</div>';
    // } else {
    //     result.innerHTML =
    //         `<div class="role">${player.assigned_role}</div>`;
    // }

    const gameId = localStorage.getItem("gameId");

    const {
        data: game,
        error: gameError
    } = await mySupabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
    
    if (player.is_spy) {
        result.innerHTML = '<div class="spy">YOU ARE THE SPY</div>';
    } else {
        result.innerHTML = `
            <div class="location">
                Location: ${game.sheet_name}
            </div>
            <div class="role">
                Role: ${player.assigned_role}
            </div>
            `
        ;
    }
}


// =====================================================
// POLL FOR GAME START
// =====================================================

setInterval(async () => {

    const gameId =
        localStorage.getItem(
            "gameId"
        );

    if (!gameId) {
        return;
    }

    const {
        data: game
    } = await mySupabase
        .from("games")
        .select("*")
        .eq(
            "id",
            gameId
        )
        .single();

    console.log("game: ", game);

    if (
        game &&
        game.status === "started"
    ) {
        revealRole();
    }

}, 3000);
