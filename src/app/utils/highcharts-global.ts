import * as Highcharts from "highcharts";

// Highcharts 8.1.1's ES-module build refers to a global `Highcharts` when it
// draws an empty pie chart (PieSeries.drawEmpty), which throws
// "Highcharts is not defined" whenever a dashboard pie has no data. Exposing the
// same instance the app imports fixes that until Highcharts is upgraded.
const w = window as any;
if (!w.Highcharts) {
  w.Highcharts = Highcharts;
}
