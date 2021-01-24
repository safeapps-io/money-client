const logdata: any[] = [],
  count = 200;

export const debugLog = (message: string, ...data: any[]) => {
  console.debug(message, ...data);
  if (logdata.length > count) logdata.shift();
  logdata.push({ message, data });
};

export const getLogData = () => logdata;
