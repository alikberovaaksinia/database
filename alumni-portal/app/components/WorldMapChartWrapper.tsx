"use client";

import dynamic from "next/dynamic";

const WorldMapChart = dynamic(() => import("./WorldMapChart"), {
  ssr: false,
});

export default WorldMapChart;
