"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import commonEn from "../../../public/locales/en/common.json";
import commonRu from "../../../public/locales/ru/common.json";
import commonKz from "../../../public/locales/kz/common.json";

i18next.init({
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {
    en: { common: commonEn },
    ru: { common: commonRu },
    kz: { common: commonKz },
  },
});

export default function TranslationWrapper({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
