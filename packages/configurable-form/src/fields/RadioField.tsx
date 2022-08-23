import { Field } from "formik";
import { RadioFieldConfig } from "../types/form.types";

type Props = {
  field: RadioFieldConfig;
};

export const RadioField = ({ field }: Props) => {
  const { id, selectOptions } = field;

  return (
    <div>
      {selectOptions.map(({ value, label, image }) => (
        <label key={value}>
          <Field key={value} value={value} name={id} type="radio" />
          {label}
          {image && (
            <img src={image.url} alt={image.alt} style={{ width: "100px" }} />
          )}
        </label>
      ))}
    </div>
  );
};
