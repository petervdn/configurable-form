import {
  formValidationErrorCode,
  FormValues,
  ResponseError,
  ResponseValidationError,
} from "./types/types";
import { FormErrors, FormFieldConfig } from "./types/form.types";

/**
 * Creates object with values for all given field ids to initialize a form with.
 * Values are set to either an empty string or (if present) a prefilled value.
 *
 * (fields should have a value: if they are initially undefined the fields will
 * be uncontrolled and switch to controlled when value changes)
 *
 * @param formFields
 * @param initialValues
 */
export const createInitialFormValues = (
  formFields: ReadonlyArray<Pick<FormFieldConfig, "id">>,
  initialValues?: FormValues
) =>
  formFields.reduce<Record<string, string>>(
    (valuesObject, { id }) => ({
      ...valuesObject,
      [id]: initialValues?.[id] ?? "",
    }),
    {}
  );

/**
 * Creates initial touched settings for a form. If there were initial errors,
 * we set every field to touched because we are resuming a form that apparently
 * has been submitted before (and submitting would also have set every field to touched)
 *
 * @param initialValues
 * @param initialErrors
 */
export const createInitialTouchedValues = (
  initialValues: FormValues,
  initialErrors?: FormErrors
): Record<string, boolean> =>
  initialErrors
    ? Object.keys(initialValues).reduce(
        (accumulator, current) => ({
          ...accumulator,
          [current]: true,
        }),
        {}
      )
    : {};

export const parseBackendValidationError = (error: ResponseValidationError) =>
  error.fields.reduce<FormErrors>(
    (accumulator, { field, message }) =>
      accumulator[field]
        ? { ...accumulator, [field]: [...accumulator[field], message] }
        : { ...accumulator, [field]: [message] },
    {}
  );

export const responseErrorIsFormValidationError = (
  error: ResponseError
): error is ResponseValidationError => error.code === formValidationErrorCode;

export const getFormErrorsFromResponseError = (error: ResponseError) =>
  responseErrorIsFormValidationError(error)
    ? parseBackendValidationError(error)
    : undefined;
