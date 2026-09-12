import { useState, useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function addMonths(date, months) {
  const d = new Date(date);
  d.setDate(15);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBooked(date, bookings) {
  const time = new Date(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T00:00:00`).getTime();
  return bookings.some((booking) => {
    const start = new Date(`${booking.startdate}T00:00:00`).getTime();
    const end = new Date(`${booking.enddate}T00:00:00`).getTime();
    return time >= start && time <= end;
  });
}

export default function BookingCalendar({ bookings, moveIn, moveOut, onMoveInChange, onMoveOutChange }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(today);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDay = startOfMonth(viewMonth);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const bookedSet = useMemo(() => {
    const set = new Set();
    bookings.forEach((booking) => {
      const start = new Date(`${booking.startdate}T00:00:00`);
      const end = new Date(`${booking.enddate}T00:00:00`);
      const current = new Date(start);
      while (current <= end) {
        set.add(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
    });
    return set;
  }, [bookings]);

  const isSelectable = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    if (date < today) return false;
    const key = date.toISOString().slice(0, 10);
    if (bookedSet.has(key)) return false;
    return true;
  };

  const isSelected = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    return isSameDay(date, moveIn) || isSameDay(date, moveOut);
  };

  const isInRange = (day) => {
    if (!day || !moveIn || !moveOut) return false;
    const date = new Date(year, month, day);
    const start = moveIn < moveOut ? moveIn : moveOut;
    const end = moveIn < moveOut ? moveOut : moveIn;
    return date > start && date < end;
  };

  function handleDayClick(day) {
    if (!isSelectable(day)) return;
    const date = new Date(year, month, day);
    const key = date.toISOString().slice(0, 10);

    if (!moveIn || (moveIn && moveOut)) {
      onMoveInChange(date);
      onMoveOutChange(null);
      return;
    }

    if (date < moveIn) {
      onMoveOutChange(moveIn);
      onMoveInChange(date);
      return;
    }

    if (isSameDay(date, moveIn)) {
      onMoveOutChange(null);
      return;
    }

    onMoveOutChange(date);
  }

  return (
    <div className="booking-calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
        >
          ‹
        </button>
        <div className="calendar-title">
          {MONTHS[month]} {year}
        </div>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {DAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {cells.map((day, idx) => {
          const selectable = day && isSelectable(day);
          const selected = day && isSelected(day);
          const inRange = day && isInRange(day);
          const booked = day && !isSelectable(day) && new Date(year, month, day) >= today;
          const past = day && new Date(year, month, day) < today;

          let className = "calendar-day";
          if (selected) className += " selected";
          else if (inRange) className += " in-range";
          else if (booked) className += " booked";
          else if (past || !selectable) className += " disabled";
          else if (selectable) className += " available";

          return (
            <button
              key={idx}
              type="button"
              disabled={!selectable}
              className={className}
              onClick={() => handleDayClick(day)}
            >
              {day || ""}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><span className="legend-dot available" /> Available</span>
        <span className="legend-item"><span className="legend-dot selected" /> Selected</span>
        <span className="legend-item"><span className="legend-dot booked" /> Booked</span>
      </div>
    </div>
  );
}
