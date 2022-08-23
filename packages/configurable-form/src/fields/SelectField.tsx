import { Field } from "formik";
import { SelectFieldConfig } from "../types/form.types";

type Props = {
  field: SelectFieldConfig;
};

// todo: do we allow multi?
export const SelectField = ({ field }: Props) => {
  const { id, placeholder, selectOptions } = field;

  return (
    <Field name={id} as="select">
      <option value="">{placeholder}</option>
      {selectOptions.map(({ value, label }) => (
        <option value={value} key={value}>
          {label}
        </option>
      ))}
    </Field>
  );
};
