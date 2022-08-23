import { z } from "zod";

export const recaptchaSchema = z.object({
  siteKey: z.string(),
  participateAction: z.string(),
  validationAction: z.string(),
  winAction: z.string(),
  uploadAction: z.string(),
  memoryGameSetupAction: z.string(),
  memoryGameMoveAction: z.string(),
  quizGameSetupAction: z.string(),
  quizGameAnswerAction: z.string(),
});

export const imageSchema = z.object({
  url: z.string(),
  alt: z.string(),
});

export type Image = z.infer<typeof imageSchema>;
export const dateFormatSchema = z.enum(["YYYY-MM-DD", "DD-MM-YYYY"]);
export type DateFormat = z.infer<typeof dateFormatSchema>;

export const dateSchema = z.preprocess(
  (value) =>
    typeof value === "string" || value instanceof Date
      ? new Date(value)
      : undefined,
  z.date()
);

export const localeSchema = z.object({
  code: z.string(),
  label: z.string(),
});

export const responseFieldValidationErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string(),
});

export const formValidationErrorCode = "error.form.validation";
export const responseValidationErrorSchema = z.object({
  code: z.literal(formValidationErrorCode), // todo: agree with BE on a string
  message: z.string(),
  fields: z.array(responseFieldValidationErrorSchema),
});

export const baseErrorSchema = z.object({
  // refine added to let zod validation fail when there is a
  // responseValidationError without fields. without this refinement,
  // a responseValidationError without fields would still match this baseErrorSchema
  code: z.string().refine((value) => value !== formValidationErrorCode),
  message: z.string(),
});

export const responseErrorSchema = z.union([
  responseValidationErrorSchema,
  baseErrorSchema,
]);

export const responseWithErrorSchema = z.object({ error: responseErrorSchema });

export type ResponseError = z.infer<typeof responseErrorSchema>;
export type ResponseValidationError = z.infer<
  typeof responseValidationErrorSchema
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;
