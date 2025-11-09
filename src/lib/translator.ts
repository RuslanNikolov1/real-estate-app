// Translation service - мокване за сега, после може да се интегрира с Google Translate API или друг service
export async function translateText(
  text: string,
  targetLanguage: 'en' | 'ru' | 'de'
): Promise<string> {
  // TODO: Интегриране с Google Translate API или друг translation service
  // За сега връщаме мокнат превод
  return new Promise((resolve) => {
    setTimeout(() => {
      // Мокнат превод - в реална ситуация тук ще има API call
      const mockTranslations: Record<string, Record<string, string>> = {
        'Луксозен апартамент': {
          en: 'Luxury Apartment',
          ru: 'Роскошная квартира',
          de: 'Luxuswohnung',
        },
        'Модерен тристаен апартамент': {
          en: 'Modern three-room apartment',
          ru: 'Современная трехкомнатная квартира',
          de: 'Moderne Drei-Zimmer-Wohnung',
        },
      };

      // Прост алгоритъм за мокнат превод
      let translated = text;
      Object.keys(mockTranslations).forEach((key) => {
        if (text.includes(key)) {
          translated = translated.replace(key, mockTranslations[key][targetLanguage] || key);
        }
      });

      resolve(translated || text);
    }, 500);
  });
}

export async function translateProperty(
  property: {
    title: string;
    description: string;
  },
  targetLanguage: 'en' | 'ru' | 'de'
): Promise<{ title: string; description: string }> {
  const [translatedTitle, translatedDescription] = await Promise.all([
    translateText(property.title, targetLanguage),
    translateText(property.description, targetLanguage),
  ]);

  return {
    title: translatedTitle,
    description: translatedDescription,
  };
}












