let chart = null;
let candleSeries = null;

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
                height: 500
            }
        );

candleSeries =
    chart.addSeries(
        LightweightCharts.CandlestickSeries
    );

window.sma50Series =
    chart.addSeries(
        LightweightCharts.LineSeries
    );

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
const { data: sma50Data, error: sma50Error } =
    await supabaseClient
        .from("technical_indicators")
        .select(`
            trading_date,
            sma50
        `)
        .eq("symbol", symbol)
        .order(
            "trading_date",
            {
                ascending: true
            }
        );

console.log("SMA50", sma50Data);
console.log("SMA50 ERROR", sma50Error);

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

const sma50 =
    calculateSMAHistory(
        candles,
        50
    );

window.sma50Series.setData(
    sma50
);

chart.timeScale().fitContent();
}

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("closeChartBtn")
        ?.addEventListener("click", () => {

            document.getElementById(
                "chartModal"
            ).style.display = "none";

        });

});
