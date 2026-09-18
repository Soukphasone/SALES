import { format } from "date-fns";
export function formatNumber(number: number) {
  return new Intl.NumberFormat().format(number)
}
export function formatDate(date: string) {
  return format(new Date(date), "dd/MM/yyyy");
}
export function formatDateShort(date: string) {
  return format(new Date(date), "dd/MM/yy");
}
export function formatDateTime(date: string) {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
}
export function formatTime(date: string) {
  return format(new Date(date), "HH:mm:ss");
}
