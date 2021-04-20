import moment from "moment";
import "moment/min/locales";
import { analytics } from "./firebase";
moment.locale("ja");

export class DateUtil {
  static parseDateWithAgo(date: Date, from_ago = 1): string {
    // 直近の日付は「●日前」
    // 昔の日付は「2019年10月1日」のように整形する
    // from_agoで直近を指定。
    const _date = moment(date);
    const beforeNow = moment().subtract(from_ago, "d");
    if (_date.isAfter(beforeNow)) {
      return _date.fromNow();
    } else {
      return _date.format("LL");
    }
  }

  static toStringDataTime(date: Date): string {
    return moment(date).format("llll");
  }
}

export const zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));
export const sleep = (msec) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export const chunk = <T extends any[]>(arr: T, size: number): T[] => {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as T[]
  );
};

export const setTitle = (title?: string): void => {
  let _title = process.env.REACT_APP_TITLE;
  if (title) {
    _title = `${title} - ${_title}`;
  }
  document.title = _title;

  analytics.setCurrentScreen(_title);
  analytics.logEvent("page_view", {
    page_location: location.pathname + location.search,
    page_path: location.pathname,
    page_title: _title,
  });
};
