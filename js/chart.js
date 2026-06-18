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

loadChart(symbol);

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
