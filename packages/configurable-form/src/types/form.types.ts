import { z } from "zod";
import { getAllNestedContainerIds } from "../util/getAllNestedContainerIds";
import { imageSchema } from "./types";
import {
  ageCheckValidationSchema,
  betweenNumbersValidationSchema,
  dateFormatValidationSchema,
  decimalValidationSchema,
  emailValidationSchema,
  integerValidationSchema,
  maximumNumberValidationSchema,
  minCharsValidationSchema,
  maxCharsValidationSchema,
  minimumNumberValidationSchema,
  regexValidationSchema,
  requiredValidationSchema,
} from "./form-validations.types";

export type FormErrors = Record<string, Array<string>>;
// export const fieldsContainersSchema = z.record(z.any());
// export type FieldsContainers = z.infer<typeof fieldsContainersSchema>;

const baseFormFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  initialValue: z.string().optional(),
  container: z.string().optional(),
});

// shortcut-union for some fields below
const textInputValidations = z.union([
  requiredValidationSchema,
  integerValidationSchema,
  decimalValidationSchema,
  minimumNumberValidationSchema,
  maximumNumberValidationSchema,
  betweenNumbersValidationSchema,
  emailValidationSchema,
  dateFormatValidationSchema,
  ageCheckValidationSchema,
  regexValidationSchema,
  minCharsValidationSchema,
  maxCharsValidationSchema,
]);

// used for select & radio
const formFieldSelectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  image: imageSchema.optional(),
});

// define each field separately, so we can (dis)allow specific validations
const textFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("text"),
    validations: z.array(textInputValidations).optional(),
  })
);

const textAreaFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("textarea"),
    validations: z.array(textInputValidations).optional(),
  })
);

const checkboxFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("checkbox"),
    validations: z.array(requiredValidationSchema).optional(),
    initialValue: z.enum(["true", "false"]).optional(),
  })
);

const telephoneFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("tel"),
    validations: z.array(requiredValidationSchema).optional(),
  })
);

const dateFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("date"),
    validations: z
      .array(z.union([requiredValidationSchema, ageCheckValidationSchema]))
      .optional(),
  })
);
const selectFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("select"),
    selectOptions: z.array(formFieldSelectOptionSchema),
    validations: z.array(requiredValidationSchema).optional(),
  })
);

// todo: doesnt need placeholder?
const radioFieldSchema = baseFormFieldSchema.and(
  z.object({
    type: z.literal("radio"),
    selectOptions: z.array(formFieldSelectOptionSchema),
    validations: z.array(requiredValidationSchema).optional(),
  })
);

export const formFieldSchema = z.union([
  textFieldSchema,
  textAreaFieldSchema,
  checkboxFieldSchema,

  radioFieldSchema,
  selectFieldSchema,
  dateFieldSchema,
  telephoneFieldSchema,
]);

// make zod work with recursive types: https://github.com/colinhacks/zod#recursive-types
export type FieldsContainer = {
  id: string;
  children?: Array<FieldsContainer>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const fieldsContainersSchema: z.ZodType<FieldsContainer> = z.lazy(() =>
  z.object({
    id: z.string(),
    children: z.array(fieldsContainersSchema).optional(),
  })
);
export const formSchema = z
  .object({
    fields: z.array(formFieldSchema),
    containers: z.array(fieldsContainersSchema).optional(),
  })
  .superRefine((form, context) => {
    if (form.containers) {
      const keys = getAllNestedContainerIds(form.containers || []);

      if (keys.length !== new Set(keys).size) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Form has duplicate keys",
        });
      }

      form.fields.forEach((field) => {
        if (!field.container) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Field ${field.id} has no container (is required when fieldsStructure is set)`,
          });
        }
      });
      // todo
      // form.fields.forEach((field) => {
      //   if (!keys.includes(field.container || '')) {
      //     context.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       message: `Field ${field.id} has container value "${field.container}" which does not exist in the structure`,
      //     });
      //   }
      // });
    }
  });

export type FormConfig = z.infer<typeof formSchema>;
export type FormFieldConfig = z.infer<typeof formFieldSchema>;
export type SelectFieldConfig = z.infer<typeof selectFieldSchema>;
export type RadioFieldConfig = z.infer<typeof radioFieldSchema>;
export type DateFieldConfig = z.infer<typeof dateFieldSchema>;
export type TextFieldConfig = z.infer<typeof textFieldSchema>;
export type CheckboxFieldConfig = z.infer<typeof checkboxFieldSchema>;
