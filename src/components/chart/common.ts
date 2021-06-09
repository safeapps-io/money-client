import type { Axis } from 'd3-axis';
import type { GetLine, LineChartDataset } from './types';

import { select } from 'd3-selection';
import { addDays, differenceInDays, isAfter, max, min } from 'date-fns';

// Reexport is needed because otherwise Vite goes crazy
export { axisBottom, axisLeft } from 'd3-axis';
export { scaleUtc, scaleLinear, scaleBand } from 'd3-scale';
export { line } from 'd3-shape';

export const setAxis: Action<Axis<any>, Element> = (node, oldScale) => {
  node.id = 'b' + Math.round(Math.random() * 10000);

  const callOn = select(`#${node.id}`),
    update = (newScale: Axis<any>) => {
      // @ts-ignore
      callOn.call(newScale);
    };

  update(oldScale);
  return { update };
};

type GetLineParams = {
  data?: LineChartDataset;
  getLine?: GetLine<ArrayItem<LineChartDataset>>;
};
export const setLine: Action<GetLineParams, Element> = (node, params) => {
  node.id = 'b' + Math.round(Math.random() * 10000);
  const root = select(`#${node.id}`),
    update = ({ getLine, data = [] }: GetLineParams) => {
      if (!getLine) return;

      root.selectAll('path').remove();

      root
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 1)
        .attr('d', getLine(data) as any);
    };

  update(params);
  return { update };
};

export const fillBlankDate = (dataset: LineChartDataset) => {
  const dates = dataset.map(d => d.date),
    minDate = min(dates),
    maxDate = max(dates);

  const result: LineChartDataset = [];
  let currIndex = 0,
    prevValue = dataset[0].value;

  for (let i = 0; i < differenceInDays(maxDate, minDate); i++) {
    const currDate = addDays(minDate, i),
      currentDataPoint = dataset[currIndex];

    if (isAfter(currentDataPoint.date, currDate)) result.push({ date: currDate, value: prevValue });
    else {
      const value = currentDataPoint.value;
      result.push({ date: currDate, value });
      prevValue = value;
      currIndex++;
    }
  }

  return result;
};
