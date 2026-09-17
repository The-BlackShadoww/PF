"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ModernChartProps = {
  type: "area" | "bar" | "donut";
  series: number[] | Array<{ name: string; data: number[] }>;
  options: ApexOptions;
  height?: number;
};

export function ModernChart({ type, series, options, height = 280 }: ModernChartProps) {
  return <ApexChart type={type} series={series} options={options} height={height} width="100%" />;
}

export function chartBase(): ApexOptions {
  return {
    chart: { toolbar: { show: false }, fontFamily: "Inter, Arial, sans-serif", animations: { easing: "easeinout", speed: 500 } },
    grid: { borderColor: "var(--ds-chart-grid)", strokeDashArray: 4, padding: { left: 0, right: 6 } },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark", style: { fontSize: "12px" }, x: { show: true } },
    legend: { show: false },
  };
}
