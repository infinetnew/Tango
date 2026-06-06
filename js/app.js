const SUPABASE_URL =
"https://fkudvfkjjxmcbppvfinf.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdWR2ZmtqanhtY2JwcHZmaW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzY3NzgsImV4cCI6MjA5NjMxMjc3OH0.iVb5dD1ySIogTJKhvpGlUkmi5PusSRMyG0EmmGAlrF8";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const authContainer =
document.getElementById("authContainer");

const appContainer =
document.getElementById("appContainer");

const message =
document.getElementById("message");

const welcomeText =
document.getElementById("welcomeText");

const statusMessage =
document.getElementById("statusMessage");

function showMessage(text){
    message.innerText = text;
}

function showStatus(text, color = "#4ade80"){

    if(!statusMessage) return;

    statusMessage.innerText = text;
    statusMessage.style.color = color;

    setTimeout(() => {
        statusMessage.innerText = "";
    }, 3000);
}

async function register(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const { error } =
    await supabaseClient.auth.signUp({
        email,
        password
    });

    if(error){
        showMessage(error.message);
        return;
    }

    showMessage("Registrazione completata");
}

async function login(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const { error } =
    await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if(error){
        showMessage(error.message);
        return;
    }

    loadUser();
}

async function logout(){

    await supabaseClient.auth.signOut();

    authContainer.style.display = "flex";
    appContainer.style.display = "none";
}

async function loadUser(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    if(!user){

        authContainer.style.display = "flex";
        appContainer.style.display = "none";

        return;
    }

    welcomeText.innerText =
    `Benvenuto ${user.email}`;

    authContainer.style.display = "none";
    appContainer.style.display = "flex";

    loadWatchlist();
}

async function addTicker(){

    try {

        const symbol =
        document
        .getElementById("tickerInput")
        .value
        .trim()
        .toUpperCase();

        if(!symbol){
            showStatus(
                "Inserisci un ticker",
                "#ff6b6b"
            );
            return;
        }

        const {
            data:{ user }
        } =
        await supabaseClient.auth.getUser();

        if(!user){
            showStatus(
                "Utente non trovato",
                "#ff6b6b"
            );
            return;
        }

        const { error } =
        await supabaseClient
        .from("watchlist")
        .insert([
            {
                user_id: user.id,
                symbol: symbol
            }
        ]);

        if(error){

            console.error(error);

            showStatus(
                error.message,
                "#ff6b6b"
            );

            return;
        }

        document
        .getElementById("tickerInput")
        .value = "";

        showStatus("✅ Ticker aggiunto");

        await loadWatchlist();

    } catch(err){

        console.error(err);

        showStatus(
            err.message,
            "#ff6b6b"
        );

    }

}

async function loadWatchlist(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    const { data, error } =
    await supabaseClient
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

    if(error){
        console.error(error);
        return;
    }

    const list =
    document.getElementById("watchlist");

    list.innerHTML = "";

    data.forEach(item => {

const li =
document.createElement("li");

li.innerHTML = `
<div class="tickerCard">

    <div class="tickerInfo">

        <div class="tickerSymbol">
            ${item.symbol}
        </div>

        <div class="tickerSubtitle">
            Watchlist Asset
        </div>

    </div>

    <button
        class="deleteBtn"
        onclick="deleteTicker(${item.id})"
    >
        ✕
    </button>

</div>
`;

list.appendChild(li);

    });
}
async function deleteTicker(id){

    const confirmed =
    confirm("Vuoi eliminare questo ticker?");

    if(!confirmed){
        return;
    }

    const { error } =
    await supabaseClient
    .from("watchlist")
    .delete()
    .eq("id", id);

    if(error){

        showStatus(
            error.message,
            "#ff6b6b"
        );

        return;
    }

    showStatus("Ticker eliminato");

    loadWatchlist();

}

document
.getElementById("registerBtn")
.addEventListener("click", register);

document
.getElementById("registerBtn")
.addEventListener("click", register);

document
.getElementById("loginBtn")
.addEventListener("click", login);

document
.getElementById("logoutBtn")
.addEventListener("click", logout);

document
.getElementById("addTickerBtn")
.addEventListener("click", addTicker);

loadUser();
