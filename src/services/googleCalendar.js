// googleCalendar.js
import { Linking } from 'react-native';

// Helper to get the ISO-formatted date string for a specific day of the week
export const getDateForDayOfWeek = (dayOfWeek) => {
  const today = new Date();
  const dayIndex = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].indexOf(dayOfWeek);
  const currentDayIndex = today.getDay();
  const difference = dayIndex - currentDayIndex;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + difference);
  return targetDate.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
};

// Helper to format the date and time into the format required by Google Calendar
export const formatDateTime = (date, time) => {
  const [hour, minute] = time.split(':');
  const eventDate = new Date(date);
  eventDate.setHours(hour, minute, 0);
  return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Function to open Google Calendar with event details
export const addLessonToGoogleCalendar = (lessonName, day, startTime, endTime, building, room) => {
  const date = getDateForDayOfWeek(day);
  const start = formatDateTime(date, startTime);
  const end = formatDateTime(date, endTime);

  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    lessonName
  )}&dates=${start}/${end}&details=${encodeURIComponent(`Building: ${building}, Room: ${room}`)}&location=${encodeURIComponent(
    `${building} ${room}`
  )}`;

  Linking.openURL(calendarUrl).catch((err) => console.error('Failed to open Google Calendar', err));
};
