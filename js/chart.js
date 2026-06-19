let chart = null;
let candleSeries = null;

let sma50Visible = false;
let sma50Data = [];
let sma200Visible = false;
let sma200Data = [];
let ema12Visible = false;
let ema12Data = [];

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

sma50Visible = false;
sma200Visible = false;
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
        .getElementById("closeChartBtn")
        ?.addEventListener("click", () => {

            document.getElementById(
                "chartModal"
            ).style.display = "none";

        });

});
