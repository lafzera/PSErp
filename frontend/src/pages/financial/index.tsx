import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Badge,
  useDisclosure,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiDollarSign,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiClock
} from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Layout } from '@/components/Layout';
import { Transaction, financial } from '@/services/api';
import { useQuery, useQueryClient } from 'react-query';
import { TransactionModal } from '@/components/TransactionModal';

function StatCard({ 
  label, 
  value, 
  helpText, 
  icon: Icon,
  type = 'default'
}: { 
  label: string; 
  value: number; 
  helpText?: string;
  icon: React.ElementType;
  type?: 'income' | 'expense' | 'default';
}) {
  const colorScheme = {
    income: 'green',
    expense: 'red',
    default: 'blue',
  }[type];

  return (
    <Card bg="gray.800" borderColor="gray.700">
      <CardBody>
        <Stat>
          <HStack spacing={2} mb={2}>
            <Icon size={20} color={`${colorScheme}.400`} />
            <StatLabel color="gray.300">{label}</StatLabel>
          </HStack>
          <StatNumber color="white" fontSize="2xl">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(value)}
          </StatNumber>
          {helpText && <StatHelpText color="gray.400">{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );
}

const statusColors = {
  PAID: 'green',
  PENDING: 'yellow',
  CANCELLED: 'red',
};

const statusLabels = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
};

export default function Financial() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery(
    'transactions',
    financial.listTransactions
  );

  const { data: stats } = useQuery(
    'transaction-stats',
    financial.getTransactionStats,
    {
      initialData: {
        totalIncome: 0,
        totalExpense: 0,
        pendingIncome: 0,
      }
    }
  );

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    onOpen();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await financial.deleteTransaction(id);
      queryClient.invalidateQueries('transactions');
      queryClient.invalidateQueries('transaction-stats');
      toast({
        title: 'Transação excluída',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir transação',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Box>
            <HStack justify="space-between" align="center">
              <Box>
                <Heading size="lg" color="white">Financeiro</Heading>
                <Text color="gray.400" mt={1}>
                  Gerencie suas receitas e despesas
                </Text>
              </Box>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleNewTransaction}
                _hover={{ bg: 'blue.500' }}
                _active={{ bg: 'blue.600' }}
              >
                Nova Transação
              </Button>
            </HStack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard
              label="Receitas Totais"
              value={stats.totalIncome}
              helpText="Total de receitas"
              icon={FiArrowUpCircle}
              type="income"
            />
            <StatCard
              label="Despesas Totais"
              value={stats.totalExpense}
              helpText="Total de despesas"
              icon={FiArrowDownCircle}
              type="expense"
            />
            <StatCard
              label="Receitas Pendentes"
              value={stats.pendingIncome}
              helpText="A receber"
              icon={FiClock}
            />
          </SimpleGrid>

          <Box
            bg="gray.800"
            rounded="lg"
            shadow="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>Data</Th>
                  <Th>Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Valor</Th>
                  <Th>Status</Th>
                  <Th width="50px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>
                      {format(new Date(transaction.date), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </Td>
                    <Td>{transaction.description}</Td>
                    <Td>{transaction.category}</Td>
                    <Td>
                      <Text
                        color={transaction.type === 'INCOME' ? 'green.400' : 'red.400'}
                      >
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(transaction.value)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={statusColors[transaction.status]}
                        px={2}
                        py={1}
                        rounded="full"
                      >
                        {statusLabels[transaction.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList bg="gray.800" borderColor="gray.700">
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={() => handleEditTransaction(transaction)}
                            _hover={{ bg: 'whiteAlpha.200' }}
                            _focus={{ bg: 'whiteAlpha.200' }}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            color="red.400"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            _focus={{ bg: 'whiteAlpha.200' }}
                          >
                            Excluir
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Container>

      <TransactionModal
        isOpen={isOpen}
        onClose={onClose}
        transaction={selectedTransaction}
      />
    </Layout>
  );
} 