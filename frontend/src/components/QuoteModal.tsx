import { useState } from 'react';
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
  Select,
  Stack,
  FormErrorMessage,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  Box,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client, Quote, clients, quotes } from '@/services/api';
import { useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote?: Quote;
}

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0, 'Valor unitário deve ser maior ou igual a 0'),
});

const quoteSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  validUntil: z.string().min(1, 'Data de validade é obrigatória'),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos um item'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export function QuoteModal({ isOpen, onClose, quote }: QuoteModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar lista de clientes
  const { data: clientsList } = useQuery<Client[]>('clients', clients.list);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: quote
      ? {
          clientId: quote.clientId,
          title: quote.title,
          description: quote.description,
          validUntil: format(new Date(quote.validUntil), 'yyyy-MM-dd'),
          items: quote.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : {
          items: [{ description: '', quantity: 1, unitPrice: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Calcular total do orçamento
  const items = watch('items');
  const total = items?.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const onSubmit = async (data: QuoteFormData) => {
    try {
      setIsSubmitting(true);

      if (quote) {
        await quotes.update(quote.id, {
          ...data,
          total,
        });
      } else {
        await quotes.create({
          ...data,
          status: 'DRAFT',
          total,
        });
      }

      queryClient.invalidateQueries('quotes');
      toast({
        title: quote ? 'Orçamento atualizado' : 'Orçamento criado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar orçamento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent bg="gray.800" borderColor="gray.700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
            {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.clientId}>
                <FormLabel>Cliente</FormLabel>
                <Select
                  placeholder="Selecione um cliente"
                  {...register('clientId')}
                >
                  {clientsList?.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
                {errors.clientId && (
                  <FormErrorMessage>
                    {errors.clientId.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Título</FormLabel>
                <Input
                  placeholder="Ex: Ensaio de Casamento"
                  {...register('title')}
                />
                {errors.title && (
                  <FormErrorMessage>
                    {errors.title.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Descrição (opcional)</FormLabel>
                <Input
                  placeholder="Descrição do orçamento"
                  {...register('description')}
                />
                {errors.description && (
                  <FormErrorMessage>
                    {errors.description.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.validUntil}>
                <FormLabel>Validade</FormLabel>
                <Input
                  type="date"
                  {...register('validUntil')}
                />
                {errors.validUntil && (
                  <FormErrorMessage>
                    {errors.validUntil.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <Box>
                <FormLabel>Itens</FormLabel>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Descrição</Th>
                      <Th>Qtd</Th>
                      <Th>Valor Unit.</Th>
                      <Th>Total</Th>
                      <Th width="4"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {fields.map((field, index) => {
                      const itemTotal =
                        (items[index]?.quantity || 0) *
                        (items[index]?.unitPrice || 0);

                      return (
                        <Tr key={field.id}>
                          <Td>
                            <Input
                              size="sm"
                              placeholder="Descrição do item"
                              {...register(`items.${index}.description`)}
                            />
                          </Td>
                          <Td>
                            <NumberInput size="sm" min={1}>
                              <NumberInputField
                                {...register(`items.${index}.quantity`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </NumberInput>
                          </Td>
                          <Td>
                            <NumberInput size="sm" min={0}>
                              <NumberInputField
                                {...register(`items.${index}.unitPrice`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </NumberInput>
                          </Td>
                          <Td>
                            {itemTotal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Remover item"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => remove(index)}
                              isDisabled={fields.length === 1}
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>

                <HStack justify="space-between" mt={4}>
                  <Button
                    leftIcon={<FiPlus />}
                    size="sm"
                    onClick={() =>
                      append({ description: '', quantity: 1, unitPrice: 0 })
                    }
                  >
                    Adicionar Item
                  </Button>
                  <Text fontSize="lg" fontWeight="bold">
                    Total:{' '}
                    {total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </Text>
                </HStack>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="gray.700">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              {quote ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 