let chart = null;
let candleSeries = null;
let macdChart = null;
let rsiChart = null;
let rsiLineSeries = null;
let rsiData = [];
let rsiVisible = false;
function resizeMainChart()
{
    let height = 680;

    if (macdVisible)
    {
        height -= 180;
    }

    if (rsiVisible)
    {
        height -= 180;
    }

    document.getElementById(
        "chartContainer"
    ).style.height =
        `${height}px`;

    const currentRange =
        chart
            .timeScale()
            .getVisibleLogicalRange();

    chart.resize(
        document.getElementById(
            "chartContainer"
        ).clientWidth,
        height
    );

    if (currentRange)
    {
        chart
            .timeScale()
            .setVisibleLogicalRange(
                currentRange
            );
    }
}
let macdLineSeries = null;
let signalLineSeries = null;
let histogramMacdSeries = null;
let sma50Visible = false;
let sma50Data = [];
let sma200Visible = false;
let sma200Data = [];
let ema12Visible = false;
let ema12Data = [];
let ema26Visible = false;
let ema26Data = [];
let bollingerVisible = false;

let bollingerUpperData = [];
let bollingerMiddleData = [];
let bollingerLowerData = [];
let bollingerCloudData = [];
let macdData = [];
let signalData = [];
let histogramData = [];
let macdVisible = false;
let macdPane = null;
let macdSeries = null;
let signalSeries = null;
let histogramSeries = null;

function openChart(symbol) {

    document.getElementById("chartTitle").innerText =
        `Grafico ${symbol}`;

    document.getElementById("chartModal").style.display =
        "flex";

    const container =
        document.getElementById("chartContainer");
container.style.position =
    "relative";
const macdContainer =
    document.getElementById(
        "macdContainer"
    );
const rsiContainer =
    document.getElementById(
        "rsiContainer"
    );

container.innerHTML = "";
macdContainer.innerHTML = "";
rsiContainer.innerHTML = "";


    if (chart) {

        chart.remove();

    }
if (macdChart) {

    macdChart.remove();

}
if (rsiChart) {

    rsiChart.remove();

}

chart =
    LightweightCharts.createChart(
        container,
        {
            width: container.clientWidth,
            height: container.clientHeight
        }
    );
macdChart =
    LightweightCharts.createChart(
        macdContainer,
        {
            width:
                macdContainer.clientWidth,
            height: 180
        }
    );
rsiChart =
    LightweightCharts.createChart(
        rsiContainer,
        {
            width:
                rsiContainer.clientWidth,
            height: 180
        }
    );
let isSyncing = false;

chart
    .timeScale()
    .subscribeVisibleLogicalRangeChange(
        range =>
{
    if (
        !range ||
        isSyncing
    )
    {
        return;
    }

    isSyncing = true;

    macdChart
        .timeScale()
        .setVisibleLogicalRange(
            range
        );

    rsiChart
        .timeScale()
        .setVisibleLogicalRange(
            range
        );

    isSyncing = false;
});

macdContainer.style.position =
    "relative";

const oldLegend =
    document.getElementById(
        "macdLegend"
    );

if (oldLegend)
{
    oldLegend.remove();
}
const oldBollLegend =
    document.getElementById(
        "bollingerLegend"
    );

if (oldBollLegend)
{
    oldBollLegend.remove();
}
const bollLegend =
    document.createElement("div");

bollLegend.id =
    "bollingerLegend";

bollLegend.innerHTML = `
<div
    id="bollUpperValue"
    style="
        color:#38bdf8;
        font-weight:600;
    "
>
    BOLL U: --
</div>

<div
    id="bollMiddleValue"
    style="
        color:#f97316;
        font-weight:600;
        margin-top:3px;
    "
>
    BOLL M: --
</div>

<div
    id="bollLowerValue"
    style="
        color:#38bdf8;
        font-weight:600;
        margin-top:3px;
    "
>
    BOLL L: --
</div>
`;

bollLegend.style.position =
    "absolute";

bollLegend.style.top =
    "40px";

bollLegend.style.left =
    "15px";

bollLegend.style.zIndex =
    "99999";

bollLegend.style.background =
    "rgba(255,255,255,0.7)";

bollLegend.style.padding =
    "4px 8px";

bollLegend.style.borderRadius =
    "4px";
bollLegend.style.color =
    "#000";

bollLegend.style.fontSize =
    "12px";

bollLegend.style.fontWeight =
    "600";

bollLegend.style.display =
    "none";

container.appendChild(
    bollLegend
);
const ohlcLegend =
    document.createElement("div");

ohlcLegend.id =
    "ohlcLegend";

ohlcLegend.innerHTML = `
<div id="ohlcOpen">O: --</div>
<div id="ohlcHigh">H: --</div>
<div id="ohlcLow">L: --</div>
<div id="ohlcClose">C: --</div>
<div id="ohlcChange">Δ: --</div>
`;

ohlcLegend.style.position =
    "absolute";

ohlcLegend.style.top =
    "40px";

ohlcLegend.style.right =
    "90px";

ohlcLegend.style.zIndex =
    "99999";

ohlcLegend.style.background =
    "rgba(255,255,255,0.7)";

ohlcLegend.style.padding =
    "4px 8px";

ohlcLegend.style.borderRadius =
    "4px";

ohlcLegend.style.color =
    "#000";

ohlcLegend.style.fontSize =
    "12px";

ohlcLegend.style.fontWeight =
    "600";

container.appendChild(
    ohlcLegend
);

const legend =
    document.createElement("div");

legend.id = "macdLegend";

legend.innerHTML = `
<span id="macdValue"
style="
color:#3b82f6;
font-weight:600;
">
■ MACD: --
</span>

<span id="signalValue"
style="
margin-left:15px;
color:#f97316;
font-weight:600;
">
■ Signal: --
</span>

<span id="histogramValue"
style="
margin-left:15px;
font-weight:600;
">
Hist: --
</span>
`;

legend.style.position =
    "absolute";

legend.style.top = "8px";

legend.style.left = "10px";

legend.style.zIndex = "1000";

legend.style.fontSize = "12px";

legend.style.background =
    "rgba(255,255,255,0.7)";

legend.style.padding =
    "4px 8px";

legend.style.borderRadius =
    "4px";

macdContainer.appendChild(
    legend
);
const rsiLegend =
    document.createElement("div");

rsiLegend.id =
    "rsiLegend";

rsiLegend.innerHTML = `
<span
    id="rsiValue"
    style="
        color:#a855f7;
        font-weight:600;
    "
>
    RSI: --
</span>
`;

rsiLegend.style.position =
    "absolute";

rsiLegend.style.top =
    "8px";

rsiLegend.style.left =
    "10px";

rsiLegend.style.zIndex =
    "1000";

rsiLegend.style.fontSize =
    "12px";

rsiLegend.style.background =
    "rgba(255,255,255,0.7)";

rsiLegend.style.padding =
    "4px 8px";

rsiLegend.style.borderRadius =
    "4px";

rsiContainer.appendChild(
    rsiLegend
);

macdChart.subscribeCrosshairMove(
    param =>
{
    if (
        !param ||
        !param.time
    )
    {
        return;
    }

    const macdPoint =
        macdData.find(
            x =>
                x.time ===
                param.time
        );

    const signalPoint =
        signalData.find(
            x =>
                x.time ===
                param.time
        );

    const histPoint =
        histogramData.find(
            x =>
                x.time ===
                param.time
        );

    if (macdPoint)
    {
        document.getElementById(
            "macdValue"
        ).innerHTML =
            `■ MACD: ${macdPoint.value}`;
    }

    if (signalPoint)
    {
        document.getElementById(
            "signalValue"
        ).innerHTML =
            `■ Signal: ${signalPoint.value}`;
    }

    if (histPoint)
    {
        document.getElementById(
            "histogramValue"
        ).innerHTML =
            `Hist: ${histPoint.value}`;
    }
});
let isCrosshairSyncing =
    false;
chart.subscribeCrosshairMove(
    param =>
{

if (
    !param ||
    !param.time ||
    !param.point
)
{
    return;
}

if (
    isCrosshairSyncing
)
{
    return;
}

isCrosshairSyncing =
    true;

    const macdPoint =
        macdData.find(
            x =>
                x.time ===
                param.time
        );

    const signalPoint =
        signalData.find(
            x =>
                x.time ===
                param.time
        );

    const histPoint =
        histogramData.find(
            x =>
                x.time ===
                param.time
        );
const bollUpperPoint =
    bollingerUpperData.find(
        x =>
            x.time ===
            param.time
    );

const bollMiddlePoint =
    bollingerMiddleData.find(
        x =>
            x.time ===
            param.time
    );

const bollLowerPoint =
    bollingerLowerData.find(
        x =>
            x.time ===
            param.time
    );
const candlePoint =
    candleSeries.data().find(
        x =>
            x.time ===
            param.time
    );
const rsiPoint =
    rsiData.find(
        x =>
            x.time ===
            param.time
    );


    if (macdPoint)
    {
        document.getElementById(
            "macdValue"
        ).innerHTML =
            `■ MACD: ${macdPoint.value}`;
    }

    if (signalPoint)
    {
        document.getElementById(
            "signalValue"
        ).innerHTML =
            `■ Signal: ${signalPoint.value}`;
    }

    if (histPoint)
    {
        document.getElementById(
            "histogramValue"
        ).innerHTML =
            `Hist: ${histPoint.value}`;
    }
if (
    bollingerVisible &&
    bollUpperPoint
)
{
    document.getElementById(
        "bollUpperValue"
    ).innerHTML =
        `BOLL U: ${bollUpperPoint.value}`;
}

if (
    bollingerVisible &&
    bollMiddlePoint
)
{
    document.getElementById(
        "bollMiddleValue"
    ).innerHTML =
        `BOLL M: ${bollMiddlePoint.value}`;
}

if (
    bollingerVisible &&
    bollLowerPoint
)
{
    document.getElementById(
        "bollLowerValue"
    ).innerHTML =
        `BOLL L: ${bollLowerPoint.value}`;
}
if (candlePoint)
{
    document.getElementById(
        "ohlcOpen"
    ).innerHTML =
        `Open: ${Number(
            candlePoint.open
        ).toFixed(2)}`;

    document.getElementById(
        "ohlcHigh"
    ).innerHTML =
        `High: ${Number(
            candlePoint.high
        ).toFixed(2)}`;

    document.getElementById(
        "ohlcLow"
    ).innerHTML =
        `Low: ${Number(
            candlePoint.low
        ).toFixed(2)}`;

    document.getElementById(
        "ohlcClose"
    ).innerHTML =
        `Close: ${Number(
            candlePoint.close
        ).toFixed(2)}`;
const change =
    candlePoint.close -
    candlePoint.open;

const changePct =
    (
        change /
        candlePoint.open
    ) * 100;

document.getElementById(
    "ohlcChange"
).innerHTML =
    `Δ: ${
        change >= 0 ? "+" : ""
    }${change.toFixed(2)}
    (${
        changePct >= 0 ? "+" : ""
    }${changePct.toFixed(2)}%)`;
document.getElementById(
    "ohlcChange"
).style.color =
    change >= 0
        ? "#22c55e"
        : "#ef4444";
}
if (
    rsiVisible &&
    rsiPoint
)
{
    document.getElementById(
        "rsiValue"
    ).innerHTML =
        `RSI: ${rsiPoint.value}`;
}
if (macdPoint)
{
    try
    {
        macdChart.setCrosshairPosition(
            macdPoint.value,
            param.time,
            macdLineSeries
        );
    }
    catch (e)
    {
        console.log(
            "Crosshair sync",
            e
        );
    }
}

isCrosshairSyncing =
    false;
});

macdLineSeries =
    macdChart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#3b82f6",
            lineWidth: 2
        }
    );

signalLineSeries =
    macdChart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#f97316",
            lineWidth: 2
        }
    );

histogramMacdSeries =
    macdChart.addSeries(
        LightweightCharts.HistogramSeries,
        {}
    );
rsiLineSeries =
    rsiChart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#a855f7",
            lineWidth: 2
        }
    );
// macdPane = chart.addPane();

candleSeries =
    chart.addSeries(
        LightweightCharts.CandlestickSeries
    );

window.sma50Series =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#facc15",
            lineWidth: 2
        }
    );
window.sma200Series =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#a855f7",
            lineWidth: 2
        }
    );
window.ema12Series =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#22c55e",
            lineWidth: 2
        }
    );
window.ema26Series =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#ef4444",
            lineWidth: 2
        }
    );
window.bollingerUpperSeries =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#38bdf8",
            lineWidth: 2
        }
    );

window.bollingerMiddleSeries =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
             color: "#f97316",
            lineWidth: 2
        }
    );

window.bollingerLowerSeries =
    chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#38bdf8",
            lineWidth: 2
        }
    );
window.bollingerCloudSeries =
    chart.addSeries(
        LightweightCharts.AreaSeries,
        {
            lineColor:
                "rgba(0,0,0,0)",

            topColor:
                "rgba(56,189,248,0.05)",

            bottomColor:
                "rgba(56,189,248,0.00)"
        }
    );
macdSeries = null;
signalSeries = null;
histogramSeries = null;
sma50Visible = false;
sma200Visible = false;
ema12Visible = false;
ema26Visible = false;
bollingerVisible = false;
macdVisible = false;

document
    .getElementById("macdBtn")
    ?.classList.remove("smaActive");

document
    .getElementById("macdBtn")
    ?.classList.add("macdInactive");
document
    .getElementById("sma50Btn")
    ?.classList.remove("smaActive");

document
    .getElementById("sma50Btn")
    ?.classList.add("smaInactive");
document
    .getElementById("sma200Btn")
    ?.classList.remove("smaActive");

document
    .getElementById("sma200Btn")
    ?.classList.add("sma200Inactive");
loadChart(symbol);
document
    .getElementById("ema12Btn")
    ?.classList.remove("smaActive");

document
    .getElementById("ema12Btn")
    ?.classList.add("ema12Inactive");
document
    .getElementById("ema26Btn")
    ?.classList.remove("smaActive");

document
    .getElementById("ema26Btn")
    ?.classList.add("ema26Inactive");
document
    .getElementById("bollingerBtn")
    ?.classList.remove("smaActive");

document
    .getElementById("bollingerBtn")
    ?.classList.add("bollingerInactive");
document.getElementById(
    "macdContainer"
).style.display = "none";
document.getElementById(
    "rsiContainer"
).style.display = "none";

}
function calculateSMAHistory(
    candles,
    period
)
{
    const result = [];

    for (
        let i = period - 1;
        i < candles.length;
        i++
    )
    {
        let sum = 0;

        for (
            let j = i - period + 1;
            j <= i;
            j++
        )
        {
            sum += candles[j].close;
        }

        result.push({
            time: candles[i].time,
            value: Number(
                (
                    sum / period
                ).toFixed(2)
            )
        });
    }

    return result;
}
function calculateEMAHistory(
    candles,
    period
)
{
    const result = [];

    const multiplier =
        2 / (period + 1);

 let ema =
    candles[0].close ??
    candles[0].value;

    result.push({
        time: candles[0].time,
        value: Number(
            ema.toFixed(2)
        )
    });

    for (
        let i = 1;
        i < candles.length;
        i++
    )
    {
 const currentValue =
    candles[i].close ??
    candles[i].value;

ema =
    (
        currentValue -
        ema
    ) *
    multiplier +
    ema;

        result.push({
            time: candles[i].time,
            value: Number(
                ema.toFixed(2)
            )
        });
    }

    return result;
}
function calculateMACDHistory(
    candles
)
{
    const ema12 =
        calculateEMAHistory(
            candles,
            12
        );

    const ema26 =
        calculateEMAHistory(
            candles,
            26
        );

    const macd = [];

    for (
        let i = 0;
        i < candles.length;
        i++
    )
    {
        macd.push({

            time:
                candles[i].time,

            value: Number(
                (
                    ema12[i].value -
                    ema26[i].value
                ).toFixed(2)
            )

        });
    }

    const signal =
        calculateEMAHistory(
            macd,
            9
        );

    const histogram = [];

    for (
        let i = 0;
        i < macd.length;
        i++
    )
    {
        histogram.push({

            time:
                macd[i].time,

            value: Number(
                (
                    macd[i].value -
                    signal[i].value
                ).toFixed(2)
            )

        });
    }

    return {

        macd,
        signal,
        histogram

    };
}
function calculateRSIHistory(
    candles,
    period = 14
)
{
    const result = [];

    let gains = 0;
    let losses = 0;

    for (
        let i = 1;
        i <= period;
        i++
    )
    {
        const change =
            candles[i].close -
            candles[i - 1].close;

        if (change > 0)
        {
            gains += change;
        }
        else
        {
            losses +=
                Math.abs(change);
        }
    }

    let avgGain =
        gains / period;

    let avgLoss =
        losses / period;

    let rs =
        avgLoss === 0
            ? 100
            : avgGain / avgLoss;

    let rsi =
        100 -
        (
            100 /
            (1 + rs)
        );

    result.push({
        time:
            candles[period].time,
        value:
            Number(
                rsi.toFixed(2)
            )
    });

    for (
        let i = period + 1;
        i < candles.length;
        i++
    )
    {
        const change =
            candles[i].close -
            candles[i - 1].close;

        const gain =
            change > 0
                ? change
                : 0;

        const loss =
            change < 0
                ? Math.abs(change)
                : 0;

        avgGain =
            (
                (
                    avgGain *
                    (period - 1)
                ) +
                gain
            ) / period;

        avgLoss =
            (
                (
                    avgLoss *
                    (period - 1)
                ) +
                loss
            ) / period;

        rs =
            avgLoss === 0
                ? 100
                : avgGain /
                  avgLoss;

        rsi =
            100 -
            (
                100 /
                (1 + rs)
            );

        result.push({
            time:
                candles[i].time,
            value:
                Number(
                    rsi.toFixed(2)
                )
        });
    }

    return result;
}
function calculateBollingerHistory(
    candles,
    period,
    multiplier
)
{
    const upper = [];
    const middle = [];
    const lower = [];

    for (
        let i = period - 1;
        i < candles.length;
        i++
    )
    {
        let sum = 0;

        for (
            let j = i - period + 1;
            j <= i;
            j++
        )
        {
            sum += candles[j].close;
        }

        const sma =
            sum / period;

        let variance = 0;

        for (
            let j = i - period + 1;
            j <= i;
            j++
        )
        {
            variance += Math.pow(
                candles[j].close - sma,
                2
            );
        }

        const stdDev =
            Math.sqrt(
                variance / period
            );

        upper.push({
            time: candles[i].time,
            value: Number(
                (
                    sma +
                    stdDev *
                    multiplier
                ).toFixed(2)
            )
        });

        middle.push({
            time: candles[i].time,
            value: Number(
                sma.toFixed(2)
            )
        });

        lower.push({
            time: candles[i].time,
            value: Number(
                (
                    sma -
                    stdDev *
                    multiplier
                ).toFixed(2)
            )
        });
    }

    return {
        upper,
        middle,
        lower
    };
}
async function loadChart(symbol)
{
    const { data, error } =
        await supabaseClient
            .from("market_history")
            .select(`
                trading_date,
                open_price,
                day_high,
                day_low,
                close_price
            `)
            .eq("symbol", symbol)
            .order(
                "trading_date",
                {
                    ascending: true
                }
            );



if (error)
{
    console.error(error);
    return;
}

const candles =
    data.map(row => ({

        time: row.trading_date,

        open: Number(row.open_price),

        high: Number(row.day_high),

        low: Number(row.day_low),

        close: Number(row.close_price)

    }));

console.log(candles);

candleSeries.setData(candles);

sma50Data =
    calculateSMAHistory(
        candles,
        50
    );
sma200Data =
    calculateSMAHistory(
        candles,
        200
    );
ema12Data =
    calculateEMAHistory(
        candles,
        12
    );
ema26Data =
    calculateEMAHistory(
        candles,
        26
    );
rsiData =
    calculateRSIHistory(
        candles,
        14
    );
console.log(
    "RSI",
    rsiData.length
);
const macdResult =
    calculateMACDHistory(
        candles
    );

macdData =
    macdResult.macd;

signalData =
    macdResult.signal;


histogramData =
    macdResult.histogram;
console.log(
    "MACD",
    macdData.length
);

console.log(
    "SIGNAL",
    signalData.length
);

console.log(
    "HISTOGRAM",
    histogramData.length
);
const bollinger =
    calculateBollingerHistory(
        candles,
        20,
        2
    );

bollingerUpperData =
    bollinger.upper;

bollingerMiddleData =
    bollinger.middle;

bollingerLowerData =
    bollinger.lower;
bollingerCloudData =
    bollinger.upper.map(
        (item, index) => ({

            time: item.time,

            value:
                item.value

        })
    );
console.log(
    "BOLL UPPER",
    bollingerUpperData.length
);

console.log(
    "BOLL MIDDLE",
    bollingerMiddleData.length
);

console.log(
    "BOLL LOWER",
    bollingerLowerData.length
);
console.log(
    "EMA26 DATA",
    ema26Data.length
);
console.log(
    "EMA12 DATA",
    ema12Data.length
);


chart.timeScale().fitContent();
}
function toggleSMA50()
{
    if (!window.sma50Series)
    {
        return;
    }
const btn =
    document.getElementById(
        "sma50Btn"
    );
    if (!sma50Visible)
    {
window.sma50Series.setData(
    sma50Data
);

btn.classList.remove(
    "smaInactive"
);

btn.classList.add(
    "smaActive"
);

sma50Visible = true;
    }
    else
    {
window.sma50Series.setData([]);

btn.classList.remove(
    "smaActive"
);

btn.classList.add(
    "smaInactive"
);

sma50Visible = false;
    }
}
function toggleSMA200()
{
    if (!window.sma200Series)
    {
        return;
    }

    const btn =
        document.getElementById(
            "sma200Btn"
        );

    if (!sma200Visible)
    {
        window.sma200Series.setData(
            sma200Data
        );

btn.classList.remove(
    "sma200Inactive"
);

        btn.classList.add(
            "smaActive"
        );

        sma200Visible = true;
    }
    else
    {
        window.sma200Series.setData([]);

        btn.classList.remove(
            "smaActive"
        );

btn.classList.add(
    "sma200Inactive"
);

        sma200Visible = false;
    }
}
function toggleEMA12()
{
    if (!window.ema12Series)
    {
        return;
    }

    const btn =
        document.getElementById(
            "ema12Btn"
        );

    if (!ema12Visible)
    {
        window.ema12Series.setData(
            ema12Data
        );

        btn.classList.remove(
            "ema12Inactive"
        );

        btn.classList.add(
            "smaActive"
        );

        ema12Visible = true;
    }
    else
    {
        window.ema12Series.setData([]);

        btn.classList.remove(
            "smaActive"
        );

        btn.classList.add(
            "ema12Inactive"
        );

        ema12Visible = false;
    }
}
function toggleEMA26()
{
    if (!window.ema26Series)
    {
        return;
    }

    const btn =
        document.getElementById(
            "ema26Btn"
        );

    if (!ema26Visible)
    {
        window.ema26Series.setData(
            ema26Data
        );

        btn.classList.remove(
            "ema26Inactive"
        );

        btn.classList.add(
            "smaActive"
        );

        ema26Visible = true;
    }
    else
    {
        window.ema26Series.setData([]);

        btn.classList.remove(
            "smaActive"
        );

        btn.classList.add(
            "ema26Inactive"
        );

        ema26Visible = false;
    }
}
function toggleBollinger()
{
    if (!window.bollingerUpperSeries)
    {
        return;
    }

    const btn =
        document.getElementById(
            "bollingerBtn"
        );

    if (!bollingerVisible)
    {
        window.bollingerUpperSeries.setData(
            bollingerUpperData
        );
window.bollingerCloudSeries.setData(
    bollingerMiddleData
);

        window.bollingerMiddleSeries.setData(
            bollingerMiddleData
        );

        window.bollingerLowerSeries.setData(
            bollingerLowerData
        );

        btn.classList.remove(
            "bollingerInactive"
        );

        btn.classList.add(
            "smaActive"
        );
document.getElementById(
    "bollingerLegend"
).style.display = "block";
        bollingerVisible = true;
    }
    else
    {
        window.bollingerUpperSeries.setData([]);
window.bollingerCloudSeries.setData([]);

        window.bollingerMiddleSeries.setData([]);

        window.bollingerLowerSeries.setData([]);

        btn.classList.remove(
            "smaActive"
        );

        btn.classList.add(
            "bollingerInactive"
        );
document.getElementById(
    "bollingerLegend"
).style.display = "none";
        bollingerVisible = false;
    }
}
function toggleMACD()
{
    const btn =
        document.getElementById(
            "macdBtn"
        );

    const container =
        document.getElementById(
            "macdContainer"
        );

    if (!macdVisible)
    {
container.style.display =
    "block";


setTimeout(() =>
{
    macdChart.resize(
        container.clientWidth,
        180
    );

    const range =
        chart
            .timeScale()
            .getVisibleLogicalRange();

    if (range)
    {
        macdChart
            .timeScale()
            .setVisibleLogicalRange(
                range
            );
    }

    console.log(
        "MACD RESIZE",
        container.clientWidth
    );

}, 50);

        macdLineSeries.setData(
            macdData
        );

        signalLineSeries.setData(
            signalData
        );

        histogramMacdSeries.setData(
            histogramData.map(item => ({
                time: item.time,
                value: item.value,
                color:
                    item.value >= 0
                    ? "#22c55e"
                    : "#ef4444"
            }))
        );

        btn.classList.remove(
            "macdInactive"
        );

        btn.classList.add(
            "smaActive"
        );

        macdVisible = true;
resizeMainChart();
    }
    else
    {
container.style.display =
    "none";



        macdLineSeries.setData([]);

        signalLineSeries.setData([]);

        histogramMacdSeries.setData([]);

        btn.classList.remove(
            "smaActive"
        );

        btn.classList.add(
            "macdInactive"
        );

        macdVisible = false;
resizeMainChart();
    }
}
function toggleRSI()
{
    const btn =
        document.getElementById(
            "rsiBtn"
        );

    const container =
        document.getElementById(
            "rsiContainer"
        );

    if (!rsiVisible)
    {
        container.style.display =
            "block";


setTimeout(() =>
{
    rsiChart.resize(
        container.clientWidth,
        180
    );
}, 50);

        rsiLineSeries.setData(
            rsiData
        );

        btn.classList.remove(
            "rsiInactive"
        );

        btn.classList.add(
            "smaActive"
        );

        rsiVisible = true;
resizeMainChart();
    }
    else
    {
        container.style.display =
            "none";


        rsiLineSeries.setData(
            []
        );

        btn.classList.remove(
            "smaActive"
        );

        btn.classList.add(
            "rsiInactive"
        );

        rsiVisible = false;
resizeMainChart();
    }
}
document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("sma50Btn")
        ?.addEventListener(
            "click",
            toggleSMA50
        );
document
    .getElementById("sma200Btn")
    ?.addEventListener(
        "click",
        toggleSMA200
    );
document
    .getElementById("ema12Btn")
    ?.addEventListener(
        "click",
        toggleEMA12
    );
document
    .getElementById("ema26Btn")
    ?.addEventListener(
        "click",
        toggleEMA26
    );
document
    .getElementById("bollingerBtn")
    ?.addEventListener(
        "click",
        toggleBollinger
    );
document
    .getElementById("macdBtn")
    ?.addEventListener(
        "click",
        toggleMACD
    );
document
    .getElementById("rsiBtn")
    ?.addEventListener(
        "click",
        toggleRSI
    );
    document
        .getElementById("closeChartBtn")
        ?.addEventListener("click", () => {

            document.getElementById(
                "chartModal"
            ).style.display = "none";

        });

});
