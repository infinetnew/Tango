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

    const nickname =
    document
    .getElementById("nickname")
    .value
    .trim();

    const email =
    document
    .getElementById("email")
    .value
    .trim();

    const password =
    document
    .getElementById("password")
    .value
    .trim();

    if(!nickname){

        showMessage(
            "Inserisci un nickname"
        );

        return;
    }

    const {
        data,
        error
    } =
    await supabaseClient.auth.signUp({

        email,
        password

    });

    if(error){

        showMessage(error.message);

        return;
    }

    const user =
    data.user;

    if(user){


const { error: profileError } =
await supabaseClient
.from("profiles")
.insert([
    {
        id: user.id,
        nickname: nickname,
        email: email
    }
]);

if(profileError){

    console.error(profileError);

    showMessage(
        "Errore profilo: " +
        profileError.message
    );

    return;
}
}

showMessage(
    "Registrazione completata"
);

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

const { data: profile } =
await supabaseClient
.from("profiles")
.select("nickname")
.eq("id", user.id)
.maybeSingle();

if(profile){

    welcomeText.innerText =
    `Benvenuto ${profile.nickname}`;

}else{

    welcomeText.innerText =
    `Benvenuto ${user.email}`;

}

authContainer.style.display = "none";
appContainer.style.display = "flex";

showPage("dashboardPage");

await loadWatchlist();
await loadPortfolio();
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
const { data: tickerExists } =
await supabaseClient
.from("tickers")
.select("symbol")
.eq("symbol", symbol)
.maybeSingle();

if(!tickerExists){

    showStatus(
        "Ticker non trovato",
        "#ff6b6b"
    );

    return;
}
const { data: existingTicker } =
await supabaseClient
.from("watchlist")
.select("id")
.eq("user_id", user.id)
.eq("symbol", symbol)
.maybeSingle();

if(existingTicker){

    showStatus(
        "Ticker già presente nella tua Watchlist",
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
        "Errore durante il salvataggio del ticker",
        "#ff6b6b"
    );

    return;
}
        document
        .getElementById("tickerInput")
        .value = "";

        showStatus("Ticker aggiunto alla tua Watchlist");

        await loadWatchlist();

    } catch(err){

        console.error(err);

        showStatus(
            err.message,
            "#ff6b6b"
        );

    }

}
async function addPosition(){

    const symbol =
    document
    .getElementById("portfolioTicker")
    .value
    .trim()
    .toUpperCase();

    const investedAmount =
    parseFloat(
        document
        .getElementById("investedAmount")
        .value
    );

    const purchasePrice =
    parseFloat(
        document
        .getElementById("purchasePrice")
        .value
    );

    if(
        !symbol ||
        !investedAmount ||
        !purchasePrice
    ){

        showStatus(
            "Compila tutti i campi",
            "#ff6b6b"
        );

        return;
    }

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    const quantity =
    investedAmount /
    purchasePrice;
console.log("USER", user);
console.log("SYMBOL", symbol);
console.log("INVESTED", investedAmount);
console.log("PRICE", purchasePrice);
console.log("QUANTITY", quantity);
const { data: tickerExists } =
await supabaseClient
.from("tickers")
.select("symbol")
.eq("symbol", symbol)
.maybeSingle();

if(!tickerExists){

    showStatus(
        "Ticker non trovato",
        "#ff6b6b"
    );

    return;
}
const {
    data,
    error
} =
await supabaseClient
.from("portfolio")
.insert([
    {
        user_id: user.id,
        symbol: symbol,
        invested_amount: investedAmount,
        purchase_price: purchasePrice,
        quantity: quantity,
        currency: "USD"
    }
])
.select();

console.log("DATA", data);
console.log("ERROR", error);

if(error){

    console.error(error);

    showStatus(
        "Errore durante il salvataggio della posizione",
        "#ff6b6b"
    );

    return;
}

showStatus(
    "Posizione aggiunta al tuo Portfolio"
);
await loadPortfolio();

}

async function loadWatchlist(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

const { data, error } =
await supabaseClient
.from("watchlist")
.select(`
    *,
    tickers (
        symbol,
        name,
        exchange
    )
`)
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
<div class="watchlistRow">

    <div class="tickerCol">
        ${item.symbol}
    </div>

    <div class="priceCol">
        -
    </div>

    <div class="changeCol">
        -
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
async function loadPortfolio(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    const { data, error } =
    await supabaseClient
    .from("portfolio")
    .select(`
        *,
        tickers (
            symbol,
            name,
            exchange
        )
    `)
    .eq("user_id", user.id)
    .order("created_at");

    if(error){

        console.error(error);

        return;
    }

    const grouped = {};

    data.forEach(item => {

        if(!grouped[item.symbol]){

            grouped[item.symbol] = {
                symbol: item.symbol,
                invested: 0,
                positions: []
            };
        }

        grouped[item.symbol].invested +=
        Number(item.invested_amount);

        grouped[item.symbol].positions.push(item);

    });

    const list =
    document.getElementById("portfolioList");

    list.innerHTML = "";

    Object.values(grouped).forEach(stock => {

        const li =
        document.createElement("li");

        li.innerHTML = `
        <div class="portfolioRow">

            <div class="tickerCol">
                ${stock.symbol}
            </div>

            <div class="investedCol">
                $${stock.invested.toFixed(2)}
            </div>

            <div class="positionCount">
                ${stock.positions.length}
            </div>

            <button
                class="deleteBtn"
                onclick="event.stopPropagation()"
            >
                ▼
            </button>

        </div>
        `;

        list.appendChild(li);

    });

}
async function deleteTicker(id){



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

    showStatus("Ticker rimosso dalla watchlist");

    loadWatchlist();

}
async function deletePosition(id){

    const { error } =
    await supabaseClient
    .from("portfolio")
    .delete()
    .eq("id", id);

    if(error){

        showStatus(
            "Errore eliminazione posizione",
            "#ff6b6b"
        );

        return;
    }

    showStatus(
        "Posizione rimossa dal tuo portfolio"
    );

    await loadPortfolio();

}
function showPage(pageId){

    document
    .querySelectorAll(".page")
    .forEach(page => {
        page.style.display = "none";
    });

    document
    .getElementById(pageId)
    .style.display = "block";
}

document
.getElementById("dashboardBtn")
.addEventListener("click", () => {
    showPage("dashboardPage");
});

document
.getElementById("watchlistBtn")
.addEventListener("click", () => {
    showPage("watchlistPage");
});

document
.getElementById("portfolioBtn")
.addEventListener("click", () => {
    showPage("portfolioPage");
});

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
document
.getElementById("addPositionBtn")
.addEventListener("click", addPosition);

loadUser();
