export const supportedLocales = ['en', 'ru', 'hy'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
