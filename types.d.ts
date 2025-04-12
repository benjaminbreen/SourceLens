// types.d.ts
declare module 'react-calendar-heatmap' {
  import React from 'react';
  
  interface CalendarHeatmapProps {
    values: Array<{
      date: string | Date;
      count: number;
      [key: string]: any;
    }>;
    startDate: Date;
    endDate: Date;
    classForValue?: (value: any) => string | null;
    titleForValue?: (value: any) => string | null;
    tooltipDataAttrs?: (value: any) => { [key: string]: string };
    showMonthLabels?: boolean;
    showWeekdayLabels?: boolean;
    horizontal?: boolean;
    gutterSize?: number;
    onClick?: (value: any) => void;
    [key: string]: any;
  }
  
  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;
  export default CalendarHeatmap;
}