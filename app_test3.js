// ========================
// Startup
// ========================

alert("app.js loaded");
console.log("window.supabase =", window.supabase);

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://cevpdsrjsqavrrtlpyoa.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnBkc3Jqc3FhdnJydGxweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE3NTUsImV4cCI6MjEwMTcwNzc1NX0.nl5HKXm2AOcQYFDSQARmcRVXvCRe9cf32OEj3P5Jk6w";

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
    .addEventListener(
        "click",
        createGame
    );

async function createGame() {

    const gameCode =
        generateCode();

    const {
        data,
        error
    } = await supabase
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

    const {
        data: game,
        error: gameError
    } = await supabase
        .from("games")
        .select("*")
        .eq("game_code", code)
*       .single();

    if (gameErr*r || !game) {

        alert("Game not found.");

        return;
    }

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
    } = await supabase
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
