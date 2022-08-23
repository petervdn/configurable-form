// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { FieldsContainer } from '../types/form.types';

export const getAllNestedContainerIds = (
  containers: Array<FieldsContainer>,
  results: Array<string> = [],
): Array<string> =>
  containers.reduce<Array<string>>(
    (accumulator, { id, children }) => [
      ...accumulator,
      id,
      ...getAllNestedContainerIds(children || []),
    ],
    results,
  );
