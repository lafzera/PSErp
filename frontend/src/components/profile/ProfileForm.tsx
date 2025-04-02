import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  InputGroup,
  InputLeftAddon,
  Stack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave } from 'react-icons/fi';
import { Profile } from '@/services/api';

// Schema de validação para o formulário
const profileSchema = z.object({
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Profile;
  onSubmit: (data: Partial<Profile>) => void;
  isLoading: boolean;
}

export function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialData?.bio || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      socialMedia: {
        instagram: initialData?.socialMedia?.instagram || '',
        facebook: initialData?.socialMedia?.facebook || '',
        linkedin: initialData?.socialMedia?.linkedin || '',
        website: initialData?.socialMedia?.website || '',
      },
    },
  });

  const handleFormSubmit = (data: ProfileFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.bio}>
          <FormLabel>Biografia</FormLabel>
          <Textarea
            {...register('bio')}
            placeholder="Conte um pouco sobre você"
            rows={4}
          />
          {errors.bio && <FormErrorMessage>{errors.bio.message}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Telefone</FormLabel>
          <Input
            {...register('phone')}
            placeholder="(00) 00000-0000"
          />
          {errors.phone && <FormErrorMessage>{errors.phone.message}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.address}>
          <FormLabel>Endereço</FormLabel>
          <Input
            {...register('address')}
            placeholder="Seu endereço completo"
          />
          {errors.address && <FormErrorMessage>{errors.address.message}</FormErrorMessage>}
        </FormControl>

        <Box>
          <FormLabel>Redes Sociais</FormLabel>
          <Stack spacing={4}>
            <FormControl>
              <InputGroup>
                <InputLeftAddon>@</InputLeftAddon>
                <Input
                  {...register('socialMedia.instagram')}
                  placeholder="Instagram"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <InputGroup>
                <InputLeftAddon>facebook.com/</InputLeftAddon>
                <Input
                  {...register('socialMedia.facebook')}
                  placeholder="Facebook"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <InputGroup>
                <InputLeftAddon>linkedin.com/in/</InputLeftAddon>
                <Input
                  {...register('socialMedia.linkedin')}
                  placeholder="LinkedIn"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <InputGroup>
                <InputLeftAddon>https://</InputLeftAddon>
                <Input
                  {...register('socialMedia.website')}
                  placeholder="Website"
                />
              </InputGroup>
            </FormControl>
          </Stack>
        </Box>

        <Box>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<FiSave />}
            isLoading={isLoading}
            loadingText="Salvando..."
            isDisabled={!isDirty}
          >
            Salvar Alterações
          </Button>
        </Box>
      </VStack>
    </form>
  );
} 