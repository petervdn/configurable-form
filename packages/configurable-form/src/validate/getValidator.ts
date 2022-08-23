import { parse, differenceInYears } from "date-fns";
import { getValidation } from "./getValidation";
import { DateFormat } from "../types/types";
import { FormFieldConfig } from "../types/form.types";
import { FormFieldValidation } from "../types/form-validations.types";

const getNumberFromInputValue = (value: unknown) => {
  // todo
  // if (typeof value === "number") {
  //   return value;
  // }
  // if (typeof value === "string") {
  //   const hasDot = value.includes(".");
  //   const hasComma = value.includes(",");
  //
  //   if (hasDot && hasComma) {
  //     // we do not accept 22,000.50
  //     return undefined;
  //   }
  //
  //   // we do accept a comma, but only as decimal separator, so: 22,500 = 22.500 (= 22.5)
  //   const parsed = Number(hasComma ? value.replaceAll(",", ".") : value);
  //
  //   if (!Number.isNaN(parsed)) {
  //     return parsed;
  //   }
  // }
  return undefined;
};

const hasValue = (value: unknown) => {
  if (typeof value === "string") {
    return value !== "";
  }

  return value !== undefined && value !== null && value !== false;
};

const isValidEmail = (value: unknown) =>
  typeof value === "string" && /\S+@\S+\.\S+/.test(value);

const isInteger = (value: unknown) => {
  const result = getNumberFromInputValue(value);

  if (typeof result === "number") {
    return Number.isInteger(result);
  }

  return false;
};

const isNumber = (value: unknown) => {
  const result = getNumberFromInputValue(value);

  return typeof result === "number";
};

const isEqualOrLargerNumber = (value: unknown, minimum: number) => {
  const result = getNumberFromInputValue(value);

  if (typeof result === "number") {
    return result >= minimum;
  }

  return false;
};

const isEqualOrSmallerNumber = (value: unknown, maximum: number) => {
  const result = getNumberFromInputValue(value);

  if (typeof result === "number") {
    return result <= maximum;
  }

  return false;
};

const isValidDate = (value: unknown) =>
  value instanceof Date && !Number.isNaN(value.getTime());

const parseAsDate = (value: unknown, format: DateFormat) => {
  if (typeof value === "string") {
    const date = parse(
      value,
      format === "YYYY-MM-DD" ? "yyyy-MM-dd" : "dd-MM-yyyy",
      new Date()
    );
    return isValidDate(date) ? date : undefined;
  }
  return undefined;
};

const getAge = (date: Date) => differenceInYears(new Date(), date);

const matchesRegexp = (value: unknown, regexp: RegExp) =>
  typeof value === "string" && Boolean(value.match(regexp));

type Validator = (value: unknown) => boolean;

const hasEqualOrMoreCharacters = (value: string, minChars: number) =>
  value.length >= minChars;
const hasEqualOrLessCharacters = (value: string, maxChars: number) =>
  value.length <= maxChars;

/**
 * Gets a validator function for a specific formFieldValidation. The FormField that holds
 * the validation is also needed because in some cases the validator changes based on the
 * field type or the existence of other validators on the field.
 * @param formFieldValidation
 * @param formField
 */
export const getValidator = (
  formFieldValidation: FormFieldValidation,
  formField: Pick<FormFieldConfig, "type" | "validations">
): Validator => {
  switch (formFieldValidation.type) {
    case "REQUIRED": {
      return hasValue;
    }
    case "EMAIL": {
      return (value: unknown) => !hasValue(value) || isValidEmail(value);
    }
    case "DATE": {
      return (value: unknown) =>
        !hasValue(value) ||
        Boolean(parseAsDate(value, formFieldValidation.parameters[0]));
    }
    case "INTEGER": {
      return (value: unknown) => !hasValue(value) || isInteger(value);
    }
    case "MINIMUM": {
      return (value: unknown) =>
        !hasValue(value) ||
        isEqualOrLargerNumber(value, formFieldValidation.parameters[0]);
    }
    case "MAXIMUM": {
      return (value: unknown) =>
        !hasValue(value) ||
        isEqualOrSmallerNumber(value, formFieldValidation.parameters[0]);
    }
    case "BETWEEN": {
      return (value: unknown) =>
        !hasValue(value) ||
        (isEqualOrLargerNumber(value, formFieldValidation.parameters[0]) &&
          isEqualOrSmallerNumber(value, formFieldValidation.parameters[1]));
    }
    case "DECIMAL": {
      return (value: unknown) => !hasValue(value) || isNumber(value);
    }
    case "REGEX": {
      return (value: unknown) => {
        // param values have been validated to create a valid regex (in the regexValidationSchema)
        const [regexString, flags] = formFieldValidation.parameters;
        const regex = new RegExp(regexString, flags || "");
        return !hasValue(value) || matchesRegexp(value, regex);
      };
    }
    case "MAX_CHARS":
    case "MIN_CHARS": {
      // note that we don't put these directly on the input field (native min/maxchars prop),
      // i am not sure if we should (and what it would add). doing it all in here keeps all
      // validations in one place
      return (value: unknown) => {
        if (!hasValue(value)) {
          return true;
        }
        if (typeof value === "string") {
          const [amount] = formFieldValidation.parameters;
          return formFieldValidation.type === "MIN_CHARS"
            ? hasEqualOrMoreCharacters(value, amount)
            : hasEqualOrLessCharacters(value, amount);
        }
        return false;
      };
    }
    case "AGE_CHECK": {
      return (value: unknown) => {
        if (!hasValue(value)) {
          return true;
        }
        if (typeof value === "string") {
          let date;

          if (formField.type === "date") {
            date = parseAsDate(value, "YYYY-MM-DD"); // default format of date input
          } else {
            // type is text/textarea, if field has DATE-validation grab its format
            const formatFromValidation = getValidation(
              "DATE",
              formField.validations || []
            )?.parameters[0];

            // if there is a format, use it. otherwise, try both possible approaches
            date = formatFromValidation
              ? parseAsDate(value, formatFromValidation)
              : parseAsDate(value, "YYYY-MM-DD") ||
                parseAsDate(value, "DD-MM-YYYY");
          }
          return date
            ? getAge(date) >= formFieldValidation.parameters[0]
            : false;
        }
        return false;
      };
    }
    default: {
      throw new Error(`Unknown validation type: ${formFieldValidation.type}`);
    }
  }
};
