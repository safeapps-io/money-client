import { derived } from 'svelte/store';
import { date, _ } from 'svelte-i18n';
import { differenceInCalendarDays } from 'date-fns';

export const relativeDate = derived([_, date], ([$_, $date]) => (dt: number | Date) => {
  const diff = differenceInCalendarDays(new Date(), dt);
  if (diff === 0) return $_('common.date.today');
  else if (diff === 1) return $_('common.date.yesterday');

  return $date(dt, { format: 'short' });
});
