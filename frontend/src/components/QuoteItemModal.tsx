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
  Text,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from 'react-query';
import { api } from '@/services/api';
import { QuoteItem, Product } from '@/types';

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  unitPrice: z.number().min(0.01, 'Valor unitário deve ser maior que zero'),
  productId: z.string().optional(),
});

type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

interface QuoteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteItem?: QuoteItem;
  onSave: (data: QuoteItemFormData) => void;
}

export function QuoteItemModal({
  isOpen,
  onClose,
  quoteItem,
  onSave,
}: QuoteItemModalProps) {
  const toast = useToast();
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<QuoteItemFormData>({
    resolver: zodResolver(quoteItemSchema),
  });

  const { data: products } = useQuery<Product[]>('products', () =>
    api.products.list().then(response => response.data)
  );

  const selectedProductId = watch('productId');
  const selectedProduct = products?.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setValue('unitPrice', selectedProduct.price);
      setValue('description', selectedProduct.description || selectedProduct.name);
    }
  }, [selectedProduct, setValue]);

  useEffect(() => {
    if (quoteItem) {
      reset({
        description: quoteItem.description,
        quantity: quoteItem.quantity,
        unitPrice: quoteItem.unitPrice,
        productId: quoteItem.productId,
      });
    } else {
      reset({
        description: '',
        quantity: 1,
        unitPrice: 0,
        productId: '',
      });
    }
  }, [quoteItem, reset]);

  const onSubmit = async (data: QuoteItemFormData) => {
    try {
      onSave(data);
      toast({
        title: quoteItem ? 'Item atualizado' : 'Item adicionado',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar item',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const quantity = watch('quantity') || 0;
  const unitPrice = watch('unitPrice') || 0;
  const total = quantity * unitPrice;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {quoteItem ? 'Editar Item' : 'Novo Item'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Produto</FormLabel>
                <Select {...register('productId')}>
                  <option value="">Selecione um produto</option>
                  {products?.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Descrição</FormLabel>
                <Input {...register('description')} />
              </FormControl>

              <FormControl isInvalid={!!errors.quantity}>
                <FormLabel>Quantidade</FormLabel>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={1}
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

              <FormControl isInvalid={!!errors.unitPrice}>
                <FormLabel>Valor Unitário</FormLabel>
                <Controller
                  name="unitPrice"
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
                <FormLabel>Total</FormLabel>
                <Text fontSize="lg" fontWeight="bold">
                  R$ {total.toFixed(2)}
                </Text>
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