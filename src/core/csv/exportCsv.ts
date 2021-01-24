import Papa from 'papaparse';

export const exportCSV = (data: Object[]): string => Papa.unparse(data, { escapeFormulae: true });
