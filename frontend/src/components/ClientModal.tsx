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
  SimpleGrid,
  Box,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from 'react-query';
import { api } from '@/services/api';
import { Client, ClientType, Package } from '@/types';

const clientSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  address: z.object({
    cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado'),
  }),
  typeId: z.string().min(1, 'Tipo é obrigatório'),
  packageId: z.string().min(1, 'Pacote é obrigatório'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  onSave: () => void;
}

export function ClientModal({ isOpen, onClose, client, onSave }: ClientModalProps) {
  const toast = useToast();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const { data: types } = useQuery<ClientType[]>('clientTypes', () =>
    api.clientTypes.list().then(response => response.data)
  );

  const { data: packages } = useQuery<Package[]>('packages', () =>
    api.packages.list().then(response => response.data)
  );

  useEffect(() => {
    if (client) {
      reset({
        code: client.code,
        name: client.name,
        email: client.email,
        phone: client.phone,
        specialty: client.specialty,
        address: {
          cep: client.address.cep,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement || '',
          neighborhood: client.address.neighborhood,
          city: client.address.city,
          state: client.address.state,
        },
        typeId: client.type.id,
        packageId: client.packageId,
      });
    } else {
      reset({
        code: '',
        name: '',
        email: '',
        phone: '',
        specialty: '',
        address: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
        },
        typeId: '',
        packageId: '',
      });
    }
  }, [client, reset]);

  const cep = watch('address.cep');

  useEffect(() => {
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
          if (!data.erro) {
            setValue('address.street', data.logradouro);
            setValue('address.neighborhood', data.bairro);
            setValue('address.city', data.localidade);
            setValue('address.state', data.uf);
          }
        });
    }
  }, [cep, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client) {
        await api.clients.update(client.id, data);
      } else {
        await api.clients.create(data);
      }
      toast({
        title: client ? 'Cliente atualizado' : 'Cliente criado',
        status: 'success',
        duration: 3000,
      });
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar cliente',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{client ? 'Editar Cliente' : 'Novo Cliente'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isInvalid={!!errors.code}>
                  <FormLabel>Código</FormLabel>
                  <Input {...register('code')} />
                </FormControl>

                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Nome</FormLabel>
                  <Input {...register('name')} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input {...register('email')} type="email" />
                </FormControl>

                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel>Telefone</FormLabel>
                  <Input {...register('phone')} />
                </FormControl>
              </SimpleGrid>

              <FormControl isInvalid={!!errors.specialty}>
                <FormLabel>Especialidade</FormLabel>
                <Input {...register('specialty')} />
              </FormControl>

              <Box width="100%" p={4} borderWidth={1} borderRadius="md">
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.address?.cep}>
                    <FormLabel>CEP</FormLabel>
                    <Input {...register('address.cep')} maxLength={8} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} width="100%">
                    <FormControl isInvalid={!!errors.address?.street}>
                      <FormLabel>Rua</FormLabel>
                      <Input {...register('address.street')} />
                    </FormControl>

                    <FormControl isInvalid={!!errors.address?.number}>
                      <FormLabel>Número</FormLabel>
                      <Input {...register('address.number')} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Complemento</FormLabel>
                    <Input {...register('address.complement')} />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4} width="100%">
                    <FormControl isInvalid={!!errors.address?.neighborhood}>
                      <FormLabel>Bairro</FormLabel>
                      <Input {...register('address.neighborhood')} />
                    </FormControl>

                    <FormControl isInvalid={!!errors.address?.city}>
                      <FormLabel>Cidade</FormLabel>
                      <Input {...register('address.city')} />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isInvalid={!!errors.address?.state}>
                    <FormLabel>Estado</FormLabel>
                    <Input {...register('address.state')} maxLength={2} />
                  </FormControl>
                </VStack>
              </Box>

              <SimpleGrid columns={2} spacing={4} width="100%">
                <FormControl isInvalid={!!errors.typeId}>
                  <FormLabel>Tipo</FormLabel>
                  <Select {...register('typeId')}>
                    <option value="">Selecione um tipo</option>
                    {types?.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isInvalid={!!errors.packageId}>
                  <FormLabel>Pacote</FormLabel>
                  <Select {...register('packageId')}>
                    <option value="">Selecione um pacote</option>
                    {packages?.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - R$ {pkg.price}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
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