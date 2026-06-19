let chart = null;
let candleSeries = null;

let sma50Visible = false;
let sma50Data = [];
let sma200Visible = false;
let sma200Data = [];
let ema12Visible = false;
let ema12Data = [];
let ema26Visible = false;
let ema26Data = [];

function openChart(symbol) {

    document.getElementById("chartTitle").innerText =
        `Grafico ${symbol}`;

    document.getElementById("chartModal").style.display =
        "flex";

    const container =
        document.getElementById("chartContainer");

    container.innerHTML = "";

    if (chart) {

        chart.remove();

    }

chart =
    LightweightCharts.createChart(
        container,
        {
            width: container.clientWidth,
            height: container.clientHeight
        }
    );

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

sma50Visible = false;
sma200Visible = false;
ema12Visible = false;
ema26Visible = false;
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
        candles[0].close;

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
        ema =
            (
                candles[i].close -
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
        .getElementById("closeChartBtn")
        ?.addEventListener("click", () => {

            document.getElementById(
                "chartModal"
            ).style.display = "none";

        });

});
