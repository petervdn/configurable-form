import { z } from 'zod';
import { dateFormatSchema } from './types';

// each validation has a translatable error
const validationErrorMessageSchema = z.object({
  errorMessage: z.string(),
});

const oneStringParam = z.tuple([z.string()]);
const oneNumberParam = z.tuple([z.number()]);
const twoStringParams = z.tuple([z.string(), z.string()]);
const twoNumberParams = z.tuple([z.number(), z.number()]);

// define each validation separately, so we can specify params for each
export const requiredValidationSchema = z
  .object({
    type: z.literal('REQUIRED'),
  })
  .merge(validationErrorMessageSchema);

export const integerValidationSchema = z
  .object({
    type: z.literal('INTEGER'),
  })
  .merge(validationErrorMessageSchema);

export const decimalValidationSchema = z
  .object({
    type: z.literal('DECIMAL'),
  })
  .merge(validationErrorMessageSchema);

export const emailValidationSchema = z
  .object({
    type: z.literal('EMAIL'),
  })
  .merge(validationErrorMessageSchema);

export const ageCheckValidationSchema = z
  .object({
    type: z.literal('AGE_CHECK'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const dateFormatValidationSchema = z
  .object({
    type: z.literal('DATE'),
    parameters: z.tuple([dateFormatSchema]),
  })
  .merge(validationErrorMessageSchema);

export const minimumNumberValidationSchema = z
  .object({
    type: z.literal('MINIMUM'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const maximumNumberValidationSchema = z
  .object({
    type: z.literal('MAXIMUM'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const betweenNumbersValidationSchema = z
  .object({
    type: z.literal('BETWEEN'),
    parameters: twoNumberParams,
  })
  .merge(validationErrorMessageSchema);

export const fileExtensionValidationSchema = z
  .object({
    type: z.literal('FILE_EXTENSION'),
    parameters: oneStringParam,
  })
  .merge(validationErrorMessageSchema);

export const fileSizeValidationSchema = z
  .object({
    type: z.literal('FILE_SIZE'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const minCharsValidationSchema = z
  .object({
    type: z.literal('MIN_CHARS'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const maxCharsValidationSchema = z
  .object({
    type: z.literal('MAX_CHARS'),
    parameters: oneNumberParam,
  })
  .merge(validationErrorMessageSchema);

export const regexValidationSchema = z
  .object({
    type: z.literal('REGEX'),
    parameters: z.union([oneStringParam, twoStringParams]).refine((value) => {
      // validate values by checking if we can instantiate a valid RegExp
      try {
        // eslint-disable-next-line no-new
        new RegExp(value[0], value[1] || '');
        return true;
      } catch {
        return false;
      }
    }),
  })
  .merge(validationErrorMessageSchema);

const formFieldValidationSchema = z.union([
  requiredValidationSchema,
  integerValidationSchema,
  decimalValidationSchema,
  emailValidationSchema,
  dateFormatValidationSchema,
  minimumNumberValidationSchema,
  maximumNumberValidationSchema,
  betweenNumbersValidationSchema,
  fileExtensionValidationSchema,
  fileSizeValidationSchema,
  ageCheckValidationSchema,
  regexValidationSchema,
  minCharsValidationSchema,
  maxCharsValidationSchema,
]);

export type FormFieldValidation = z.infer<typeof formFieldValidationSchema>;
export type RequiredValidation = z.infer<typeof requiredValidationSchema>;
export type DateFormatValidation = z.infer<typeof dateFormatValidationSchema>;
export type AgeValidation = z.infer<typeof ageCheckValidationSchema>;
