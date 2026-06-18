let chart = null;

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

    const series =
        chart.addCandlestickSeries();

    series.setData([
        {
            time: "2026-06-10",
            open: 100,
            high: 110,
            low: 95,
            close: 108
        },
        {
            time: "2026-06-11",
            open: 108,
            high: 120,
            low: 105,
            close: 118
        },
        {
            time: "2026-06-12",
            open: 118,
            high: 125,
            low: 115,
            close: 121
        }
    ]);

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
