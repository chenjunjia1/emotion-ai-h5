import type { Lang } from "../types/v1";
import { en } from "./en";
import { zh } from "./zh";

const dict = { zh, en };

export type I18nKey = keyof typeof zh;

export function t(lang: Lang, key: I18nKey): string {
  return dict[lang][key] ?? dict.zh[key] ?? key;
}

export { zh, en };
