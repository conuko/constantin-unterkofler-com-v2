export type Greeting = {
  /** The greeting written in its own language and script. */
  text: string;
  /** English name of the language, used for the accessible description. */
  language: string;
  /** BCP 47 tag, so the browser shapes the script with the right font. */
  lang: string;
};

/**
 * The Greeting rotation for the home Portfolio Page: each language's warm
 * equivalent of "good to see you", not a bare hello. English leads so the
 * server-rendered greeting is stable; the rotation randomizes from there.
 */
export const greetings: Greeting[] = [
  { text: "Good to see you", language: "English", lang: "en" },
  { text: "Schön, dass du da bist", language: "German", lang: "de" },
  { text: "Goed je te zien", language: "Dutch", lang: "nl" },
  { text: "Godt at se dig", language: "Danish", lang: "da" },
  { text: "Kul att se dig", language: "Swedish", lang: "sv" },
  { text: "Godt å se deg", language: "Norwegian", lang: "nb" },
  { text: "Gott að sjá þig", language: "Icelandic", lang: "is" },
  { text: "Che bello vederti", language: "Italian", lang: "it" },
  { text: "Content de te voir", language: "French", lang: "fr" },
  { text: "Qué bueno verte", language: "Spanish", lang: "es" },
  { text: "Que bom te ver", language: "Portuguese", lang: "pt" },
  { text: "M'alegro de veure't", language: "Catalan", lang: "ca" },
  { text: "Gaudeo te videre", language: "Latin", lang: "la" },
  { text: "Dobrze cię widzieć", language: "Polish", lang: "pl" },
  { text: "Rád tě vidím", language: "Czech", lang: "cs" },
  { text: "Rád ťa vidím", language: "Slovak", lang: "sk" },
  { text: "Lepo te je videti", language: "Slovenian", lang: "sl" },
  { text: "Lijepo te je vidjeti", language: "Croatian", lang: "hr" },
  { text: "Лепо те је видети", language: "Serbian", lang: "sr" },
  { text: "Радвам се да те видя", language: "Bulgarian", lang: "bg" },
  { text: "Рад тебя видеть", language: "Russian", lang: "ru" },
  { text: "Радий тебе бачити", language: "Ukrainian", lang: "uk" },
  { text: "Рады цябе бачыць", language: "Belarusian", lang: "be" },
  { text: "Gera tave matyti", language: "Lithuanian", lang: "lt" },
  { text: "Prieks tevi redzēt", language: "Latvian", lang: "lv" },
  { text: "Tore sind näha", language: "Estonian", lang: "et" },
  { text: "Mukava nähdä sinua", language: "Finnish", lang: "fi" },
  { text: "Jó látni téged", language: "Hungarian", lang: "hu" },
  { text: "Χαίρομαι που σε βλέπω", language: "Greek", lang: "el" },
  { text: "Gëzohem të të shoh", language: "Albanian", lang: "sq" },
  { text: "Seni görmek güzel", language: "Turkish", lang: "tr" },
  { text: "Səni görmək gözəldir", language: "Azerbaijani", lang: "az" },
  { text: "Mae'n dda dy weld di", language: "Welsh", lang: "cy" },
  { text: "Tá áthas orm tú a fheiceáil", language: "Irish", lang: "ga" },
  { text: "Pozten naiz zu ikusteaz", language: "Basque", lang: "eu" },
  { text: "Bone vidi vin", language: "Esperanto", lang: "eo" },
  { text: "Ուրախ եմ քեզ տեսնել", language: "Armenian", lang: "hy" },
  { text: "მიხარია, რომ გხედავ", language: "Georgian", lang: "ka" },
  { text: "טוב לראות אותך", language: "Hebrew", lang: "he" },
  { text: "سعيد برؤيتك", language: "Arabic", lang: "ar" },
  { text: "आपको देखकर अच्छा लगा", language: "Hindi", lang: "hi" },
  { text: "Rất vui được gặp bạn", language: "Vietnamese", lang: "vi" },
  { text: "很高兴见到你", language: "Chinese (Simplified)", lang: "zh-Hans" },
  { text: "很高興見到你", language: "Chinese (Traditional)", lang: "zh-Hant" },
  { text: "会えてうれしいです", language: "Japanese", lang: "ja" },
  { text: "만나서 반갑습니다", language: "Korean", lang: "ko" },
];
