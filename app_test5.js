// ========================
// Startup
// ========================

alert("app.js loaded");

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://cevpdsrjsqavrrtlpyoa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnBkc3Jqc3FhdnJydGxweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE3NTUsImV4cCI6MjEwMTcwNzc1NX0.nl5HKXm2AOcQYFDSQARmcRVXvCRe9cf32OEj3P5Jk6w";

try {
    const supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

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
        "abcdefghijklmnpqrstuvwxyz23456789";

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

    console.log("createGame running");
    console.log("supabase =", supabase);
    console.log(
        "typeof supabase.from =",
        typeof supabase.from
    );
    
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
