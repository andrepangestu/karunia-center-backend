import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

const formatErrors = (
  errors: ValidationError[],
  parent = '',
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    const path = parent ? `${parent}.${error.property}` : error.property;

    if (error.constraints) {
      result[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(result, formatErrors(error.children, path));
    }
  }

  return result;
};

export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        message: 'Validation failed',
        errors: formatErrors(errors),
      }),
  });
