import type { FormikValues } from "formik";
import { getValidator } from "./getValidator";
import { FormFieldValidation } from "../types/form-validations.types";
import { FormErrors, FormFieldConfig } from "../types/form.types";

type Validator = (value: unknown) => boolean;
type ValidatorWithError = {
  validator: Validator;
  error: string;
};
type ValidatorsWithErrorByFieldId = Record<string, Array<ValidatorWithError>>;

/**
 * Returns an object with a list of validator + (i18n)errorMessage for each fieldId.
 * Some validations may be removed and used in a different way.
 * @param fields
 */
export const getValidatorsWithErrorByFieldId = (
  fields: ReadonlyArray<FormFieldConfig>
): ValidatorsWithErrorByFieldId =>
  fields.reduce<ValidatorsWithErrorByFieldId>((accumulator, field) => {
    // not sure why the cast is needed, gives an error without it.
    // maybe the whole type setup is getting too much for TS
    const validations = (
      (field.validations as Array<FormFieldValidation>) || []
    ).filter(
      (validation) =>
        validation.type !== "FILE_SIZE" && validation.type !== "FILE_EXTENSION"
    );
    return {
      ...accumulator,
      [field.id]: validations.map((validation) => ({
        validator: getValidator(validation, field),
        error: validation.errorMessage,
      })),
    };
  }, {});

/**
 * For a given object with form submitValues, applies validators and returns an object with
 * translatable errors (by fieldId) for failed validations.
 *
 * @param currentValues
 * @param validatorsWithErrorByFieldId
 * @param initialValues
 * @param backendErrors
 */

export const getErrorsForFormValues = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentValues: FormikValues,
  validatorsWithErrorByFieldId: ValidatorsWithErrorByFieldId,
  initialValues: FormikValues,
  backendErrors: FormErrors
): FormErrors =>
  Object.keys(currentValues).reduce<Record<string, Array<string>>>(
    (formErrors, fieldId) => {
      const localErrorsForFieldId = (
        validatorsWithErrorByFieldId[fieldId] || []
      ).reduce<Array<string>>(
        (errors, { validator, error }) =>
          !validator(currentValues[fieldId]) ? [...errors, error] : errors,
        []
      );
      // if there were initial errors visible in the form there should also have been initial
      // values. initial errors disappear when value for that field has changed
      const initialValue = initialValues[fieldId];
      const currentValue = currentValues[fieldId];
      const initialErrorsForField =
        initialValue === currentValue ? backendErrors[fieldId] || [] : [];

      const allErrorsForField = [
        ...localErrorsForFieldId,
        ...initialErrorsForField,
      ];
      return allErrorsForField.length > 0
        ? { ...formErrors, [fieldId]: allErrorsForField }
        : formErrors;
    },
    {}
  );
