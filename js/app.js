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
}
async function waitForIndicators(symbol){

    let previousLong = null;
    let previousEntry = null;

    for(let i = 0; i < 30; i++){

        const { data } =
        await supabaseClient
        .from("technical_indicators")
.select(`
    long_score,
    entry_score,
    sma200,
    rsi14,
    macd
`)
        .eq("symbol", symbol)
        .maybeSingle();

if(
    data &&
    data.long_score !== null &&
    data.entry_score !== null &&
    data.sma200 !== null &&
    data.rsi14 !== null &&
    data.macd !== null
){

return true;

        }

        await new Promise(
            resolve =>
            setTimeout(resolve, 1000)
        );

    }

    return false;

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
    long_score,
    entry_score
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
if(currentSort === "tiAsc"){

    data.sort((a,b) =>
        (technicalMap[a.symbol]?.long_score || 0)
        -
        (technicalMap[b.symbol]?.long_score || 0)
    );

}

if(currentSort === "tiDesc"){

    data.sort((a,b) =>
        (technicalMap[b.symbol]?.long_score || 0)
        -
        (technicalMap[a.symbol]?.long_score || 0)
    );

}

if(currentSort === "teAsc"){

    data.sort((a,b) =>
        (technicalMap[a.symbol]?.entry_score || 0)
        -
        (technicalMap[b.symbol]?.entry_score || 0)
    );

}

if(currentSort === "teDesc"){

    data.sort((a,b) =>
        (technicalMap[b.symbol]?.entry_score || 0)
        -
        (technicalMap[a.symbol]?.entry_score || 0)
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

    TI = ${
        technicalMap[item.symbol]?.long_score ?? "..."
    }

    &nbsp;&nbsp;&nbsp;&nbsp;

    TE = ${
        technicalMap[item.symbol]?.entry_score ?? "..."
    }

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

            <div>Tango Index</div>
            <div>${data.long_score}</div>

            <div>Tango Entry</div>
            <div>${data.entry_score}</div>

            <div>────────────</div>
            <div></div>

            <div>Trend Score</div>
            <div>${data.trend_score}</div>

            <div>Momentum Score</div>
            <div>${data.momentum_score}</div>

            <div>Strength Score</div>
            <div>${data.strength_score}</div>

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
.getElementById("tiAsc")
.addEventListener("click", () => {

    currentSort = "tiAsc";

    loadWatchlist();

});

document
.getElementById("tiDesc")
.addEventListener("click", () => {

    currentSort = "tiDesc";

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
window.handleManageClick =
handleManageClick;
window.deletePosition =
deletePosition;
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
