import type { axisBottom } from 'd3';
import type { ScaleBand, ScaleLinear, ScaleTime } from 'd3-scale';
import type { Line } from 'd3-shape';

export type DateData = { date: Date };
export type IdBasedData = { id: string; label?: string; color?: string };
export type NumberData = { value: number };

export type LineChartDataset = (DateData & NumberData)[];
export type BarChartDataset = (IdBasedData & NumberData)[];

export type XTime = ScaleTime<number, number, never>;
export type XBand = ScaleBand<string>;
export type YValue = ScaleLinear<number, number, never>;
export type AxisBuilder = typeof axisBottom;

export type GetLine<T> = Line<T>;
