import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsNotBlankConstraint implements ValidatorConstraintInterface {
  /**
   * Validate if a value is not empty
   * @param {any} value - The value to validate
   * @returns {boolean} True if the value is not empty, false otherwise
   */
  validate(value: any) {
    return typeof value === 'string' && value.trim().length > 0;
  }
  /**
   * Get the default message for the validator
   * @param {ValidationArguments} args - The validation arguments
   * @returns {string} The default message
   */
  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be empty.`;
  }
}

/**
 * Validate if a value is not empty
 * @param {ValidationOptions} validationOptions - The validation options
 * @returns {Function} The decorator function
 */
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotBlankConstraint,
    });
  };
}

export function IsValidTag(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidTag',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Tag cannot contain spaces, accents, cedillas, or special characters',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Only allow letters, numbers, and underscores
          return /^[a-zA-Z0-9_]+$/.test(value);
        },
      },
    });
  };
}
