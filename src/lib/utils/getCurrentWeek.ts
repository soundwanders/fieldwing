export function getCurrentWeek(): number {
  const currentYear = new Date().getFullYear();
  const collegeFootballStartDate = new Date(currentYear, 7, 30);
  const currentDate = new Date();
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeek = Math.ceil((currentDate.getTime() - collegeFootballStartDate.getTime()) / millisecondsPerWeek);
  return currentWeek;
}