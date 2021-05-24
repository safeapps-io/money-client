import type { ChartConfiguration } from 'chart.js';
import Chart from 'chart.js';

import { getObjectHash } from '$utils/getObjectHash';
import { copy } from '$utils/object';

export const chartjs: Action<ChartConfiguration, HTMLCanvasElement> = (node, params) => {
  let oldParams = copy(params),
    instance = new Chart(node, params);

  return {
    update: async newParams => {
      const [oldHash, newHash] = await Promise.all([
        getObjectHash(oldParams),
        getObjectHash(newParams),
      ]);
      if (oldHash !== newHash) {
        oldParams = copy(newParams);

        instance.destroy();
        instance = new Chart(node, newParams);
      }
    },
    destroy: () => instance.destroy(),
  };
};
