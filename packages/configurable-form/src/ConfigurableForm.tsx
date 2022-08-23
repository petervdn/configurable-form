import { Form, Formik, FormikValues } from "formik";
// todo export formfield from root (and check other imports)
import { useMemo, useState } from "react";
import {
  getErrorsForFormValues,
  getValidatorsWithErrorByFieldId,
} from "./validate/validate";
import {
  createInitialFormValues,
  createInitialTouchedValues,
} from "./form.util";
import { ConfigurableFormField } from "./ConfigurableFormField";
import { FormErrors, FormFieldConfig } from "./types/form.types";
import { FormValues } from "./types/types";

export type FormSubmit = (
  values: FormValues,
  setErrors: (errors: FormErrors) => void
) => any;

type Props = {
  onSubmit: FormSubmit;
  initialErrors?: FormErrors;
  initialValues?: FormikValues;
  fields: ReadonlyArray<FormFieldConfig>;
};

export const ConfigurableForm = ({
  fields,
  onSubmit,
  initialErrors,
  initialValues,
}: Props) => {
  const [backendErrors, setBackendErrors] = useState<FormErrors>(
    initialErrors || {}
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialFormValues = useMemo(
    () => createInitialFormValues(fields, initialValues),
    []
  );
  const initialTouched = useMemo(
    () => createInitialTouchedValues(initialFormValues, initialErrors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  // collect the validators outside Formik component's validate prop because Formik
  // silently catches every error in there (app should break if something fails)
  const validatorsWithErrorByFieldId = useMemo(
    () => getValidatorsWithErrorByFieldId(fields),
    [fields]
  );

  const validate = (formValues: FormikValues) =>
    getErrorsForFormValues(
      formValues,
      validatorsWithErrorByFieldId,
      initialFormValues,
      backendErrors
    );

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={async (values, { setErrors }) => {
        setBackendErrors({});
        onSubmit(values, (errors: FormErrors) => {
          // errors need to be immediately shown but also stored, otherwise they
          // are gone whenever the validator function runs again
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setErrors(errors as any);
          setBackendErrors(errors);
        });
      }}
      validate={validate}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialErrors={initialErrors as any} // these errors disappear on first validate
      initialTouched={initialTouched}
    >
      {({ errors, isSubmitting, touched }) => (
        <Form>
          {fields.map((field) => {
            const { id, label } = field;
            /*
              Even though the validate function above returns Record<string, Array<string> (errors
              for each fieldId) I am allowed to pass it to the Formik component.
              However, the errors object inside here is typed as Record<string, string>, which is
              not correct (it is the aforementioned return value of validate: Record<string, Array<string>)
              which is why the 'as any' occurs below.

              It is possible to actually return the desired Record<string, string>, but switching
              locale while an error is showing would in that case not change the text.

              https://github.com/jaredpalmer/formik/issues/1292
              */

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorsForField: Array<string> = (errors[id] as any) || [];
            const fieldHasBeenTouched = Boolean(touched[id]);

            return (
              <div key={id}>
                <label htmlFor={id}>{label}</label>
                <ConfigurableFormField field={field} />
                {fieldHasBeenTouched &&
                  errorsForField.map((error, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={index} style={{ color: "red", fontSize: 12 }}>
                      {error}
                    </p>
                  ))}
              </div>
            );
          })}
          {/* todo: do we need a submit label? */}
          <button disabled={isSubmitting} type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};
