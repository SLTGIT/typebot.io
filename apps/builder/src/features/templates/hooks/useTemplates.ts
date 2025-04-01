import { useTranslate } from "@tolgee/react";
import type { TemplateProps } from "../types";

export const useTemplates = (): TemplateProps[] => {
  const { t } = useTranslate();

  return [
    {
      name: "EAP B2B Leadgen Template",
      emoji: "💰",
      fileName: "eap-b2b.json",
      isNew: true,
      category: "marketing",
      description: "real state bot",
    },
    {
      name: "EAP B2C Leadgen Template",
      emoji: "💰",
      fileName: "eap-b2c.json",
      isNew: true,
      category: "marketing",
      description: "real state bot",
    }
  ];
};
