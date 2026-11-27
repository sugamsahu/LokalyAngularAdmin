import * as moment from "moment";

/**
 * Turns a date from the ngx-daterangepicker-material picker into a moment.
 *
 * Since version 6 the picker returns dayjs objects. moment(dayjsObject) does
 * not throw: it reads the object as {year, month, ...} fields and silently
 * produces the wrong date. The picker also keeps the chosen wall-clock time in
 * UTC mode, so going through toDate() can move the end of a day into the next
 * day in time zones ahead of UTC. Reading the picker's own formatted value
 * keeps exactly the date and time the user picked.
 *
 * Plain Dates (the dashboards' initial value) and moments are passed through.
 * An empty value gives an invalid moment, as moment(null) did before.
 */
export function pickerDate(value: any): moment.Moment {
  if (value == null || value === "") {
    return moment.invalid();
  }
  if (moment.isMoment(value)) {
    return value;
  }
  if (value instanceof Date) {
    return moment(value);
  }
  if (typeof value.format === "function" && typeof value.isValid === "function") {
    // dayjs object
    return value.isValid() ? moment(value.format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss") : moment.invalid();
  }
  return moment(value);
}
