import { createSignal, For, Show } from "solid-js";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker(props: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = createSignal(props.selectedDate.getMonth());
  const [currentYear, setCurrentYear] = createSignal(props.selectedDate.getFullYear());
  const [selectedDate, setSelectedDate] = createSignal(props.selectedDate);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate days for the calendar
  const getDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear(), currentMonth());
    const firstDay = getFirstDayOfMonth(currentYear(), currentMonth());
    
    // Previous month's days
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, type: "prev-month" });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, type: "current-month" });
    }
    
    // Next month's days (to fill the grid)
    const remainingCells = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: null, type: "next-month" });
    }
    
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth() === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear() - 1);
    } else {
      setCurrentMonth(currentMonth() - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth() === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear() + 1);
    } else {
      setCurrentMonth(currentMonth() + 1);
    }
  };

  // Check if a day is selected
  const isSelected = (day: number | null) => {
    if (!day) return false;
    
    const date = selectedDate();
    return (
      date.getDate() === day &&
      date.getMonth() === currentMonth() &&
      date.getFullYear() === currentYear()
    );
  };

  // Check if a day is today
  const isToday = (day: number | null) => {
    if (!day) return false;
    
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth() &&
      today.getFullYear() === currentYear()
    );
  };

  // Handle day selection
  const selectDate = (day: number | null) => {
    if (!day) return;
    
    const newDate = new Date(currentYear(), currentMonth(), day);
    setSelectedDate(newDate);
    props.onChange(newDate);
  };

  return (
    <div class="datepicker p-4">
      {/* Header */}
      <div class="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          class="p-2 rounded-full hover:bg-gray-100 transition"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class="text-lg font-medium text-gray-800">
          {monthNames[currentMonth()]} {currentYear()}
        </div>
        <button 
          onClick={nextMonth}
          class="p-2 rounded-full hover:bg-gray-100 transition"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Days of Week */}
      <div class="grid grid-cols-7 gap-1 mb-2">
        <For each={dayNames}>
          {(day) => <div class="text-center text-xs font-medium text-gray-500">{day}</div>}
        </For>
      </div>

      {/* Calendar Days */}
      <div class="grid grid-cols-7 gap-1">
        <For each={getDays()}>
          {(dayObj) => (
            <button
              type="button"
              class={`
                p-2 rounded-full text-center focus:outline-none
                ${dayObj.type === 'current-month' ? 'hover:bg-sky-100' : 'text-gray-300 cursor-default'}
                ${isSelected(dayObj.day) ? 'bg-sky-500 text-white hover:bg-sky-600' : ''}
                ${isToday(dayObj.day) && !isSelected(dayObj.day) ? 'border border-sky-500' : ''}
              `}
              disabled={dayObj.type !== 'current-month'}
              onClick={() => selectDate(dayObj.day)}
            >
              {dayObj.day}
            </button>
          )}
        </For>
      </div>
      
      {/* Today and Close buttons */}
      <div class="mt-4 flex justify-between">
        <button
          type="button"
          class="text-sm text-sky-600 hover:text-sky-800 font-medium"
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
            setSelectedDate(today);
            props.onChange(today);
          }}
        >
          Today
        </button>
        
        <button
          type="button"
          class="text-sm text-gray-600 hover:text-gray-800 font-medium"
          onClick={props.onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
