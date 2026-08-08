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
