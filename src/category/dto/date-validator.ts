import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export default function IsValidDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate: (value: any, args: ValidationArguments) => {
          const date = new Date(value);
          return !isNaN(date.getTime());
        },
        defaultMessage: () => `Invalid date format`,
      },
    });
  };
}
