import {
  startOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  minTime,
  maxTime,
} from 'date-fns';
import { SearchFilterDatePeriods } from '@/stores/decr/types';

export const getSearchFilterDates = ({
  group,
  page,
  today = startOfDay(new Date()),
}: {
  group: SearchFilterDatePeriods;
  page: number;
  today?: Date;
}): { startDate: number; endDate: number; prevStartDate?: number } => {
  let startFn,
    endFn,
    subtractorFn,
    havePrev = true;

  switch (group) {
    case SearchFilterDatePeriods.month:
      startFn = startOfMonth;
      endFn = endOfMonth;
      subtractorFn = subMonths;
      break;

    case SearchFilterDatePeriods.quarter:
      startFn = startOfQuarter;
      endFn = endOfQuarter;
      subtractorFn = subQuarters;
      break;

    case SearchFilterDatePeriods.year:
      startFn = startOfYear;
      endFn = endOfYear;
      subtractorFn = subYears;
      break;

    case SearchFilterDatePeriods.all:
    default:
      havePrev = false;
      subtractorFn = (d: Date) => d;
      startFn = () => new Date(minTime);
      endFn = () => new Date(maxTime);
  }

  const startDate = subtractorFn(startFn(today), page).getTime(),
    endDate = endFn(startDate).getTime(),
    prevStartDate = havePrev ? subtractorFn(startDate, page + 1).getTime() : undefined;

  /**
   * We always return both start and end dates.
   *
   * If we have date filters, they have priority over grouping. We use them as start and end.
   * User could have set only one of them; in that case we set the other one to min or max time ever.
   *
   * If we don't have date filters, then we calculate period's start and end date and the start of a previous
   * date period. For `all` we have a start and end of min and max time ever.
   */
  return { startDate: startDate || minTime, endDate: endDate || maxTime, prevStartDate };
};
