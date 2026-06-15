function openChart(symbol) {

    document.getElementById("chartTitle").innerText =
        `Grafico ${symbol}`;

    document.getElementById("chartModal").style.display =
        "flex";

}

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("closeChartBtn")
        ?.addEventListener("click", () => {

            document.getElementById("chartModal").style.display =
                "none";

        });

});
