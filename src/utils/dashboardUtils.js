export const DATE_PRESETS = {
  TODAY: "TODAY",
  THIS_WEEK: "THIS_WEEK",
  LAST_WEEK: "LAST_WEEK",
  LAST_MONTH: "LAST_MONTH",
  LAST_3_MONTHS: "LAST_3_MONTHS",
  LAST_6_MONTHS: "LAST_6_MONTHS",
  LAST_YEAR: "LAST_YEAR",
  CUSTOM: "CUSTOM",
};

export const getDashboardDateRange = (presetKey, customStart, customEnd) => {
  const now = new Date();

  let endDate;
  if (customEnd) {
    endDate = new Date(customEnd);
    if (isNaN(endDate.getTime())) endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    else endDate.setHours(23, 59, 59, 999);
  } else {
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  let startDate = new Date(endDate);

  switch (presetKey) {
    case DATE_PRESETS.TODAY:
      startDate.setHours(0, 0, 0, 0);
      break;
    case DATE_PRESETS.THIS_WEEK:
      {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
      }
      break;
    case DATE_PRESETS.LAST_WEEK:
      {
        const dayLast = startDate.getDay();
        const diffLast = startDate.getDate() - dayLast + (dayLast === 0 ? -6 : 1) - 7;
        startDate.setDate(diffLast);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    case DATE_PRESETS.LAST_MONTH:
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case DATE_PRESETS.LAST_6_MONTHS:
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case DATE_PRESETS.LAST_YEAR:
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case DATE_PRESETS.CUSTOM:
      if (customStart) {
        const parsedStart = new Date(customStart);
        if (!isNaN(parsedStart.getTime())) {
          startDate = parsedStart;
        }
      }
      break;
    case DATE_PRESETS.LAST_3_MONTHS:
    default:
      startDate.setMonth(startDate.getMonth() - 3);
      break;
  }

  startDate.setHours(0, 0, 0, 0);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export const formatNumber = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return Number(val).toLocaleString("en-IN");
};

export const calculatePercentageChange = (current, previous) => {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) {
    return curr > 0 ? { value: 100, isIncrease: true, formatted: "+100%" } : { value: 0, isIncrease: true, formatted: "0%" };
  }
  const pct = ((curr - prev) / prev) * 100;
  const isIncrease = pct >= 0;
  return {
    value: Math.abs(Math.round(pct * 10) / 10),
    isIncrease,
    formatted: `${isIncrease ? "+" : ""}${Math.round(pct * 10) / 10}%`,
  };
};
