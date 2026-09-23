"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCount, toChartNumber } from "../lib/derive";
import type { BuyerMix } from "../contracts/seller-analytics.contract";

interface BuyerMixDonutProps {
  buyers: BuyerMix;
  isLoading?: boolean;
}

/**
 * New against returning buyers.
 *
 * A donut rather than two more tiles: the useful reading is the ratio, and a
 * parts-of-whole mark shows that without the reader doing arithmetic. The legend
 * carries the raw counts, since a ring alone cannot be read to a number.
 */
export function BuyerMixDonut({
  buyers,
  isLoading = false,
}: BuyerMixDonutProps) {
  if (isLoading) {
    return (
      <div className="h-[180px] w-full rounded-2xl bg-[var(--background-tertiary)] animate-pulse" />
    );
  }

  const slices = [
    {
      key: "returning",
      name: "Returning",
      value: buyers.returningBuyers,
      fill: "var(--brand-core)",
    },
    {
      key: "new",
      name: "New",
      value: buyers.newBuyers,
      fill: "var(--brand-vibrant)",
    },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background-elevated)",
                borderColor: "var(--border-default)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--text-secondary)" }}
              itemStyle={{ color: "var(--text-primary)" }}
              formatter={(value, name) => [
                `${formatCount(toChartNumber(value))} buyers`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-3 min-w-0">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: slice.fill }}
              aria-hidden="true"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              {slice.name}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {formatCount(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
