import { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from 'react-query';
import { api } from '@/services/api';
import { Transaction, Client } from '@/types';

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['INCOME', 'EXPENSE']),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
  date: z.string(),
  clientId: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSave: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onSave,
}: TransactionModalProps) {
  const toast = useToast();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const { data: clients } = useQuery<Client[]>('clients', () =>
    api.clients.list().then(response => response.data)
  );

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        date: new Date(transaction.date).toISOString().split('T')[0],
        clientId: transaction.clientId,
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'INCOME',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        clientId: '',
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (transaction) {
        await api.transactions.update(transaction.id, data);
      } else {
        await api.transactions.create(data);
      }
      toast({
        title: transaction ? 'Transação atualizada' : 'Transação criada',
        status: 'success',
        duration: 3000,
      });
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar transação',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {transaction ? 'Editar Transação' : 'Nova Transação'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Descrição</FormLabel>
                <Input {...register('description')} />
              </FormControl>

              <FormControl isInvalid={!!errors.amount}>
                <FormLabel>Valor</FormLabel>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0.01}
                      step={0.01}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <Select {...register('type')}>
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select {...register('status')}>
                  <option value="PENDING">Pendente</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Data</FormLabel>
                <Input {...register('date')} type="date" />
              </FormControl>

              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select {...register('clientId')}>
                  <option value="">Selecione um cliente</option>
                  {clients?.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.code} - {client.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" type="submit">
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 