import Papa from 'papaparse';
import type { ParsingResult, ParsingSettings } from './types';

export const parseCsv = ({
  data,
  config,
  preview,
}: {
  data: string;
  config: ParsingSettings;
  preview?: number;
}) => {
  const clearedConfig = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value ?? undefined]),
  );

  return new Promise<ParsingResult>(resolve =>
    Papa.parse<string[]>(data, {
      ...clearedConfig,
      // PapaParse's header converts data into an object. We always want an array of strings
      header: false,
      preview,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: async result => {
        const { errors, data } = result;
        resolve(
          config.header
            ? { dataRows: data.slice(1), headerRow: data[0], errors }
            : { dataRows: data, errors },
        );
      },
    }),
  );
};
