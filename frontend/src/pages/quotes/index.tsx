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
  FiMail, 
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Layout } from '@/components/Layout';
import { Quote, quotes } from '@/services/api';
import { useQuery, useQueryClient } from 'react-query';
import { QuoteModal } from '@/components/QuoteModal';

// Componente para o card de estatísticas
function StatCard({ 
  label, 
  value, 
  helpText, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  helpText?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardBody>
        <Stat>
          <HStack spacing={2} mb={2}>
            <Icon size={20} />
            <StatLabel>{label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );
}

// Função para formatar o status do orçamento
function getStatusBadge(status: Quote['status']) {
  const statusConfig = {
    DRAFT: { color: 'gray', text: 'Rascunho' },
    SENT: { color: 'blue', text: 'Enviado' },
    APPROVED: { color: 'green', text: 'Aprovado' },
    REJECTED: { color: 'red', text: 'Rejeitado' },
    EXPIRED: { color: 'orange', text: 'Expirado' }
  };

  const config = statusConfig[status];
  return <Badge colorScheme={config.color}>{config.text}</Badge>;
}

export default function Quotes() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();

  // Buscar orçamentos
  const { data: quotesList, isLoading } = useQuery<Quote[]>('quotes', quotes.list);

  // Calcular estatísticas
  const stats = {
    total: quotesList?.length || 0,
    approved: quotesList?.filter(q => q.status === 'APPROVED').length || 0,
    pending: quotesList?.filter(q => q.status === 'SENT').length || 0,
    value: quotesList?.reduce((acc, q) => acc + q.total, 0) || 0
  };

  // Funções de ação
  const handleNewQuote = () => {
    setSelectedQuote(undefined);
    onOpen();
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    onOpen();
  };

  const handleDeleteQuote = async (id: string) => {
    try {
      await quotes.delete(id);
      queryClient.invalidateQueries('quotes');
      toast({
        title: 'Orçamento excluído',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir orçamento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendQuote = async (id: string) => {
    try {
      await quotes.sendByEmail(id);
      toast({
        title: 'Orçamento enviado por e-mail',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar orçamento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: Quote['status']) => {
    try {
      await quotes.updateStatus(id, status);
      queryClient.invalidateQueries('quotes');
      toast({
        title: 'Status atualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          {/* Cabeçalho */}
          <Box>
            <HStack justify="space-between" align="center" mb={8}>
              <Box>
                <Heading size="lg">Orçamentos</Heading>
                <Text mt={1}>
                  Gerencie os orçamentos do estúdio
                </Text>
              </Box>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleNewQuote}
              >
                Novo Orçamento
              </Button>
            </HStack>

            {/* Cards de estatísticas */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
              <StatCard
                label="Total de Orçamentos"
                value={stats.total}
                icon={FiFileText}
              />
              <StatCard
                label="Orçamentos Aprovados"
                value={stats.approved}
                icon={FiCheckCircle}
              />
              <StatCard
                label="Orçamentos Pendentes"
                value={stats.pending}
                icon={FiClock}
              />
              <StatCard
                label="Valor Total"
                value={`R$ ${stats.value.toLocaleString('pt-BR')}`}
                icon={FiDollarSign}
              />
            </SimpleGrid>
          </Box>

          {/* Tabela de orçamentos */}
          <Box overflowX="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Cliente</Th>
                  <Th>Título</Th>
                  <Th>Status</Th>
                  <Th>Validade</Th>
                  <Th isNumeric>Valor</Th>
                  <Th width="50px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {quotesList?.map(quote => (
                  <Tr key={quote.id} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Td>{quote.client.name}</Td>
                    <Td>{quote.title}</Td>
                    <Td>{getStatusBadge(quote.status)}</Td>
                    <Td>
                      {format(new Date(quote.validUntil), 'dd/MM/yyyy', { locale: ptBR })}
                    </Td>
                    <Td isNumeric>
                      {quote.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
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
                          <MenuItem 
                            icon={<FiEdit2 />} 
                            onClick={() => handleEditQuote(quote)}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem 
                            icon={<FiMail />}
                            onClick={() => handleSendQuote(quote.id)}
                          >
                            Enviar por E-mail
                          </MenuItem>
                          {quote.status === 'PENDING' && (
                            <>
                              <MenuItem
                                icon={<FiCheckCircle />}
                                onClick={() =>
                                  handleUpdateStatus(quote.id, 'APPROVED')
                                }
                              >
                                Aprovar
                              </MenuItem>
                              <MenuItem
                                icon={<FiXCircle />}
                                onClick={() =>
                                  handleUpdateStatus(quote.id, 'REJECTED')
                                }
                              >
                                Rejeitar
                              </MenuItem>
                            </>
                          )}
                          <MenuItem 
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteQuote(quote.id)}
                            color="red.400"
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

        <QuoteModal
          isOpen={isOpen}
          onClose={onClose}
          quote={selectedQuote}
        />
      </Container>
    </Layout>
  );
} 