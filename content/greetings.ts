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
 * equivalent of "Hello, I'm". English leads so the server-rendered greeting
 * is stable; the rotation randomizes from there.
 */
export const greetings: Greeting[] = [
  { text: "Hello, I’m", language: "English", lang: "en" },
  { text: "Hi, ich bin", language: "German", lang: "de" },
  { text: "Hallo, ik ben", language: "Dutch", lang: "nl" },
  { text: "Hej, jeg er", language: "Danish", lang: "da" },
  { text: "Hej, jag är", language: "Swedish", lang: "sv" },
  { text: "Hei, jeg er", language: "Norwegian", lang: "nb" },
  { text: "Halló, ég heiti", language: "Icelandic", lang: "is" },
  { text: "Ciao, sono", language: "Italian", lang: "it" },
  { text: "Bonjour, je suis", language: "French", lang: "fr" },
  { text: "Hola, soy", language: "Spanish", lang: "es" },
  { text: "Olá, eu sou", language: "Portuguese", lang: "pt" },
  { text: "Hola, soc", language: "Catalan", lang: "ca" },
  { text: "Salve, ego sum", language: "Latin", lang: "la" },
  { text: "Cześć, jestem", language: "Polish", lang: "pl" },
  { text: "Ahoj, jsem", language: "Czech", lang: "cs" },
  { text: "Ahoj, som", language: "Slovak", lang: "sk" },
  { text: "Živjo, sem", language: "Slovenian", lang: "sl" },
  { text: "Bok, ja sam", language: "Croatian", lang: "hr" },
  { text: "Здраво, ја сам", language: "Serbian", lang: "sr" },
  { text: "Здравей, аз съм", language: "Bulgarian", lang: "bg" },
  { text: "Привет, я", language: "Russian", lang: "ru" },
  { text: "Привіт, я", language: "Ukrainian", lang: "uk" },
  { text: "Прывітанне, я", language: "Belarusian", lang: "be" },
  { text: "Labas, aš esu", language: "Lithuanian", lang: "lt" },
  { text: "Sveiki, es esmu", language: "Latvian", lang: "lv" },
  { text: "Tere, mina olen", language: "Estonian", lang: "et" },
  { text: "Hei, olen", language: "Finnish", lang: "fi" },
  { text: "Szia, a nevem", language: "Hungarian", lang: "hu" },
  { text: "Γεια, είμαι ο", language: "Greek", lang: "el" },
  { text: "Përshëndetje, unë jam", language: "Albanian", lang: "sq" },
  { text: "Merhaba, adım", language: "Turkish", lang: "tr" },
  { text: "Salam, adım", language: "Azerbaijani", lang: "az" },
  { text: "Helo, fy enw i yw", language: "Welsh", lang: "cy" },
  { text: "Dia dhuit, is mise", language: "Irish", lang: "ga" },
  { text: "Saluton, mi estas", language: "Esperanto", lang: "eo" },
  { text: "გამარჯობა, მე ვარ", language: "Georgian", lang: "ka" },
  { text: "שלום, אני", language: "Hebrew", lang: "he" },
  { text: "مرحبًا، أنا", language: "Arabic", lang: "ar" },
  { text: "Xin chào, tôi là", language: "Vietnamese", lang: "vi" },
  {
    text: "你好，我是",
    language: "Chinese (Simplified)",
    lang: "zh-Hans",
  },
  {
    text: "你好，我是",
    language: "Chinese (Traditional)",
    lang: "zh-Hant",
  },
];
