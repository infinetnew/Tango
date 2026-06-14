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
function loadIndicatorDocs(){

    document.getElementById("indicatorDocs").innerHTML = `

    <div class="card">

        <h3>📚 Documentazione Indicatori</h3>

        <div class="docItem"
            onclick="showIndicatorDoc('tangoIndex')">

            📈 Tango Index

        </div>

        <div class="docItem"
            onclick="showIndicatorDoc('tangoEntry')">

            🎯 Tango Entry

        </div>

        <div class="docItem"
            onclick="showIndicatorDoc('tangoDelta')">

            ⚡ Tango Delta

        </div>

    </div>

    `;
}
function showIndicatorDoc(type){

    let html = "";

if(type === "tangoIndex"){

    html = `

        <h3>Tango Index</h3>

        <p>
            Tango Index è l'indicatore principale del sistema Tango.
        </p>

        <p>
            Misura la qualità complessiva di un trend combinando la componente strutturale del movimento con la componente dinamica del momentum.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Tango Index =
            (Trend Index × 0.70)
            +
            (Momentum Index × 0.30)
        </p>

        <br>

        <h4>Componenti</h4>

        <div
            class="docItem"
            onclick="showIndicatorDoc('trendIndex')"
        >
            Trend Index
        </div>

        <div
            class="docItem"
            onclick="showIndicatorDoc('momentumIndex')"
        >
            Momentum Index
        </div>

        <br>

        <h4>Pesi</h4>

        <p>
            Trend Index → 70%
        </p>

        <p>
            Momentum Index → 30%
        </p>

        <br>

        <h4>Punteggio massimo</h4>

        <p>
            100 punti.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Tango Index rappresenta il principale indicatore di qualità del trend utilizzato da Tango.
        </p>

        <p>
            Combina la struttura del trend con la velocità del momentum per individuare i titoli più forti del mercato.
        </p>

        <br>

        <h4>Interpretazione</h4>

        <p>
            90 - 100 → 🟣 Esplosivo
        </p>

        <p>
            75 - 89 → 🔵 Molto Forte
        </p>

        <p>
            60 - 74 → 🟢 Forte
        </p>

        <p>
            45 - 59 → 🟡 Costruttivo
        </p>

        <p>
            30 - 44 → 🟠 Debole
        </p>

        <p>
            15 - 29 → 🔴 Fragile
        </p>

        <p>
            0 - 14 → ⚫ Nullo
        </p>

    `;
}

if(type === "tangoEntry"){

    html = `

        <h3>Tango Entry</h3>

        <p>
            Tango Entry misura la qualità dell'opportunità di ingresso in un titolo.
        </p>

        <p>
            Combina la qualità delle condizioni attuali di entrata con la forza del momentum per individuare le configurazioni più interessanti.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Tango Entry =
            (Entry Index × 0.60)
            +
            (Momentum Index × 0.40)
        </p>

        <br>

        <h4>Componenti</h4>

<div
    class="docItem"
    onclick="showIndicatorDoc('entryIndex')"
>
    Entry Index
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('momentumIndex')"
>
    Momentum Index
</div>

        <br>

        <h4>Pesi</h4>

        <p>
            Entry Index → 60%
        </p>

        <p>
            Momentum Index → 40%
        </p>

        <br>

        <h4>Punteggio massimo</h4>

        <p>
            100 punti.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Tango Entry rappresenta il principale indicatore di qualità dell'ingresso.
        </p>

        <p>
            Valuta se le condizioni tecniche attuali sono favorevoli per l'apertura o l'incremento di una posizione.
        </p>

    `;
}
if(type === "entryIndex"){

    html = `

        <h3>Entry Index</h3>

        <p>
            Entry Index misura la qualità tecnica dell'ingresso utilizzando momentum attuale, forza del MACD e partecipazione dei volumi.
        </p>

        <p>
            L'obiettivo è individuare titoli che mostrano contemporaneamente forza, accelerazione e interesse da parte del mercato.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Entry Index =
            RSI14 +
            MACD Histogram +
            Volume Ratio
        </p>

        <br>

        <h4>Componenti</h4>

<div
    class="docItem"
    onclick="showIndicatorDoc('rsi14')"
>
    RSI14
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('macdHistogram')"
>
    MACD Histogram
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('volumeRatio')"
>
    Volume Ratio
</div>

        <br>

        <h4>Pesi</h4>

        <p>
            RSI14 → 40 punti
        </p>

        <p>
            MACD Histogram → 40 punti
        </p>

        <p>
            Volume Ratio → 20 punti
        </p>

        <br>

        <h4>Punteggio massimo</h4>

        <p>
            100 punti.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Entry Index rappresenta la componente tecnica di ingresso del Tango Entry.
        </p>

        <p>
            Valuta se il titolo mostra condizioni operative favorevoli nel momento attuale.
        </p>

    `;
}
if(type === "rsi14"){

    html = `

        <h3>RSI14</h3>

        <p>
            RSI (Relative Strength Index) è un indicatore di momentum che misura la velocità e l'intensità dei movimenti di prezzo.
        </p>

        <p>
            Nel sistema Tango viene utilizzato per valutare la forza attuale del movimento e la qualità dell'ingresso.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            RSI = 100 − (100 / (1 + RS))
        </p>

        <p>
            RS = Guadagni Medi / Perdite Medie
        </p>

        <br>

        <h4>Periodo utilizzato</h4>

        <p>
            RSI a 14 periodi.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un RSI elevato indica una forte pressione d'acquisto.
        </p>

        <p>
            Un RSI basso indica una pressione d'acquisto debole o una prevalenza delle vendite.
        </p>

        <p>
            Nell'Entry Index l'RSI viene utilizzato come misura della forza immediata del movimento.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            40 punti su 100 dell'Entry Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            RSI > 70 → 40 punti
        </p>

        <p>
            RSI > 60 → 30 punti
        </p>

        <p>
            RSI > 50 → 20 punti
        </p>

        <p>
            RSI > 40 → 10 punti
        </p>

        <p>
            RSI ≤ 40 → 0 punti
        </p>

    `;
}
if(type === "macdHistogram"){

    html = `

        <h3>MACD Histogram</h3>

        <p>
            MACD Histogram misura la distanza tra il MACD e la Signal Line.
        </p>

        <p>
            È uno degli indicatori principali utilizzati dal sistema Tango per valutare la forza del momentum nel momento attuale.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            MACD Histogram =
            MACD − Signal Line
        </p>

        <br>

        <h4>Componenti del MACD</h4>

        <p>
            MACD =
            EMA12 − EMA26
        </p>

        <p>
            Signal Line =
            EMA a 9 periodi del MACD
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un MACD Histogram positivo indica che il MACD si trova sopra la Signal Line.
        </p>

        <p>
            Maggiore è il valore dell'Histogram, maggiore è la forza del momentum.
        </p>

        <p>
            Valori negativi indicano invece una perdita di forza del movimento.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            40 punti su 100 dell'Entry Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            MACD Histogram > 2.00 → 40 punti
        </p>

        <p>
            MACD Histogram > 1.00 → 30 punti
        </p>

        <p>
            MACD Histogram > 0.00 → 20 punti
        </p>

        <p>
            MACD Histogram ≤ 0.00 → 0 punti
        </p>

    `;
}
if(type === "volumeRatio"){

    html = `

        <h3>Volume Ratio</h3>

        <p>
            Volume Ratio misura il rapporto tra il volume della seduta corrente e il volume medio degli ultimi 20 giorni.
        </p>

        <p>
            Consente di valutare il livello di partecipazione del mercato al movimento in corso.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Volume Ratio =
            Volume Attuale /
            Volume Medio 20 Giorni
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un valore superiore a 1 indica che il volume attuale è superiore alla media.
        </p>

        <p>
            Valori elevati suggeriscono un maggiore interesse degli investitori verso il titolo.
        </p>

        <p>
            L'aumento dei volumi rende generalmente più affidabili i segnali tecnici.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            20 punti su 100 dell'Entry Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            Volume Ratio ≥ 2.00 → 20 punti
        </p>

        <p>
            Volume Ratio ≥ 1.50 → 15 punti
        </p>

        <p>
            Volume Ratio ≥ 1.20 → 10 punti
        </p>

        <p>
            Volume Ratio ≥ 1.00 → 5 punti
        </p>

        <p>
            Volume Ratio < 1.00 → 0 punti
        </p>

    `;
}
if(type === "tangoDelta"){

    html = `

        <h3>Tango Delta</h3>

        <p>
            Tango Delta misura la differenza tra la qualità dell'ingresso e la qualità del trend.
        </p>

        <p>
            Consente di individuare situazioni in cui il momentum di breve periodo è più forte o più debole rispetto alla struttura complessiva del trend.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Tango Delta =
            Tango Entry − Tango Index
        </p>

        <br>

        <h4>Componenti</h4>

<div
    class="docItem"
    onclick="showIndicatorDoc('tangoEntry')"
>
    Tango Entry
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('tangoIndex')"
>
    Tango Index
</div>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un valore positivo indica che la qualità dell'ingresso è superiore alla qualità del trend.
        </p>

        <p>
            Un valore negativo indica che il trend è più forte delle condizioni di ingresso attuali.
        </p>

        <p>
            Valori vicini allo zero indicano un buon allineamento tra struttura del trend e momentum operativo.
        </p>



    `;
}
if(type === "trendIndex"){

    html = `

        <h3>Trend Index</h3>

        <p>
            Misura la qualità strutturale del trend attraverso l'analisi combinata di trend di lungo periodo, allineamento delle medie mobili, vicinanza ai massimi annuali e qualità della volatilità.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Trend Index =
            Trend Strength +
            SMA Spread +
            Distance 52W High +
            Volatility Score
        </p>

        <br>

        <h4>Componenti</h4>

<div
    class="docItem"
    onclick="showIndicatorDoc('trendStrength')"
>
    Trend Strength
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('smaSpread')"
>
    SMA Spread
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('distance52wHigh')"
>
    Distance 52W High
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('volatilityScore')"
>
    Volatility Score
</div>

        <br>

        <h4>Peso dei componenti</h4>

        <p>
            Trend Strength → 40 punti
        </p>

        <p>
            SMA Spread → 25 punti
        </p>

        <p>
            Distance 52W High → 25 punti
        </p>

        <p>
            Volatility Score → 10 punti
        </p>

        <br>

        <h4>Punteggio massimo</h4>

        <p>
            100 punti.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Trend Index rappresenta la componente strutturale del Tango Index e viene combinato con il Momentum Index per determinare la qualità complessiva del trend.
        </p>

    `;
}
if(type === "trendStrength"){

    html = `

        <h3>Trend Strength</h3>

        <p>
            Misura la distanza percentuale tra il prezzo attuale e la SMA200, valutando la forza strutturale del trend di lungo periodo.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Trend Strength =
            ((Prezzo Attuale - SMA200) / SMA200) × 100
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Trend Strength è uno dei quattro componenti del Trend Index.
        </p>

        <p>
            Maggiore è la distanza positiva dalla SMA200, maggiore sarà il contributo al Trend Index.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            40 punti su 100 del Trend Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>> 60% → 40 punti</p>
        <p>> 40% → 35 punti</p>
        <p>> 30% → 30 punti</p>
        <p>> 20% → 25 punti</p>
        <p>> 10% → 20 punti</p>
        <p>> 0% → 15 punti</p>
        <p>> -10% → 10 punti</p>
        <p>> -20% → 5 punti</p>
        <p>≤ -20% → 0 punti</p>

    `;
}

if(type === "smaSpread"){

    html = `

        <h3>SMA Spread</h3>

        <p>
            Misura la separazione tra la media mobile a 50 giorni e la media mobile a 200 giorni.
        </p>

        <p>
            È uno dei principali indicatori utilizzati per valutare la qualità strutturale del trend.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            SMA Spread =
            ((SMA50 - SMA200) / SMA200) × 100
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Quando la SMA50 si trova molto sopra la SMA200 significa che il trend di medio periodo è nettamente più forte del trend di lungo periodo.
        </p>

        <p>
            Valori elevati indicano una struttura rialzista solida e consolidata.
        </p>

        <p>
            Valori vicini a zero indicano una fase neutrale.
        </p>

        <p>
            Valori negativi indicano una struttura debole o ribassista.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            25 punti su 100 del Trend Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>> 25% → 25 punti</p>

        <p>> 15% → 20 punti</p>

        <p>> 5% → 10 punti</p>

        <p>> 0% → 5 punti</p>

        <p>< 0% → 0 punti</p>

    `;
}

if(type === "distance52wHigh"){

    html = `

        <h3>Distance 52W High</h3>

        <p>
            Misura la distanza percentuale tra il prezzo attuale e il massimo registrato nelle ultime 52 settimane.
        </p>

        <p>
            È uno degli indicatori più importanti per valutare la leadership di un titolo.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Distance 52W High =
            ((Prezzo Attuale - Massimo 52 Settimane) / Massimo 52 Settimane) × 100
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            I titoli che si trovano vicino ai propri massimi annuali tendono ad essere quelli più forti del mercato.
        </p>

        <p>
            Valori vicini a zero indicano che il titolo sta testando o superando i massimi annuali.
        </p>

        <p>
            Valori molto negativi indicano che il prezzo è ancora distante dai livelli di forza precedenti.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            25 punti su 100 del Trend Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            ≥ -5% → 25 punti
        </p>

        <p>
            ≥ -10% → 20 punti
        </p>

        <p>
            ≥ -20% → 15 punti
        </p>

        <p>
            ≥ -30% → 10 punti
        </p>

        <p>
            < -30% → 0 punti
        </p>

    `;
}

if(type === "volatilityScore"){

    html = `

        <h3>Volatility Score</h3>

        <p>
            Misura la qualità della volatilità del titolo utilizzando l'ATR in rapporto al prezzo medio.
        </p>

        <p>
            L'obiettivo è favorire i titoli con una volatilità equilibrata, evitando sia i movimenti troppo lenti sia quelli eccessivamente instabili.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            ATR % =
            (ATR14 / Bollinger Middle) × 100
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Una volatilità moderata tende a favorire trend più sostenibili e prevedibili.
        </p>

        <p>
            Volatilità troppo elevata può indicare instabilità e maggiore rischio operativo.
        </p>

        <p>
            Volatilità troppo bassa può indicare assenza di movimento e scarso interesse del mercato.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            10 punti su 100 del Trend Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            ATR% tra 1% e 4% → 10 punti
        </p>

        <p>
            ATR% fino a 6% → 7 punti
        </p>

        <p>
            ATR% fino a 8% → 4 punti
        </p>

        <p>
            ATR% oltre 8% → 0 punti
        </p>

    `;
}
if(type === "momentumIndex"){

    html = `

        <h3>Momentum Index</h3>

        <p>
            Misura l'accelerazione e la forza del movimento attraverso l'analisi combinata di RSI, MACD, EMA e volumi.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Momentum Index =
            RSI Slope +
            MACD Histogram Slope +
            EMA Spread Slope +
            Volume Slope
        </p>

        <br>

        <h4>Componenti</h4>

<div
    class="docItem"
    onclick="showIndicatorDoc('rsiSlope')"
>
    RSI Slope
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('macdHistogramSlope')"
>
    MACD Histogram Slope
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('emaSpreadSlope')"
>
    EMA Spread Slope
</div>

<div
    class="docItem"
    onclick="showIndicatorDoc('volumeSlope')"
>
    Volume Slope
</div>

        <br>

        <h4>Peso dei componenti</h4>

        <p>
            RSI Slope → 30 punti
        </p>

        <p>
            MACD Histogram Slope → 30 punti
        </p>

        <p>
            EMA Spread Slope → 20 punti
        </p>

        <p>
            Volume Slope → 20 punti
        </p>

        <br>

        <h4>Punteggio massimo</h4>

        <p>
            100 punti.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Momentum Index rappresenta la componente dinamica del Tango Index e misura la velocità con cui il trend sta accelerando o rallentando.
        </p>

    `;
}
if(type === "rsiSlope"){

    html = `

        <h3>RSI Slope</h3>

        <p>
            Misura la velocità di variazione dell'RSI nelle ultime 10 sessioni.
        </p>

        <p>
            Non valuta il livello assoluto dell'RSI, ma la sua accelerazione nel tempo.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            RSI Slope = Pendenza della regressione lineare
            applicata agli ultimi 10 valori di RSI.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            RSI Slope misura l'accelerazione del momentum.
        </p>

        <p>
            Un RSI in crescita genera un contributo positivo al Momentum Index.
        </p>

        <p>
            Un RSI in rallentamento o in discesa riduce il contributo.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            30 punti su 100 del Momentum Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            > 3.0 → 30 punti
        </p>

        <p>
            > 2.0 → 25 punti
        </p>

        <p>
            > 1.0 → 20 punti
        </p>

        <p>
            > 0.0 → 10 punti
        </p>

        <p>
            ≤ 0.0 → 0 punti
        </p>

    `;
}

if(type === "macdHistogramSlope"){

    html = `

        <h3>MACD Histogram Slope</h3>

        <p>
            Misura l'accelerazione del MACD Histogram nelle ultime 10 sessioni.
        </p>

        <p>
            È uno dei componenti più importanti del Momentum Index poiché consente di individuare l'aumento o il rallentamento della forza del movimento prima che sia evidente sul prezzo.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            MACD Histogram Slope = Pendenza della regressione lineare
            applicata agli ultimi 10 valori del MACD Histogram.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un valore crescente indica un'accelerazione del momentum.
        </p>

        <p>
            Un valore decrescente indica una perdita di forza del movimento.
        </p>

        <p>
            Il MACD Histogram viene utilizzato perché misura la distanza tra MACD e Signal Line, anticipando spesso i cambiamenti di momentum.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            30 punti su 100 del Momentum Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            > 0.30 → 30 punti
        </p>

        <p>
            > 0.20 → 25 punti
        </p>

        <p>
            > 0.10 → 20 punti
        </p>

        <p>
            > 0.00 → 10 punti
        </p>

        <p>
            ≤ 0.00 → 0 punti
        </p>

    `;
}
if(type === "emaSpreadSlope"){

    html = `

        <h3>EMA Spread Slope</h3>

        <p>
            Misura la velocità di variazione della distanza tra EMA12 ed EMA26 nelle ultime 10 sessioni.
        </p>

        <p>
            Consente di valutare se il trend sta accelerando o rallentando nel breve periodo.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            EMA Spread =
            ((EMA12 - EMA26) / EMA26) × 100
        </p>

        <p>
            EMA Spread Slope =
            Pendenza della regressione lineare applicata agli ultimi 10 valori di EMA Spread.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un aumento dell'EMA Spread indica che la media veloce sta allontanandosi dalla media lenta.
        </p>

        <p>
            Questo comportamento è tipico dei trend in accelerazione.
        </p>

        <p>
            Una diminuzione dell'EMA Spread indica invece una perdita di forza del movimento.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            20 punti su 100 del Momentum Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            > 0.50 → 20 punti
        </p>

        <p>
            > 0.25 → 15 punti
        </p>

        <p>
            > 0.10 → 10 punti
        </p>

        <p>
            > 0.00 → 5 punti
        </p>

        <p>
            ≤ 0.00 → 0 punti
        </p>

    `;
}

if(type === "volumeSlope"){

    html = `

        <h3>Volume Slope</h3>

        <p>
            Misura la velocità di variazione dei volumi rispetto alla media degli ultimi 20 giorni.
        </p>

        <p>
            Consente di individuare l'ingresso progressivo di interesse da parte del mercato.
        </p>

        <br>

        <h4>Formula</h4>

        <p>
            Volume Ratio =
            Volume Attuale / Volume Medio 20 Giorni
        </p>

        <p>
            Volume Slope =
            Pendenza della regressione lineare applicata agli ultimi 10 valori di Volume Ratio.
        </p>

        <br>

        <h4>Ruolo nel sistema</h4>

        <p>
            Un Volume Slope positivo indica che i volumi stanno aumentando nel tempo.
        </p>

        <p>
            L'aumento progressivo dei volumi è spesso associato ad un crescente interesse degli investitori.
        </p>

        <p>
            Volumi in accelerazione rendono più affidabili i segnali di trend e momentum.
        </p>

        <br>

        <h4>Peso massimo</h4>

        <p>
            20 punti su 100 del Momentum Index.
        </p>

        <br>

        <h4>Conversione in punteggio</h4>

        <p>
            > 0.10 → 20 punti
        </p>

        <p>
            > 0.05 → 15 punti
        </p>

        <p>
            > 0.02 → 10 punti
        </p>

        <p>
            > 0.00 → 5 punti
        </p>

        <p>
            ≤ 0.00 → 0 punti
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
function getTrendLabel(value)
{
    if (value >= 90)
        return "🟣 Esplosivo";

    if (value >= 75)
        return "🔵 Molto Forte";

    if (value >= 60)
        return "🟢 Forte";

    if (value >= 45)
        return "🟡 Costruttivo";

    if (value >= 30)
        return "🟠 Debole";

    if (value >= 15)
        return "🔴 Fragile";

    return "⚫ Nullo";
}

function getEntryLabel(value)
{
    if (value >= 80)
        return "🟣 Perfetta";

    if (value >= 65)
        return "🔵 Ottima";

    if (value >= 50)
        return "🟢 Buona";

    if (value >= 35)
        return "🟡 Discreta";

    if (value >= 20)
        return "🟠 Debole";

    if (value >= 10)
        return "🔴 Rischiosa";

    return "⚫ Da non Considerare";
}

function getDeltaLabel(value)
{
    if (value >= 20)
        return "🟣 Occasione Eccezionale";

    if (value >= 10)
        return "🔵 Buona Occasione";

    if (value >= 5)
        return "🟢 Interessante";

    if (value >= -5)
        return "🟡 Occasione";

    if (value >= -15)
        return "🟠 Equilibrato";

    if (value >= -30)
        return "🔴 Da Attendere";

    return "⚫ Poco Attraente";
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
    tango_index,
    tango_entry,
    tango_delta
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
        (technicalMap[a.symbol]?.tango_index || 0)
        -
        (technicalMap[b.symbol]?.tango_index || 0)
    );

}

if(currentSort === "tiDesc"){

    data.sort((a,b) =>
        (technicalMap[b.symbol]?.tango_index || 0)
        -
        (technicalMap[a.symbol]?.tango_index || 0)
    );

}

if(currentSort === "teAsc"){

    data.sort((a,b) =>
        (technicalMap[a.symbol]?.tango_entry|| 0)
        -
        (technicalMap[b.symbol]?.tango_entry || 0)
    );

}

if(currentSort === "teDesc"){

    data.sort((a,b) =>
        (technicalMap[b.symbol]?.tango_entry || 0)
        -
        (technicalMap[a.symbol]?.tango_entry || 0)
    );

}
if(currentSort === "tdAsc"){

    data.sort((a,b) =>
        (technicalMap[a.symbol]?.tango_delta || 0)
        -
        (technicalMap[b.symbol]?.tango_delta || 0)
    );

}

if(currentSort === "tdDesc"){

    data.sort((a,b) =>
        (technicalMap[b.symbol]?.tango_delta || 0)
        -
        (technicalMap[a.symbol]?.tango_delta || 0)
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

<div>
Trend =
${
    getTrendLabel(
        technicalMap[item.symbol]?.tango_index || 0
    )
}
</div>

<div>
Entrata =
${
    getEntryLabel(
        technicalMap[item.symbol]?.tango_entry || 0
    )
}
</div>

<div>
Opportunità =
${
    getDeltaLabel(
        technicalMap[item.symbol]?.tango_delta || 0
    )
}
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
<div>Tango Index</div>
<div>${data.tango_index}</div>

<div>Tango Entry</div>
<div>${data.tango_entry}</div>

<div>Tango Delta</div>
<div>${data.tango_delta}</div>

            <div>────────────</div>
            <div></div>

<div>Trend Index</div>
<div>${data.trend_index}</div>

<div>Momentum Index</div>
<div>${data.momentum_index}</div>

<div>Entry Index</div>
<div>${data.entry_index}</div>

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
.getElementById("tdAsc")
.addEventListener("click", () => {

    currentSort = "tdAsc";

    loadWatchlist();

});

document
.getElementById("tdDesc")
.addEventListener("click", () => {

    currentSort = "tdDesc";

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
