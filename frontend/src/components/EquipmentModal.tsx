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
  Textarea,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Equipment } from '@/types';
import { inventory } from '@/services/api';
import { useQueryClient } from 'react-query';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.enum(['CAMERA', 'LENS', 'LIGHTING', 'SUPPORT', 'ACCESSORY']),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'LOW_STOCK']),
  quantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  minQuantity: z.number().min(0, 'Quantidade mínima não pode ser negativa'),
  location: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: Equipment;
}

export function EquipmentModal({ isOpen, onClose, equipment }: EquipmentModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment ? {
      ...equipment,
      purchasePrice: equipment.purchasePrice ? Number(equipment.purchasePrice) : undefined,
    } : undefined,
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      if (equipment) {
        await inventory.updateEquipment(equipment.id, data);
        toast({
          title: 'Equipamento atualizado',
          status: 'success',
          duration: 3000,
        });
      } else {
        await inventory.createEquipment(data);
        toast({
          title: 'Equipamento criado',
          status: 'success',
          duration: 3000,
        });
      }
      queryClient.invalidateQueries('equipments');
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar equipamento',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>
          {equipment ? 'Editar Equipamento' : 'Novo Equipamento'}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Nome</FormLabel>
                <Input
                  {...register('name')}
                  placeholder="Nome do equipamento"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input
                  {...register('brand')}
                  placeholder="Marca"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input
                  {...register('model')}
                  placeholder="Modelo"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Número de Série</FormLabel>
                <Input
                  {...register('serialNumber')}
                  placeholder="Número de série"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel>Categoria</FormLabel>
                <Select {...register('category')}>
                  <option value="CAMERA">Câmera</option>
                  <option value="LENS">Lente</option>
                  <option value="LIGHTING">Iluminação</option>
                  <option value="SUPPORT">Suporte</option>
                  <option value="ACCESSORY">Acessório</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <FormLabel>Status</FormLabel>
                <Select {...register('status')}>
                  <option value="AVAILABLE">Disponível</option>
                  <option value="IN_USE">Em Uso</option>
                  <option value="MAINTENANCE">Em Manutenção</option>
                  <option value="LOW_STOCK">Estoque Baixo</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.quantity}>
                <FormLabel>Quantidade</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    {...register('quantity', { valueAsNumber: true })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isInvalid={!!errors.minQuantity}>
                <FormLabel>Quantidade Mínima</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    {...register('minQuantity', { valueAsNumber: true })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Localização</FormLabel>
                <Input
                  {...register('location')}
                  placeholder="Localização do equipamento"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Data de Compra</FormLabel>
                <Input
                  type="date"
                  {...register('purchaseDate')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Preço de Compra</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    {...register('purchasePrice', { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Fornecedor</FormLabel>
                <Input
                  {...register('supplier')}
                  placeholder="Nome do fornecedor"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Observações</FormLabel>
                <Textarea
                  {...register('notes')}
                  placeholder="Observações adicionais"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 