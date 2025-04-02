import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputProps,
  Textarea,
  TextareaProps
} from '@chakra-ui/react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormFieldProps extends Omit<InputProps, 'name'> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  type?: string;
  isTextarea?: boolean;
  textareaProps?: TextareaProps;
}

export function FormField({
  label,
  name,
  register,
  error,
  type = 'text',
  isTextarea = false,
  textareaProps,
  ...props
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      {isTextarea ? (
        <Textarea
          id={name}
          {...register(name)}
          {...textareaProps}
        />
      ) : (
        <Input
          id={name}
          type={type}
          {...register(name)}
          {...props}
        />
      )}
      <FormErrorMessage>
        {error?.message}
      </FormErrorMessage>
    </FormControl>
  );
} 