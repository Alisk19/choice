import { useState, useMemo } from 'react';
import { getDateRangeBounds, isDateWithinRange } from '../utils/dateFilters';

export function useDateFilter(defaultRange = 'All Time') {
  const [selectedRange, setSelectedRange] = useState(defaultRange);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  const bounds = useMemo(() => {
    return getDateRangeBounds(selectedRange, customStartDate, customEndDate);
  }, [selectedRange, customStartDate, customEndDate]);

  const filterDataByDate = (data, dateField = 'createdAt') => {
    if (selectedRange === 'All Time') return data;
    
    // If Custom Date Range but missing dates, return empty or all?
    // Usually return all until they select, but we'll return empty if bounds are invalid.
    if (selectedRange === 'Custom Date Range' && (!customStartDate || !customEndDate)) {
       return data; // Not applied yet
    }

    return data.filter(item => {
       const dateVal = item[dateField] || item.createdAt;
       return isDateWithinRange(dateVal, bounds);
    });
  };

  return {
    selectedRange,
    setSelectedRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    bounds,
    filterDataByDate
  };
}
