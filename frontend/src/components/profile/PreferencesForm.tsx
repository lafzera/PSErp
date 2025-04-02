import { useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  VStack,
  Switch,
  Select,
  useColorMode,
  Text,
  Box,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { Profile } from '@/services/api';

interface PreferencesFormProps {
  initialData?: Profile['preferences'];
  onSubmit: (data: Profile['preferences']) => void;
  isLoading: boolean;
}

export function PreferencesForm({ initialData, onSubmit, isLoading }: PreferencesFormProps) {
  const { colorMode, setColorMode } = useColorMode();
  
  // Usar o react-hook-form para gerenciar o formulário
  const { register, handleSubmit, setValue, watch } = useForm<Profile['preferences']>({
    defaultValues: {
      notifications: initialData?.notifications || true,
      theme: initialData?.theme || 'light',
      language: initialData?.language || 'pt-BR',
    },
  });

  // Observar mudanças no tema selecionado
  const selectedTheme = watch('theme');
  
  // Atualizar o tema do Chakra quando o tema selecionado mudar
  useEffect(() => {
    if (selectedTheme && selectedTheme !== colorMode) {
      setColorMode(selectedTheme);
    }
  }, [selectedTheme, colorMode, setColorMode]);

  const handleFormSubmit = (data: Profile['preferences']) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={6} align="stretch">
        <Text>
          Configure suas preferências de uso do sistema para uma experiência personalizada.
        </Text>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="notifications" mb="0">
            Notificações
          </FormLabel>
          <Switch 
            id="notifications"
            colorScheme="blue"
            {...register('notifications')}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="theme">Tema</FormLabel>
          <Select 
            id="theme"
            {...register('theme')}
            onChange={(e) => {
              setValue('theme', e.target.value as 'light' | 'dark');
              setColorMode(e.target.value as 'light' | 'dark');
            }}
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="language">Idioma</FormLabel>
          <Select 
            id="language"
            {...register('language')}
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
          </Select>
        </FormControl>

        <Box>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<FiSave />}
            isLoading={isLoading}
            loadingText="Salvando..."
          >
            Salvar Preferências
          </Button>
        </Box>
      </VStack>
    </form>
  );
} 