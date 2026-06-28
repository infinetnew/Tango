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
let expandedTicker = null;
let selectedTicker = null;
let selectedPositionId = null;
let currentSort = null;
let docHistory = [];
const portfolioStatusMessage =
document.getElementById(
    "portfolioStatusMessage"
);

function showMessage(text){
    message.innerText = text;
}

function showStatus(
    text,
    color = "#4ade80"
){

    if(!statusMessage) return;

    statusMessage.innerText = text;
    statusMessage.style.color = color;

}
function showPortfolioStatus(
    text,
    color = "#4ade80"
){

    if(!portfolioStatusMessage) return;

    portfolioStatusMessage.innerText = text;
    portfolioStatusMessage.style.color = color;

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
await loadDashboardStats();
loadIndicatorDocs();
}
async function waitForIndicators(symbol){

    let previousLong = null;
    let previousEntry = null;

    for(let i = 0; i < 30; i++){

        const { data } =
        await supabaseClient
        .from("technical_indicators")
.select(`
    trend_v2,
    momentum_v2,
    entry_v2,
    signal_v2
`)
        .eq("symbol", symbol)
        .maybeSingle();

if (
    data &&
    data.trend_v2 !== null &&
    data.momentum_v2 !== null &&
    data.entry_v2 !== null &&
    data.signal_v2 !== null
) {
    return true;
}

        await new Promise(
            resolve =>
            setTimeout(resolve, 1000)
        );

    }

    return false;

}
function loadIndicatorDocs(){

    document.getElementById("indicatorDocs").innerHTML = `

    <div class="card">

<div class="docItem"
    onclick="showIndicatorDoc('trendV2')">
    📈 Trend Score
</div>

<div class="docItem"
    onclick="showIndicatorDoc('momentumV2')">
    🚀 Momentum Score
</div>

<div class="docItem"
    onclick="showIndicatorDoc('entryV2')">
    🎯 Entry Score
</div>

<div class="docItem"
    onclick="showIndicatorDoc('signalV2')">
    🚦 Segnale Operativo
</div>

    </div>

    `;
}
function showIndicatorDoc(type){

    docHistory.push(type);

    let html = "";
if(type === "trendV2"){

html = `

<h3>Trend Score</h3>

<p>
Misura la qualità strutturale del trend.
</p>

<p>
Valuta se il titolo si trova in una tendenza rialzista consolidata oppure in una fase debole.
</p>

<br>

<h4>Cosa analizza</h4>
<br>

<p>
✅ Forza rispetto alla SMA200
</p>

<p>
✅ Allineamento delle medie mobili
</p>

<p>
✅ Vicinanza ai massimi annuali
</p>

<br>

<h4>Interpretazione</h4>

<p>
Il punteggio viene espresso su scala 0-100.
</p>

<p>
Nella Watchlist viene visualizzato come voto su 10.
</p>

`;

}
if(type === "momentumV2"){

html = `

<h3>Momentum Score</h3>

<p>
Misura l'accelerazione del movimento.
</p>

<p>
Indica se il titolo sta guadagnando forza oppure la sta perdendo.
</p>

<br>

<h4>Cosa analizza</h4>
<br>

<p>
✅ RSI Slope
</p>

<p>
✅ MACD Histogram Slope
</p>

<p>
✅ EMA Spread Slope
</p>

<p>
✅ Volume Slope
</p>

<br>

<h4>Interpretazione</h4>

<p>
Il punteggio viene espresso su scala 0-100.
</p>

<p>
Nella Watchlist viene visualizzato come voto su 10.
</p>

`;

}
if(type === "entryV2"){

html = `

<h3>Entry Score</h3>

<p>
Misura la qualità dell'ingresso nel momento attuale.
</p>

<p>
Combina trend, momentum e condizioni operative per individuare il timing migliore.
</p>

<br>

<h4>Cosa analizza</h4>
<br>

<p>
✅ Momentum Score
</p>

<p>
✅ RSI
</p>

<p>
✅ MACD Histogram
</p>

<p>
✅ Volume Ratio
</p>

<p>
✅ Accelerazione del movimento
</p>

<br>

<h4>Interpretazione</h4>

<p>
Il punteggio viene espresso su scala 0-100.
</p>

<p>
Nella Watchlist viene visualizzato come voto su 10.
</p>

`;

}
if(type === "signalV2"){

html = `

<h3>Signal</h3>

<p>
Signal è il verdetto finale del sistema.
</p>

<p>
Combina Trend Score, Momentum Score ed Entry Score.
</p>

<br>

<h4>Interpretazione</h4>
<br>

<p>
🟣 STRONG BUY
</p>

<p>
Trend forte, momentum forte e timing eccellente.
</p>

<br>

<p>
🟢 BUY
</p>

<p>
Condizioni favorevoli per l'acquisto.
</p>

<br>

<p>
🟡 WATCH
</p>

<p>
Situazione interessante ma ancora da confermare.
</p>

<br>

<p>
🟠 PRUDENZA
</p>

<p>

Trend ancora presente ma il momentum sta rallentando.
Valutare una gestione più conservativa della posizione.
</p>

<br>

<p>
🔴 AVOID
</p>

<p>
Condizioni non favorevoli.
</p>

`;

}

    document.getElementById(
        "tickerDetailsTitle"
    ).innerText = "Documentazione";

    document.getElementById(
        "tickerDetailsContent"
    ).innerHTML = html;

    document.getElementById(
        "tickerDetailsModal"
    ).style.display = "flex";
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
const { data: marketExists } =
await supabaseClient
.from("market_data")
.select(`
    symbol,
    watchlist_count,
    portfolio_count
`)
.eq("symbol", symbol)
.maybeSingle();

if(!marketExists){

    await supabaseClient
    .from("market_data")
    .insert([
        {
            symbol: symbol,
            current_price: null,
            daily_change_percent: null,
            last_update: null,
            watchlist_count: 1,
            portfolio_count: 0
        }
    ]);

    fetch(
        "https://fkudvfkjjxmcbppvfinf.supabase.co/functions/v1/bootstrap-history",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                symbol: symbol
            })
        }
    ).catch(console.error);

}
else{

    await supabaseClient
    .from("market_data")
    .update({
        watchlist_count:
            marketExists.watchlist_count + 1
    })
    .eq("symbol", symbol);

}

showStatus(
    "Recupero dati di mercato..."
);

await fetch(
    "https://fkudvfkjjxmcbppvfinf.supabase.co/functions/v1/bootstrap-market-data",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            symbol: symbol
        })
    }
);
await fetch(
    "https://fkudvfkjjxmcbppvfinf.supabase.co/functions/v1/calculate-indicators",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            symbol: symbol
        })
    }
);
        document
        .getElementById("tickerInput")
        .value = "";
showStatus(
    "Calcolo indicatori tecnici..."
);
const indicatorsReady =
await waitForIndicators(symbol);

if(!indicatorsReady){

    showStatus(
        "Timeout calcolo indicatori",
        "#ff6b6b"
    );

    return;

}

await loadWatchlist();

showStatus(
    "Ticker aggiunto alla tua Watchlist"
);
setTimeout(() => {

    showStatus("");

}, 2000);

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

        showPortfolioStatus(
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

    showPortfolioStatus(
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

    showPortfolioStatus(
        "Errore durante il salvataggio della posizione",
        "#ff6b6b"
    );

    return;
}
const { data: marketExists } =
await supabaseClient
.from("market_data")
.select(`
    symbol,
    watchlist_count,
    portfolio_count
`)
.eq("symbol", symbol)
.maybeSingle();

if(!marketExists){

    await supabaseClient
    .from("market_data")
    .insert([
        {
            symbol: symbol,
            current_price: null,
            daily_change_percent: null,
            last_update: null,
            watchlist_count: 0,
            portfolio_count: 1
        }
    ]);

    fetch(
        "https://fkudvfkjjxmcbppvfinf.supabase.co/functions/v1/bootstrap-history",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                symbol: symbol
            })
        }
    ).catch(console.error);

}
else{

    await supabaseClient
    .from("market_data")
    .update({
        portfolio_count:
            marketExists.portfolio_count + 1
    })
    .eq("symbol", symbol);

}
showPortfolioStatus(
    "Aggiornamento portafoglio..."
);

await fetch(
    "https://fkudvfkjjxmcbppvfinf.supabase.co/functions/v1/bootstrap-market-data",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            symbol: symbol
        })
    }
);

await loadPortfolio();

showPortfolioStatus(
    "Posizione aggiunta al tuo Portfolio"
);
setTimeout(() => {

    showPortfolioStatus("");

}, 2000);

document.getElementById("portfolioTicker").value = "";
document.getElementById("investedAmount").value = "";
document.getElementById("purchasePrice").value = "";


}



function getSignalLabel(signal){

    switch(signal){

        case "STRONG_BUY":
            return "🟣 Acquisto Forte";

        case "BUY":
            return "🟢 Acquisto";

        case "WATCH":
            return "🟡 Osserva";

        case "TAKE_PROFIT":
            return "🟠 Prudenza";

        case "AVOID":
            return "🔴 Evita";

        default:
            return "-";
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

if(!data || data.length === 0){

    document.getElementById("watchlist").innerHTML = "";

    return;

}
const symbols =
data.map(item => item.symbol);

const { data: marketData } =
await supabaseClient
.from("market_data")
.select(`
    symbol,
    current_price,
    daily_change_percent
`)
.in("symbol", symbols);
const { data: technicalData } =
await supabaseClient
.from("technical_indicators")
.select(`
    symbol,
    trend_v2,
    momentum_v2,
    entry_v2,
    signal_v2
`)
.in("symbol", symbols);

const marketMap = {};

marketData?.forEach(item => {

    marketMap[item.symbol] = item;

});
const technicalMap = {};

technicalData?.forEach(item => {

    technicalMap[item.symbol] = item;

});
if(currentSort === "ttAsc"){

    data.sort((a,b)=>
        (technicalMap[a.symbol]?.trend_v2 || 0)
        -
        (technicalMap[b.symbol]?.trend_v2 || 0)
    );

}
if(currentSort === "ttDesc"){

    data.sort((a,b)=>
        (technicalMap[b.symbol]?.trend_v2 || 0)
        -
        (technicalMap[a.symbol]?.trend_v2 || 0)
    );

}

if(currentSort === "tmAsc"){

    data.sort((a,b)=>
        (technicalMap[a.symbol]?.momentum_v2 || 0)
        -
        (technicalMap[b.symbol]?.momentum_v2 || 0)
    );

}

if(currentSort === "tmDesc"){

    data.sort((a,b)=>
        (technicalMap[b.symbol]?.momentum_v2 || 0)
        -
        (technicalMap[a.symbol]?.momentum_v2 || 0)
    );

}
if(currentSort === "teAsc"){

    data.sort((a,b)=>
        (technicalMap[a.symbol]?.entry_v2 || 0)
        -
        (technicalMap[b.symbol]?.entry_v2 || 0)
    );

}

if(currentSort === "teDesc"){

    data.sort((a,b)=>
        (technicalMap[b.symbol]?.entry_v2 || 0)
        -
        (technicalMap[a.symbol]?.entry_v2 || 0)
    );

}
if(currentSort === "varAsc"){

    data.sort((a,b) =>
        Number(
            marketMap[a.symbol]
            ?.daily_change_percent || 0
        )
        -
        Number(
            marketMap[b.symbol]
            ?.daily_change_percent || 0
        )
    );

}

if(currentSort === "varDesc"){

    data.sort((a,b) =>
        Number(
            marketMap[b.symbol]
            ?.daily_change_percent || 0
        )
        -
        Number(
            marketMap[a.symbol]
            ?.daily_change_percent || 0
        )
    );

}

const list =
document.getElementById("watchlist");

    list.innerHTML = "";

    data.forEach(item => {
const technical =
technicalMap[item.symbol];

if(!technical){

    return;

}

const li =
document.createElement("li");

li.innerHTML = `
<div class="watchlistRow">

<button
    class="chartBtn"
    onclick="openChart('${item.symbol}')"
>
    📈
</button>

<div
    class="tickerCol clickableTicker"
    onclick="openTickerDetails('${item.symbol}')"
>
    ${item.symbol}
</div>

<div class="priceCol">
    ${
        marketMap[item.symbol]?.current_price
        ? "$" + Number(
            marketMap[item.symbol].current_price
          ).toFixed(2)
        : "-"
    }
</div>

<div
    class="changeCol"
    style="
        color:${
            Number(
                marketMap[item.symbol]
                ?.daily_change_percent || 0
            ) >= 0
            ? '#22c55e'
            : '#ef4444'
        };
        font-weight:bold;
    "
>
    ${
        Number(
            marketMap[item.symbol]
            ?.daily_change_percent || 0
        ) >= 0
        ? "+"
        : "-"
    }
    ${
        Math.abs(
            Number(
                marketMap[item.symbol]
                ?.daily_change_percent || 0
            )
        ).toFixed(2)
    }%
</div>
<div class="tangoCol">

<div>
📈 Trend:
${(
    (technicalMap[item.symbol]?.trend_v2 || 0) / 10
).toFixed(1)}/10
</div>

<div>
🚀 Momentum:
${(
    (technicalMap[item.symbol]?.momentum_v2 || 0) / 10
).toFixed(1)}/10
</div>

<div>
🎯 Entry:
${(
    (technicalMap[item.symbol]?.entry_v2 || 0) / 10
).toFixed(1)}/10
</div>

<div>
${getSignalLabel(
    technicalMap[item.symbol]?.signal_v2
)}
</div>

</div>

<button
    class="deleteBtn"
    onclick="deleteTicker(${item.id})"
>
    🗑️
</button>

</div>
`;

list.appendChild(li);

    });
}
function togglePortfolioTicker(symbol){

    if(expandedTicker === symbol){

        expandedTicker = null;

    }else{

        expandedTicker = symbol;

    }

    loadPortfolio();
}
function openManagePosition(symbol){

    selectedTicker = symbol;

    document
    .getElementById("manageTickerTitle")
    .innerText =
    `Gestisci ${symbol}`;

    document
    .getElementById("managePositionModal")
    .style.display = "flex";
}
function handleManageClick(event, symbol){

    event.stopPropagation();

    openManagePosition(symbol);

}
function closeManagePosition(){

    document
    .getElementById("managePositionModal")
    .style.display = "none";

    document
    .getElementById("closeAmountInput")
    .value = "";

    document
    .getElementById("closePercentInput")
    .value = "";

    selectedTicker = null;
}
async function confirmManagePosition(){

    const amount =
    parseFloat(
        document
        .getElementById("closeAmountInput")
        .value
    );

    const percent =
    parseFloat(
        document
        .getElementById("closePercentInput")
        .value
    );

    if(
        (!amount && !percent) ||
        (amount && percent)
    ){
        alert(
            "Inserisci un importo O una percentuale"
        );
        return;
    }

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    const { data: positions } =
    await supabaseClient
    .from("portfolio")
    .select("*")
    .eq("user_id", user.id)
    .eq("symbol", selectedTicker);

    if(!positions?.length){
        return;
    }

    let totalInvested = 0;

    positions.forEach(position => {

        totalInvested +=
        Number(position.invested_amount);

    });

    let reductionRatio = 0;

    if(percent){

        reductionRatio =
        percent / 100;

    }else{

        reductionRatio =
        amount / totalInvested;

    }

if(reductionRatio >= 1){

    const positionsToDelete =
        positions.length;

    await supabaseClient
    .from("portfolio")
    .delete()
    .eq("user_id", user.id)
    .eq("symbol", selectedTicker);

    const { data: marketData } =
    await supabaseClient
    .from("market_data")
    .select(`
        watchlist_count,
        portfolio_count
    `)
    .eq("symbol", selectedTicker)
    .single();

    const newPortfolioCount =
        Math.max(
            0,
            marketData.portfolio_count -
            positionsToDelete
        );

    if(
        marketData.watchlist_count === 0 &&
        newPortfolioCount === 0
    ){

        await supabaseClient
        .from("market_data")
        .delete()
        .eq("symbol", selectedTicker);

        await supabaseClient
        .from("market_history")
        .delete()
        .eq("symbol", selectedTicker);
await supabaseClient
.from("technical_indicators")
.delete()
.eq("symbol", selectedTicker);

    }else{

        await supabaseClient
        .from("market_data")
        .update({
            portfolio_count:
                newPortfolioCount
        })
        .eq("symbol", selectedTicker);

    }

    closeManagePosition();

    await loadPortfolio();

    return;
}

    for(const position of positions){

        const newInvested =
        Number(position.invested_amount)
        *
        (1 - reductionRatio);

        const newQuantity =
        Number(position.quantity)
        *
        (1 - reductionRatio);

        await supabaseClient
        .from("portfolio")
        .update({
            invested_amount:
                newInvested,
            quantity:
                newQuantity
        })
        .eq("id", position.id);

    }

    closeManagePosition();

    await loadPortfolio();
}
async function loadDashboardStats(){

    const {
        data:{ user }
    } =
    await supabaseClient.auth.getUser();

    if(!user) return;

    const { data: portfolio } =
    await supabaseClient
    .from("portfolio")
    .select(`
        symbol,
        invested_amount,
        quantity
    `)
    .eq("user_id", user.id);

    const { data: watchlist } =
    await supabaseClient
    .from("watchlist")
    .select("id")
    .eq("user_id", user.id);

    let totalInvested = 0;

    portfolio?.forEach(position => {

        totalInvested +=
        Number(position.invested_amount);

    });

    const symbols = [
        ...new Set(
            portfolio?.map(
                p => p.symbol
            ) || []
        )
    ];

    let currentValue = 0;

    if(symbols.length > 0){

        const { data: marketData } =
        await supabaseClient
        .from("market_data")
        .select(`
            symbol,
            current_price
        `)
        .in("symbol", symbols);

        const marketMap = {};

        marketData?.forEach(item => {

            marketMap[item.symbol] = item;

        });

        portfolio.forEach(position => {

            currentValue +=
                Number(position.quantity)
                *
                Number(
                    marketMap[position.symbol]
                    ?.current_price || 0
                );

        });

    }

    const totalPL =
        currentValue - totalInvested;

    const totalPLPercent =
        totalInvested > 0
        ?
        (
            totalPL /
            totalInvested
        ) * 100
        :
        0;

    const plColor =
        totalPL >= 0
        ? "#22c55e"
        : "#ef4444";

    document
    .getElementById("dashboardStats")
    .innerHTML = `

    <div class="dashboardGrid">

        <div class="card">
            <h3>💼 Valore Portafoglio</h3>
            <p>$${currentValue.toFixed(2)}</p>
        </div>

        <div class="card">
            <h3>📈 P/L Totale</h3>
            <p style="color:${plColor};">
                $${totalPL.toFixed(2)}
            </p>
        </div>

        <div class="card">
            <h3>📊 P/L %</h3>
            <p style="color:${plColor};">
                ${totalPLPercent.toFixed(2)}%
            </p>
        </div>

        <div class="card">
            <h3>⭐ Watchlist</h3>
            <p>${watchlist?.length || 0}</p>
        </div>

    </div>
    `;
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
const symbols = [
    ...new Set(
        data.map(item => item.symbol)
    )
];

const { data: marketData } =
await supabaseClient
.from("market_data")
.select(`
    symbol,
    current_price
`)
.in("symbol", symbols);

const marketMap = {};

marketData?.forEach(item => {

    marketMap[item.symbol] = item;

});

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
let totalPortfolioInvested = 0;

Object.values(grouped).forEach(stock => {

    totalPortfolioInvested += stock.invested;

});
const stocks =
Object.values(grouped);

stocks.sort((a, b) => {

    return b.invested - a.invested;

});
    const list =
    document.getElementById("portfolioList");

    list.innerHTML = "";

    stocks.forEach(stock => {

        const li =
        document.createElement("li");
const weight =
(
    stock.invested /
    totalPortfolioInvested
) * 100;

const currentPrice =
Number(
    marketMap[stock.symbol]
    ?.current_price || 0
);

let currentValue = 0;

stock.positions.forEach(position => {

    currentValue +=
        Number(position.quantity)
        * currentPrice;

});

const profitLossDollar =
    currentValue - stock.invested;

const profitLossPercent =
    stock.invested > 0
    ?
    (
        profitLossDollar /
        stock.invested
    ) * 100
    :
    0;
let detailsHtml = "";

if(expandedTicker === stock.symbol){

    detailsHtml = `
    <div class="portfolioDetails">

<div class="portfolioDetailRow">

    <strong>Investito</strong>
    <strong>Prezzo Acq.</strong>
    <strong>Quantità</strong>
    <strong>P/L %</strong>
    <strong>P/L $</strong>
    <strong>Azione</strong>

</div>
${stock.positions.map(position => {

    const investedValue =
        Number(position.invested_amount);

    const currentValue =
        Number(position.quantity) *
        currentPrice;

    const positionPLDollar =
        currentValue -
        investedValue;

    const positionPLPercent =
        investedValue > 0
        ?
        (
            positionPLDollar /
            investedValue
        ) * 100
        :
        0;

    const plColor =
        positionPLDollar >= 0
        ? "#22c55e"
        : "#ef4444";

    return `
    <div class="portfolioDetailRow">

        <span>
            $${investedValue.toFixed(2)}
        </span>

        <span>
            $${Number(position.purchase_price).toFixed(2)}
        </span>

        <span>
            ${Number(position.quantity).toFixed(4)}
        </span>

        <span style="color:${plColor};font-weight:bold;">
            ${positionPLPercent.toFixed(2)}%
        </span>

        <span style="color:${plColor};font-weight:bold;">
            $${positionPLDollar.toFixed(2)}
        </span>

        <button
            class="closePositionBtn"
            onclick="deletePosition(${position.id})"
        >
            Chiudi
        </button>

    </div>
    `;

}).join("")}

    </div>
    `;
}
const portfolioPLColor =
    profitLossDollar >= 0
    ? "#22c55e"
    : "#ef4444";
li.innerHTML = `
<div
    class="portfolioRow"
    onclick="togglePortfolioTicker('${stock.symbol}')"
>

    <div class="tickerCol">
        ${expandedTicker === stock.symbol ? "▼" : "▶"}
        ${stock.symbol}
    </div>

    <div class="priceCol">
        $${currentPrice.toFixed(2)}
    </div>

    <div
        class="plPercentCol"
        style="
            color:${portfolioPLColor};
            font-weight:bold;
        "
    >
        ${profitLossPercent.toFixed(2)}%
    </div>

    <div
        class="plDollarCol"
        style="
            color:${portfolioPLColor};
            font-weight:bold;
        "
    >
        $${profitLossDollar.toFixed(2)}
    </div>

    <div class="investedCol">
        $${stock.invested.toFixed(2)}
    </div>

    <div class="weightCol">
        ${weight.toFixed(1)}%
    </div>

    <div class="positionCount">
        ${stock.positions.length}
    </div>

    <button
        class="manageBtn"
        onclick="handleManageClick(event, '${stock.symbol}')"
    >
        ⚙
    </button>

</div>

${detailsHtml}
`;
        list.appendChild(li);

    });

}
async function deleteTicker(id){

    const { data: tickerData } =
    await supabaseClient
    .from("watchlist")
    .select("symbol")
    .eq("id", id)
    .single();

    const symbol =
    tickerData.symbol;

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

    const { data: marketData } =
    await supabaseClient
    .from("market_data")
    .select(`
        watchlist_count,
        portfolio_count
    `)
    .eq("symbol", symbol)
    .single();

    const newWatchlistCount =
        Math.max(
            0,
            marketData.watchlist_count - 1
        );

    if(
        newWatchlistCount === 0 &&
        marketData.portfolio_count === 0
    ){

        await supabaseClient
        .from("market_data")
        .delete()
        .eq("symbol", symbol);

        await supabaseClient
        .from("market_history")
        .delete()
        .eq("symbol", symbol);

await supabaseClient
.from("technical_indicators")
.delete()
.eq("symbol", symbol);

    }else{

        await supabaseClient
        .from("market_data")
        .update({
            watchlist_count:
                newWatchlistCount
        })
        .eq("symbol", symbol);

    }

    showStatus(
        "Ticker rimosso dalla watchlist"
    );

    await loadWatchlist();
}
function deletePosition(id){

    selectedPositionId = id;

    document
    .getElementById("confirmCloseModal")
    .style.display = "flex";
}
async function confirmClosePosition(){

    const { data: positionData } =
    await supabaseClient
    .from("portfolio")
    .select("symbol")
    .eq("id", selectedPositionId)
    .single();

    const symbol =
    positionData.symbol;

    const { error } =
    await supabaseClient
    .from("portfolio")
    .delete()
    .eq("id", selectedPositionId);

    if(error){

        showPortfolioStatus(
            "Errore eliminazione posizione",
            "#ff6b6b"
        );

        return;
    }

    const { data: marketData } =
    await supabaseClient
    .from("market_data")
    .select(`
        watchlist_count,
        portfolio_count
    `)
    .eq("symbol", symbol)
    .single();

    const newPortfolioCount =
        Math.max(
            0,
            marketData.portfolio_count - 1
        );

    if(
        marketData.watchlist_count === 0 &&
        newPortfolioCount === 0
    ){

        await supabaseClient
        .from("market_data")
        .delete()
        .eq("symbol", symbol);

        await supabaseClient
        .from("market_history")
        .delete()
        .eq("symbol", symbol);

await supabaseClient
.from("technical_indicators")
.delete()
.eq("symbol", symbol);

    }else{

        await supabaseClient
        .from("market_data")
        .update({
            portfolio_count:
                newPortfolioCount
        })
        .eq("symbol", symbol);

    }

    document
    .getElementById("confirmCloseModal")
    .style.display = "none";

    selectedPositionId = null;

    showPortfolioStatus(
        "Posizione chiusa con successo"
    );

    await loadPortfolio();
}
function closeConfirmModal(){

    document
    .getElementById("confirmCloseModal")
    .style.display = "none";

    selectedPositionId = null;
}
async function openTickerDetails(symbol){

    const { data } =
    await supabaseClient
    .from("technical_indicators")
    .select("*")
    .eq("symbol", symbol)
    .single();

    if(!data){

        return;

    }
const formatSigned = (
    value,
    decimals = 2,
    suffix = ""
) => {

    const num = Number(value);

    return `
        ${num >= 0 ? "+" : "-"}
        ${Math.abs(num).toFixed(decimals)}
        ${suffix}
    `.replace(/\s+/g, " ").trim();

};

    document
    .getElementById("tickerDetailsTitle")
    .innerText = symbol;

    document
    .getElementById("tickerDetailsContent")
    .innerHTML = `

        <div class="detailGrid">
<div>📈 Trend</div>
<div>${(data.trend_v2 / 10).toFixed(1)}/10</div>

<div>🚀 Momentum</div>
<div>${(data.momentum_v2 / 10).toFixed(1)}/10</div>

<div>🎯 Entry</div>
<div>${(data.entry_v2 / 10).toFixed(1)}/10</div>

<div>Signal</div>
<div>${getSignalLabel(data.signal_v2)}</div>

            <div>────────────</div>
            <div></div>

            <div>RSI</div>
            <div>${Number(data.rsi14).toFixed(2)}</div>

            <div>MACD</div>
            <div>${formatSigned(data.macd)}</div>

            <div>MACD Signal</div>
            <div>${formatSigned(data.macd_signal)}</div>

            <div>MACD Hist</div>
            <div>${formatSigned(data.macd_histogram)}</div>

            <div>────────────</div>
            <div></div>

            <div>52W High</div>
            <div>${formatSigned(
    data.distance_52w_high,
    2,
    "%"
)}</div>

     <div>52W Low</div>
<div>${formatSigned(
    data.distance_52w_low,
    2,
    "%"
)}</div>

<div>Bollinger Pos</div>
<div>${Math.round(data.bollinger_position * 100)}%</div>

<div>Volume Ratio</div>
<div>${Math.round(data.volume_ratio * 100)}%</div>

        </div>
    `;

    document
    .getElementById("tickerDetailsModal")
    .style.display = "flex";

}
function goBackDoc(){

    docHistory.pop();

    const previousType =
        docHistory[docHistory.length - 1];

    if(!previousType){

        closeTickerDetails();

        return;
    }

    docHistory.pop();

    showIndicatorDoc(previousType);

}
function closeTickerDetails(){

    document
    .getElementById("tickerDetailsModal")
    .style.display = "none";

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
document
.getElementById("ttAsc")
.addEventListener("click", () => {

    currentSort = "ttAsc";

    loadWatchlist();

});

document
.getElementById("ttDesc")
.addEventListener("click", () => {

    currentSort = "ttDesc";

    loadWatchlist();

});

document
.getElementById("tmAsc")
.addEventListener("click", () => {

    currentSort = "tmAsc";

    loadWatchlist();

});

document
.getElementById("tmDesc")
.addEventListener("click", () => {

    currentSort = "tmDesc";

    loadWatchlist();

});
document
.getElementById("teAsc")
.addEventListener("click", () => {

    currentSort = "teAsc";

    loadWatchlist();

});

document
.getElementById("teDesc")
.addEventListener("click", () => {

    currentSort = "teDesc";

    loadWatchlist();

});
document
.getElementById("varAsc")
.addEventListener("click", () => {

    currentSort = "varAsc";

    loadWatchlist();

});

document
.getElementById("varDesc")
.addEventListener("click", () => {

    currentSort = "varDesc";

    loadWatchlist();

});
loadUser();
window.togglePortfolioTicker =
togglePortfolioTicker;
window.openManagePosition =
openManagePosition;
window.openTickerDetails =
openTickerDetails;
window.showIndicatorDoc =
showIndicatorDoc;
window.goBackDoc =
goBackDoc;
window.handleManageClick =
handleManageClick;
window.deletePosition =
deletePosition;
window.openChart =
openChart;
document
.getElementById("closeModalBtn")
.addEventListener(
    "click",
    closeManagePosition
);
document
.getElementById("confirmManageBtn")
.addEventListener(
    "click",
    confirmManagePosition
);
document
.getElementById("confirmCloseBtn")
.addEventListener(
    "click",
    confirmClosePosition
);

document
.getElementById("cancelCloseBtn")
.addEventListener(
    "click",
    closeConfirmModal
);
document
.getElementById("closeTickerDetailsBtn")
.addEventListener(
    "click",
    closeTickerDetails
);
