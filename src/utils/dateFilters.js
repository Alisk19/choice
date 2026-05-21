import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
  parseISO,
  isValid
} from 'date-fns';

export const DATE_RANGES = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Last 6 Months',
  'This Year',
  'Last Year',
  'Past 2 Years',
  'Past 5 Years',
  'All Time',
  'Custom Date Range'
];

export const getDateRangeBounds = (range, customStart = null, customEnd = null) => {
  const now = new Date();
  
  if (range === 'All Time') {
    return { start: new Date(2000, 0, 1), end: endOfDay(now) };
  }

  if (range === 'Custom Date Range' && customStart && customEnd) {
    return { start: startOfDay(customStart), end: endOfDay(customEnd) };
  }

  let start, end;
  
  switch (range) {
    case 'Today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'Yesterday':
      const yesterday = subDays(now, 1);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;
    case 'Last 7 Days':
      start = startOfDay(subDays(now, 6)); // Includes today
      end = endOfDay(now);
      break;
    case 'Last 30 Days':
      start = startOfDay(subDays(now, 29));
      end = endOfDay(now);
      break;
    case 'This Month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'Last Month':
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;
    case 'Last 3 Months':
      start = startOfMonth(subMonths(now, 3));
      end = endOfMonth(now);
      break;
    case 'Last 6 Months':
      start = startOfMonth(subMonths(now, 6));
      end = endOfMonth(now);
      break;
    case 'This Year':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    case 'Last Year':
      const lastYear = subYears(now, 1);
      start = startOfYear(lastYear);
      end = endOfYear(lastYear);
      break;
    case 'Past 2 Years':
      start = startOfYear(subYears(now, 2));
      end = endOfYear(now);
      break;
    case 'Past 5 Years':
      start = startOfYear(subYears(now, 5));
      end = endOfYear(now);
      break;
    default: // fallback to 'This Month'
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
  }

  return { start, end };
};

export const isDateWithinRange = (dateString, bounds) => {
  if (!dateString) return false;
  try {
    let d;
    if (typeof dateString === 'string') {
      d = parseISO(dateString);
    } else if (typeof dateString.toDate === 'function') {
      d = dateString.toDate();
    } else if (dateString instanceof Date) {
      d = dateString;
    } else {
      d = new Date(dateString);
    }

    if (!isValid(d)) return false;
    return isWithinInterval(d, { start: bounds.start, end: bounds.end });
  } catch {
    return false;
  }
};
