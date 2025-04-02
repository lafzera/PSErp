import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  HStack,
  Text,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { FiMoreVertical, FiPlus } from 'react-icons/fi';
import { Layout } from '@/components/Layout';
import { ProductModal } from '@/components/ProductModal';
import { useState } from 'react';

// Dados mockados para exemplo
const mockProducts = [
  {
    id: '1',
    name: 'Álbum Premium 30x30',
    category: 'ALBUM',
    description: 'Álbum fotográfico premium com capa personalizada',
    price: 850.00,
    status: 'ACTIVE',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'Quadro Canvas 60x40',
    category: 'FRAME',
    description: 'Impressão em canvas com acabamento premium',
    price: 350.00,
    status: 'ACTIVE',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    name: 'Photobook Clássico',
    category: 'PHOTOBOOK',
    description: 'Photobook com 20 páginas em papel fotográfico',
    price: 450.00,
    status: 'INACTIVE',
    imageUrl: 'https://via.placeholder.com/150',
  },
];

const categoryLabels = {
  ALBUM: 'Álbum',
  FRAME: 'Quadro',
  PHOTOBOOK: 'Photobook',
  PRINT: 'Impressão',
  DIGITAL: 'Digital',
};

const statusColors = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  OUT_OF_STOCK: 'red',
};

const statusLabels = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  OUT_OF_STOCK: 'Sem Estoque',
};

function ProductCard({ product }: { product: typeof mockProducts[0] }) {
  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <Box position="relative" paddingTop="100%" overflow="hidden" borderRadius="md">
            <Image
              src={product.imageUrl}
              alt={product.name}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
          <Stack spacing={2}>
            <Heading size="md" noOfLines={1}>{product.name}</Heading>
            <Text color="gray.600" noOfLines={2}>{product.description}</Text>
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="xl">
                {product.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
              <Badge colorScheme={statusColors[product.status as keyof typeof statusColors]}>
                {statusLabels[product.status as keyof typeof statusLabels]}
              </Badge>
            </HStack>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function Products() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | undefined>();

  const handleEdit = (product: typeof mockProducts[0]) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleNewProduct = () => {
    setSelectedProduct(undefined);
    onOpen();
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg">Produtos</Heading>
              <Text color="gray.600" mt={1}>
                Gerencie seus produtos e serviços
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleNewProduct}
            >
              Novo Produto
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>

          <Card>
            <CardBody>
              <Stack spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Lista de Produtos</Heading>
                </HStack>

                <Table>
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Categoria</Th>
                      <Th>Status</Th>
                      <Th isNumeric>Preço</Th>
                      <Th width="4"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mockProducts.map((product) => (
                      <Tr key={product.id}>
                        <Td>{product.name}</Td>
                        <Td>
                          {categoryLabels[product.category as keyof typeof categoryLabels]}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColors[product.status as keyof typeof statusColors]}>
                            {statusLabels[product.status as keyof typeof statusLabels]}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold">
                            {product.price.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem onClick={() => handleEdit(product)}>Editar</MenuItem>
                              <MenuItem>Ver Detalhes</MenuItem>
                              <MenuItem>Alterar Status</MenuItem>
                              <MenuItem>Gerenciar Variações</MenuItem>
                              <MenuItem color="red.500">Excluir</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Container>
      <ProductModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
      />
    </Layout>
  );
} 