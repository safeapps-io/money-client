/**
 * The basic idea of this module was to get an idea of all the formats that revolut dates
 * can have. We exported all the locales from date-fns.
 *
 * Then we  used `Intl.DateTimeFormat` to format the dates according to a needed setting,
 * which IS NOT a date-fns pattern, but is a standart way to format dates in this lang/region.
 *
 * Below we got a list of highly popular date formats, that we can use to determine
 */

/**
 * Generated in node:
 * 
 * ```
   const dateFnsLocales = require('date-fns/locale');
   console.log(Object.values(dateFnsLocales).map(locale => locale.code));
 * ```
 */

// prettier-ignore
const locales = ['af','ar-DZ','ar-MA','ar-SA','az','be','bg','bn','ca','cs','cy','da','de','el','en-AU','en-CA','en-GB','en-IN','en-NZ','en-US','eo','es','et','eu','fa-IR','fi','fr','fr-CA','fr-CH','gd','gl','gu','he','hi','hr','hu','hy','id','is','it','ja','ka','kk','kn','ko','lb','lt','lv','mk','ms','mt','nb','nl','nl-BE','nn','pl','pt','pt-BR','ro','ru','sk','sl','sr','sr-Latn','sv','ta','te','th','tr','ug','uk','uz','vi','zh-CN','zh-TW',];

export const date = new Date(12341234);

JSON.stringify(
  locales.map(locale => [
    locale,
    Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date),
  ]),
  null,
  2,
);

/**
 * The result is this:
 * (1) — d LLL yyyy г. — 18 occurencies
 * (2) — d yyyy LLL — 3
 * (3) — yyyy LLL d — 5
 * (4) — d LLL yyyy — 38
 * (5) — LLL d, yyyy — 3
 * (6) — yyyy d LLL — 1
 */
[
  ['af', '1 янв. 1970 г.'], // 1
  ['ar-DZ', '1 جانفي 1970'], // 2
  ['ar-MA', '1 يناير 1970'], // 2
  ['ar-SA', '٢٢ شوال ١٣٨٩ هـ'],
  ['az', '1970 M01 1'], // 3
  ['be', '1 янв. 1970 г.'], // 1
  ['bg', '1.01.1970 г.'], // 1
  ['bn', '১ জানু, ১৯৭০'],
  ['ca', '1 de gen. de 1970'], // 4
  ['cs', '1. 1. 1970'], // 4
  ['cy', '1 янв. 1970 г.'], // 1
  ['da', '1. jan. 1970'], // 4
  ['de', '1. Jan. 1970'], // 4
  ['el', '1 Ιαν 1970'], // 4
  ['en-AU', '1 Jan 1970'], // 4
  ['en-CA', 'Jan. 1, 1970'], // 5
  ['en-GB', '1 Jan 1970'], // 4
  ['en-IN', '1 Jan 1970'], // 4
  ['en-NZ', '1 Jan 1970'], // 4
  ['en-US', 'Jan 1, 1970'], // 5
  ['eo', '1 янв. 1970 г.'], // 1
  ['es', '1 ene. 1970'], // 4
  ['et', '1. jaan 1970'], // 4
  ['eu', '1 янв. 1970 г.'], // 1
  ['fa-IR', '۱۱ دی ۱۳۴۸'],
  ['fi', '1. tammik. 1970'], // 4
  ['fr', '1 janv. 1970'], // 4
  ['fr-CA', '1 janv. 1970'], // 4
  ['fr-CH', '1 janv. 1970'], // 4
  ['gd', '1 янв. 1970 г.'], // 1
  ['gl', '1 янв. 1970 г.'], // 1
  ['gu', '1 જાન્યુ, 1970'], // 4
  ['he', '1 בינו׳ 1970'], // 2
  ['hi', '1 जन॰ 1970'], // 4
  ['hr', '1. sij 1970.'], // 4
  ['hu', '1970. jan. 1.'], // 3
  ['hy', '1 янв. 1970 г.'], // 1
  ['id', '1 Jan 1970'], // 4
  ['is', '1 янв. 1970 г.'], // 1
  ['it', '1 gen 1970'], // 4
  ['ja', '1970年1月1日'], // 3 or 6
  ['ka', '1 янв. 1970 г.'], // 1
  ['kk', '1 янв. 1970 г.'], // 1
  ['kn', 'ಜನವರಿ 1,1970'],
  ['ko', '1970년 1월 1일'],
  ['lb', '1 янв. 1970 г.'], // 1
  ['lt', '1970-01-01'],
  ['lv', '1970. g. 1. janv.'],
  ['mk', '1 янв. 1970 г.'], // 1
  ['ms', '1 Jan 1970'], // 4
  ['mt', '1 янв. 1970 г.'], // 1
  ['nb', '1. jan. 1970'], // 4
  ['nl', '1 jan. 1970'], // 4
  ['nl-BE', '1 jan. 1970'], // 4
  ['nn', '1 янв. 1970 г.'], // 1
  ['pl', '1 sty 1970'], // 4
  ['pt', '1 de jan. de 1970'], // 4
  ['pt-BR', '1 de jan. de 1970'], // 4
  ['ro', '1 ian. 1970'], // 4
  ['ru', '1 янв. 1970 г.'], // 1
  ['sk', '1. 1. 1970'], // 4
  ['sl', '1. jan. 1970'], // 4
  ['sr', '1. јан 1970.'], // 4
  ['sr-Latn', '1. jan 1970.'], // 4
  ['sv', '1 jan. 1970'], // 4
  ['ta', '1 ஜன., 1970'], // 4
  ['te', '1, జన 1970'], // 4
  ['th', '1 ม.ค. 2513'], // 4
  ['tr', '1 Oca 1970'], // 4
  ['ug', '1 янв. 1970 г.'], // 1
  ['uk', '1 січ. 1970'], // 4
  ['uz', '1970 M01 1'], // 3
  ['vi', '1 thg 1, 1970'], // 5
  ['zh-CN', '1970年1月1日'],
  ['zh-TW', '1970年1月1日'],
];
