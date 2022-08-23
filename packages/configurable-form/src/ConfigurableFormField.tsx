import { Field } from "formik";
import { SelectField } from "./fields/SelectField";
import { RadioField } from "./fields/RadioField";
import { FormFieldConfig } from "./types/form.types";

type Props = {
  field: FormFieldConfig;
};

export const ConfigurableFormField = ({ field }: Props) => {
  const { id, type, placeholder } = field;

  switch (type) {
    case "select": {
      return <SelectField field={field} />;
    }
    case "radio": {
      return <RadioField field={field} />;
    }
    case "text":
    case "tel":
    case "checkbox":
    case "date":
    case "textarea": {
      return (
        <Field as="input" name={id} type={type} placeholder={placeholder} />
      );
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new Error(`Unhandled form field type: ${field.type}`);
    }
  }
};
