import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Stack,
  Select,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from './FormField';
import { Session, Client } from '@/services/api';
import { useQuery } from 'react-query';

const sessionSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
  type: z.string().min(1, 'Selecione um tipo de sessão'),
  notes: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => Promise<void>;
  initialData?: Partial<Session>;
  isLoading?: boolean;
}

const sessionTypes = [
  { value: 'WEDDING', label: 'Casamento' },
  { value: 'BIRTHDAY', label: 'Aniversário' },
  { value: 'FAMILY', label: 'Família' },
  { value: 'PORTRAIT', label: 'Retrato' },
  { value: 'EVENT', label: 'Evento' },
];

export function SessionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false
}: SessionModalProps) {
  // TODO: Implementar busca real de clientes
  const mockClients: Client[] = [
    { id: '1', name: 'Cliente Teste', email: 'teste@email.com', sessions: [] }
  ];

  const { data: clients = mockClients } = useQuery('clients', () => mockClients);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      time: initialData.date ? new Date(initialData.date).toISOString().split('T')[1].slice(0, 5) : '',
    } : undefined
  });

  async function handleFormSubmit(data: SessionFormData) {
    const combinedDate = new Date(`${data.date}T${data.time}`).toISOString();
    await onSubmit({
      ...data,
      date: combinedDate,
    });
    reset();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            {initialData ? 'Editar Sessão' : 'Nova Sessão'}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.clientId}>
                <FormLabel>Cliente</FormLabel>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} placeholder="Selecione um cliente">
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <Stack direction="row" spacing={4}>
                <FormControl isInvalid={!!errors.date}>
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="date"
                    {...register('date')}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.time}>
                  <FormLabel>Horário</FormLabel>
                  <Input
                    type="time"
                    {...register('time')}
                  />
                </FormControl>
              </Stack>

              <FormControl isInvalid={!!errors.type}>
                <FormLabel>Tipo de Sessão</FormLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} placeholder="Selecione o tipo">
                      {sessionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <FormField
                label="Observações"
                name="notes"
                register={register}
                error={errors.notes}
                isTextarea
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
            >
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 