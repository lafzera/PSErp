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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Box,
  Image,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    status: string;
    imageUrl: string;
  };
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: number;
  status: string;
  imageUrl: string;
}

const categoryOptions = {
  ALBUM: 'Álbum',
  FRAME: 'Quadro',
  PHOTOBOOK: 'Photobook',
  PRINT: 'Impressão',
  DIGITAL: 'Digital',
};

const statusOptions = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  OUT_OF_STOCK: 'Sem Estoque',
};

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: product || {
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('category', product.category);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('status', product.status);
      setValue('imageUrl', product.imageUrl);
      setImagePreview(product.imageUrl);
    } else {
      reset({
        status: 'ACTIVE',
      });
      setImagePreview('');
    }
  }, [product, setValue, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      // TODO: Implementar integração com API
      console.log('Dados do produto:', data);
      
      toast({
        title: product ? 'Produto atualizado' : 'Produto criado',
        description: `O produto ${data.name} foi ${product ? 'atualizado' : 'criado'} com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      reset();
      setImagePreview('');
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o produto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Nome</FormLabel>
                <Input
                  {...register('name', { required: 'Nome é obrigatório' })}
                  placeholder="Nome do produto"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel>Categoria</FormLabel>
                <Select
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  placeholder="Selecione uma categoria"
                >
                  {Object.entries(categoryOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  {...register('description', { required: 'Descrição é obrigatória' })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Preço</FormLabel>
                <NumberInput min={0} precision={2}>
                  <NumberInputField
                    {...register('price', {
                      required: 'Preço é obrigatório',
                      min: { value: 0, message: 'Preço deve ser maior que 0' },
                    })}
                    placeholder="0,00"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <FormLabel>Status</FormLabel>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  {Object.entries(statusOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Imagem</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  p={1}
                />
                {imagePreview && (
                  <Box mt={2}>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      maxH="200px"
                      objectFit="contain"
                    />
                  </Box>
                )}
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
              {product ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 