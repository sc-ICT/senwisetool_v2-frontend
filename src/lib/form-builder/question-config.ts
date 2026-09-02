import type { FormQuestionConfig } from "@/types/form-question";
import type { QuestionType } from "@/types/question-bank";

export type QuestionConfigCapability =
  | "required"
  | "min_value"
  | "max_value"
  | "min_length"
  | "max_length"
  | "placeholder"
  | "help_text"
  | "readonly"
  | "default_value";

export const questionTypeCapabilities: Record<
  QuestionType,
  QuestionConfigCapability[]
> = {
  TEXT: [
    "required",
    "min_length",
    "max_length",
    "placeholder",
    "help_text",
    "readonly",
  ],

  LONG_TEXT: [
    "required",
    "min_length",
    "max_length",
    "placeholder",
    "help_text",
    "readonly",
  ],

  EMAIL: ["required", "placeholder", "help_text", "readonly"],

  PHONE: ["required", "placeholder", "help_text", "readonly"],

  URL: ["required", "placeholder", "help_text", "readonly"],

  ADDRESS: ["required", "placeholder", "help_text", "readonly"],

  INTEGER: ["required", "min_value", "max_value", "help_text", "readonly"],

  DECIMAL: ["required", "min_value", "max_value", "help_text", "readonly"],

  PERCENTAGE: ["required", "min_value", "max_value", "help_text", "readonly"],

  CURRENCY: ["required", "min_value", "max_value", "help_text", "readonly"],

  SINGLE_CHOICE: ["required", "default_value", "help_text", "readonly"],

  MULTIPLE_CHOICE: ["required", "default_value", "help_text", "readonly"],

  DROPDOWN: ["required", "default_value", "help_text", "readonly"],

  AUTOCOMPLETE: ["required", "default_value", "help_text", "readonly"],

  RATING: ["required", "min_value", "max_value", "help_text", "readonly"],

  LIKERT_SCALE: ["required", "default_value", "help_text", "readonly"],

  RANKING: ["required", "help_text", "readonly"],

  DATE: ["required", "help_text", "readonly"],

  TIME: ["required", "help_text", "readonly"],

  DATETIME: ["required", "help_text", "readonly"],

  DURATION: ["required", "min_value", "max_value", "help_text", "readonly"],

  POINT: ["required", "help_text", "readonly"],

  LINE: ["required", "help_text", "readonly"],

  POLYGON: ["required", "help_text", "readonly"],

  AREA: ["required", "min_value", "max_value", "help_text", "readonly"],

  PHOTO: ["required", "help_text"],

  VIDEO: ["required", "help_text"],

  AUDIO: ["required", "help_text"],

  FILE: ["required", "help_text"],

  SIGNATURE: ["required", "help_text"],

  QR_CODE: ["required", "readonly", "help_text"],

  BARCODE: ["required", "readonly", "help_text"],

  ENTITY_SELECT: ["required", "default_value", "help_text", "readonly"],

  ENTITY_SEARCH: ["required", "default_value", "help_text", "readonly"],

  CALCULATION: ["help_text", "readonly"],

  NOTE: ["help_text"],

  CONSENT: ["required", "help_text"],

  HIDDEN: ["readonly"],
};

export function hasQuestionCapability(
  questionType: QuestionType,
  capability: QuestionConfigCapability,
): boolean {
  return questionTypeCapabilities[questionType].includes(capability);
}

export const defaultFormQuestionConfig: FormQuestionConfig = {
  validation: {
    required: false,
    min_value: null,
    max_value: null,
    min_length: null,
    max_length: null,
    default_value: null,
  },

  display: {
    visible: true,
    readonly: false,
    placeholder: null,
    help_text: null,
  },
};

export function createDefaultFormQuestionConfig(): FormQuestionConfig {
  return {
    validation: {
      ...defaultFormQuestionConfig.validation,
    },

    display: {
      ...defaultFormQuestionConfig.display,
    },
  };
}
