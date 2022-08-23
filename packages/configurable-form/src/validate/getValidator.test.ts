import type { FormFieldConfig } from 'mdlz-instant-win-sdk/src/types/form.types';
import { getValidator } from './getValidator';

const errorMessage = 'error message';

const mockField: Pick<FormFieldConfig, 'type' | 'validations'> = {
  type: 'text',
  validations: [],
};

describe('validators', () => {
  it('validates required values', () => {
    const requiredValidator = getValidator({ type: 'REQUIRED', errorMessage }, mockField);
    expect(requiredValidator('')).toBe(false);
    expect(requiredValidator(undefined)).toBe(false);
    expect(requiredValidator(0)).toBe(true);
    expect(requiredValidator('0')).toBe(true);
  });

  it('validates integer values', () => {
    const integerValidator = getValidator({ type: 'INTEGER', errorMessage }, mockField);
    expect(integerValidator('')).toBe(true);
    expect(integerValidator(undefined)).toBe(true);
    expect(integerValidator(3.5)).toBe(false);
    expect(integerValidator('3.5')).toBe(false);
    expect(integerValidator('3,5')).toBe(false);
    expect(integerValidator('3,500')).toBe(false);
  });

  it('validates decimal values', () => {
    const decimalValidator = getValidator({ type: 'DECIMAL', errorMessage }, mockField);
    expect(decimalValidator('')).toBe(true);
    expect(decimalValidator(undefined)).toBe(true);
    expect(decimalValidator('3')).toBe(true);
    expect(decimalValidator('3.0')).toBe(true);
    expect(decimalValidator('3.000001')).toBe(true);
    expect(decimalValidator(3)).toBe(true);
    // eslint-disable-next-line unicorn/no-zero-fractions
    expect(decimalValidator(3.0)).toBe(true);
    expect(decimalValidator(3.000001)).toBe(true);
    expect(decimalValidator('3,0')).toBe(true);
    expect(decimalValidator('3,000')).toBe(true);
    expect(decimalValidator('3,000.50')).toBe(false);
    expect(decimalValidator('3,000,50')).toBe(false);
    expect(decimalValidator('3.000.50')).toBe(false);
  });

  it('validates email addresses', () => {
    const emailValidator = getValidator({ type: 'EMAIL', errorMessage }, mockField);
    expect(emailValidator('')).toBe(true);
    expect(emailValidator(undefined)).toBe(true);
    expect(emailValidator('not-an-email')).toBe(false);
    expect(emailValidator('not@an-email')).toBe(false);
    expect(emailValidator('an@e.mail')).toBe(true);
  });

  it('validates dates from strings', () => {
    const yearFirstDateFormatValidator = getValidator(
      { type: 'DATE', errorMessage, parameters: ['YYYY-MM-DD'] },
      mockField,
    );
    expect(yearFirstDateFormatValidator('')).toBe(true);
    expect(yearFirstDateFormatValidator(undefined)).toBe(true);
    expect(yearFirstDateFormatValidator('2022-1-1')).toBe(true);
    expect(yearFirstDateFormatValidator('1-1-2022')).toBe(false);
    expect(yearFirstDateFormatValidator('2022-10-10')).toBe(true);
    expect(yearFirstDateFormatValidator('2022-15-10')).toBe(false);
    expect(yearFirstDateFormatValidator('2022-5-10')).toBe(true);
    expect(yearFirstDateFormatValidator('2022-02-30')).toBe(false);

    const yearLastDateFormatValidator = getValidator(
      { type: 'DATE', errorMessage, parameters: ['DD-MM-YYYY'] },
      mockField,
    );
    expect(yearLastDateFormatValidator('')).toBe(true);
    expect(yearLastDateFormatValidator(undefined)).toBe(true);
    expect(yearLastDateFormatValidator('2022-1-1')).toBe(false);
    expect(yearLastDateFormatValidator('1-1-2022')).toBe(true);
    expect(yearLastDateFormatValidator('10-10-2022')).toBe(true);
    expect(yearLastDateFormatValidator('10-15-2022')).toBe(false);
    expect(yearLastDateFormatValidator('5-10-2022')).toBe(true);
    expect(yearLastDateFormatValidator('02-30-2022')).toBe(false);
  });

  it('validates minimum number values', () => {
    const minimum100NumberValidator = getValidator(
      { type: 'MINIMUM', errorMessage, parameters: [100] },
      mockField,
    );
    expect(minimum100NumberValidator('')).toBe(true);
    expect(minimum100NumberValidator(undefined)).toBe(true);
    expect(minimum100NumberValidator(0)).toBe(false);
    expect(minimum100NumberValidator(100)).toBe(true);
    expect(minimum100NumberValidator('0')).toBe(false);
    expect(minimum100NumberValidator('100')).toBe(true);
  });

  it('validates maximum number values', () => {
    const maximum100NumberValidator = getValidator(
      { type: 'MAXIMUM', errorMessage, parameters: [100] },
      mockField,
    );
    expect(maximum100NumberValidator('')).toBe(true);
    expect(maximum100NumberValidator(undefined)).toBe(true);
    expect(maximum100NumberValidator(110)).toBe(false);
    expect(maximum100NumberValidator(100)).toBe(true);
    expect(maximum100NumberValidator('110')).toBe(false);
    expect(maximum100NumberValidator('100')).toBe(true);
  });

  it('validates between number values', () => {
    const between100And200Validator = getValidator(
      { type: 'BETWEEN', errorMessage, parameters: [100, 200] },
      mockField,
    );
    expect(between100And200Validator('')).toBe(true);
    expect(between100And200Validator(undefined)).toBe(true);
    expect(between100And200Validator(0)).toBe(false);
    expect(between100And200Validator(100)).toBe(true);
    expect(between100And200Validator(200)).toBe(true);
    expect(between100And200Validator(300)).toBe(false);
    expect(between100And200Validator('0')).toBe(false);
    expect(between100And200Validator('100')).toBe(true);
    expect(between100And200Validator('200')).toBe(true);
    expect(between100And200Validator('300')).toBe(false);
  });

  it('throws when requesting FILE_SIZE or FILE_EXTENSION validators', () => {
    // these two are valid validations, but there are no validators for them since they are
    // filtered out and used internally in the custom FileUploadField
    expect(() => {
      getValidator({ type: 'FILE_SIZE', errorMessage, parameters: [100] }, mockField);
    }).toThrow('Unknown validation type: FILE_SIZE');
    expect(() => {
      getValidator(
        { type: 'FILE_EXTENSION', errorMessage, parameters: ['some_extension'] },
        mockField,
      );
    }).toThrow('Unknown validation type: FILE_EXTENSION');
  });

  it('validates using regex', () => {
    const caseSensitiveRegexValidator = getValidator(
      { type: 'REGEX', errorMessage, parameters: ['a|b'] },
      mockField,
    );
    expect(caseSensitiveRegexValidator('')).toBe(true);
    expect(caseSensitiveRegexValidator(undefined)).toBe(true);
    expect(caseSensitiveRegexValidator('c')).toBe(false);
    expect(caseSensitiveRegexValidator('a')).toBe(true);
    expect(caseSensitiveRegexValidator('A')).toBe(false);

    const caseInsensitiveRegexValidator = getValidator(
      { type: 'REGEX', errorMessage, parameters: ['a|b', 'i'] },
      mockField,
    );

    expect(caseInsensitiveRegexValidator('')).toBe(true);
    expect(caseInsensitiveRegexValidator(undefined)).toBe(true);
    expect(caseInsensitiveRegexValidator('c')).toBe(false);
    expect(caseInsensitiveRegexValidator('a')).toBe(true);
    expect(caseInsensitiveRegexValidator('A')).toBe(true);
  });

  it('validates minimum input length', () => {
    const equalOrLongerThan5CharsValidator = getValidator(
      { type: 'MIN_CHARS', errorMessage, parameters: [5] },
      mockField,
    );
    expect(equalOrLongerThan5CharsValidator('')).toBe(true);
    expect(equalOrLongerThan5CharsValidator(undefined)).toBe(true);
    expect(equalOrLongerThan5CharsValidator('123')).toBe(false);
    expect(equalOrLongerThan5CharsValidator('12345')).toBe(true);
    expect(equalOrLongerThan5CharsValidator('123456')).toBe(true);
  });

  it('validates maximum input length', () => {
    const equalOrLessThan5CharsValidator = getValidator(
      { type: 'MAX_CHARS', errorMessage, parameters: [5] },
      mockField,
    );
    expect(equalOrLessThan5CharsValidator('')).toBe(true);
    expect(equalOrLessThan5CharsValidator(undefined)).toBe(true);
    expect(equalOrLessThan5CharsValidator('123')).toBe(true);
    expect(equalOrLessThan5CharsValidator('12345')).toBe(true);
    expect(equalOrLessThan5CharsValidator('123456')).toBe(false);
  });

  it('validates minimum age', () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const dateInputMinimumAgeValidator = getValidator(
      { type: 'AGE_CHECK', errorMessage, parameters: [20] },
      {
        type: 'date',
        validations: [],
      },
    );

    // on date input, use YYYY-MM-DD as format
    expect(dateInputMinimumAgeValidator('')).toBe(true);
    expect(dateInputMinimumAgeValidator(undefined)).toBe(true);
    expect(dateInputMinimumAgeValidator('2002-01-01')).toBe(true);
    expect(dateInputMinimumAgeValidator('01-01-2002')).toBe(false);
    expect(dateInputMinimumAgeValidator('2002-01-02')).toBe(false);

    const textFieldWithValidation = {
      type: 'text' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validations: [{ type: 'DATE' as const, parameters: ['DD-MM-YYYY'] as any, errorMessage }],
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const minimumAgeValidator_DDMMYYYY = getValidator(
      { type: 'AGE_CHECK', errorMessage, parameters: [20] },
      textFieldWithValidation,
    );

    // on a textfield (or textarea), use format of DATE-validation if it's there
    expect(minimumAgeValidator_DDMMYYYY('')).toBe(true);
    expect(minimumAgeValidator_DDMMYYYY(undefined)).toBe(true);
    expect(minimumAgeValidator_DDMMYYYY('01-01-2002')).toBe(true);
    expect(minimumAgeValidator_DDMMYYYY('2002-01-01')).toBe(false);
    expect(minimumAgeValidator_DDMMYYYY('01-02-2002')).toBe(false);

    const textFieldWithoutValidation = {
      type: 'text' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validations: [],
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const minimumAgeValidator_YYYYMMDD = getValidator(
      { type: 'AGE_CHECK', errorMessage, parameters: [20] },
      textFieldWithoutValidation,
    );

    // on textfield but without DATE-validation, both formats can be valid
    expect(minimumAgeValidator_YYYYMMDD('')).toBe(true);
    expect(minimumAgeValidator_YYYYMMDD(undefined)).toBe(true);
    expect(minimumAgeValidator_YYYYMMDD('2002-01-01')).toBe(true);
    expect(minimumAgeValidator_YYYYMMDD('01-01-2002')).toBe(true);
    expect(minimumAgeValidator_YYYYMMDD('2002-01-02')).toBe(false);
  });
});
