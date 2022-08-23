import { FormFieldValidation } from "../types/form-validations.types";

/**
 * From a list of FormFieldValidation, finds and returns a typed
 * FormField validation based on the given type.
 * @param type
 * @param validations
 */

export const getValidation = <T extends FormFieldValidation["type"]>(
  type: T,
  validations: ReadonlyArray<FormFieldValidation>
) =>
  validations.find(
    (validation): validation is Extract<FormFieldValidation, { type: T }> =>
      validation.type === type
  );
