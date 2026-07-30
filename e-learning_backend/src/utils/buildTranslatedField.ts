import { detectLanguage } from "./detectLanguageByFranc";
import { translateTextToTargetLang } from "./translateTextToTargetLang";

interface TranslatedField {
  en: string;
  fr: string;
}

/**-------------------------------
 * take actual string and convert to object
 * with en and bn field
 * *-------------------------------- */
export const buildTranslatedField = async (
  text: string,
): Promise<TranslatedField> => {
  
  
  const cleanText = text?.trim();
  if (cleanText.length < 3) {
    throw new Error('Text too short to translate');
  }

  /*-----------------------

  // 1️⃣ Detect the language
  let detectedLang = await detectLanguage(cleanText);

  const originalLang = detectedLang || 'en';

  
  
  // 3️⃣ Build the translation object
  let result: TranslatedField = { en: '', bn: '' };

  result[originalLang] = cleanText;

  const otherLang = originalLang === "en" ? 'bn' : 'en';
  result[otherLang] = await translateTextToTargetLang(cleanText, otherLang);
  
  ------------------------*/

  /*---------------------------------
  ---------------------------------*/

  let result: TranslatedField;
  result = {  en: cleanText, fr: 'TEST_BN' }; // 🧪 FOR_TESTING 

  return result;
};

// 2️⃣ Handle unknown detection
//   if (detectedLang == 'unknown') {
//     const user = await User.findById(userId);
//     detectedLang = user?.language || 'en';
//   }