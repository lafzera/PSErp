import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiUsers, FiCamera, FiFileText, FiDollarSign, FiCalendar, FiPackage } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Aqui você pode adicionar consultas para buscar dados do dashboard
  // const { data: statsData, isLoading: isLoadingStats } = useQuery('dashboardStats', fetchDashboardStats);

  // Dados simulados para o dashboard
  const stats = [
    { 
      id: 'clients', 
      label: 'Clientes', 
      value: 128, 
      change: '+12%', 
      icon: FiUsers, 
      color: 'blue',
      route: '/clients'
    },
    { 
      id: 'sessions', 
      label: 'Sessões', 
      value: 24, 
      change: '+5%', 
      icon: FiCamera, 
      color: 'purple',
      route: '/sessions'
    },
    { 
      id: 'quotes', 
      label: 'Orçamentos', 
      value: 16, 
      change: '+8%', 
      icon: FiFileText, 
      color: 'orange',
      route: '/quotes'
    },
    { 
      id: 'revenue', 
      label: 'Receita Mensal', 
      value: 'R$ 15.680', 
      change: '+15%', 
      icon: FiDollarSign, 
      color: 'green',
      route: '/financial'
    },
  ];

  // Próximas sessões (simulado)
  const upcomingSessions = [
    { id: 1, clientName: 'João Silva', date: '15/06/2023', type: 'Casamento' },
    { id: 2, clientName: 'Maria Souza', date: '18/06/2023', type: 'Ensaio Família' },
    { id: 3, clientName: 'Pedro Oliveira', date: '20/06/2023', type: 'Aniversário' },
  ];

  // Últimos orçamentos (simulado)
  const latestQuotes = [
    { id: 1, clientName: 'Ana Costa', value: 'R$ 2.500', status: 'Aprovado' },
    { id: 2, clientName: 'Lucas Santos', value: 'R$ 1.800', status: 'Pendente' },
    { id: 3, clientName: 'Julia Mendes', value: 'R$ 3.200', status: 'Enviado' },
  ];

  return (
    <Layout userRole={user?.role}>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg">Dashboard</Heading>
          <Text color="gray.600" mt={1}>
            Bem-vindo ao seu painel de controle, {user?.name}
          </Text>
        </Box>

        {/* Cards de estatísticas */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {stats.map((stat) => (
            <Card key={stat.id} cursor="pointer" onClick={() => router.push(stat.route)}>
              <Flex align="center" justify="space-between">
                <Box>
                  <Stat>
                    <StatLabel color="gray.500" fontSize="sm">{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</StatNumber>
                    <StatHelpText color={stat.change.startsWith('+') ? 'green.400' : 'red.400'}>
                      {stat.change} esse mês
                    </StatHelpText>
                  </Stat>
                </Box>
                <Icon as={stat.icon} color={`${stat.color}.400`} boxSize={10} />
              </Flex>
            </Card>
          ))}
        </SimpleGrid>

        {/* Segunda linha com próximas sessões e orçamentos recentes */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Próximas Sessões</Heading>
              <Button size="sm" variant="outline" rightIcon={<FiCalendar />} onClick={() => router.push('/sessions')}>
                Ver Todas
              </Button>
            </Flex>
            {upcomingSessions.map((session) => (
              <Box key={session.id} p={3} borderRadius="md" mb={2} bg="gray.700">
                <Flex justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{session.clientName}</Text>
                    <Text fontSize="sm" color="gray.400">{session.type}</Text>
                  </Box>
                  <Text>{session.date}</Text>
                </Flex>
              </Box>
            ))}
          </Card>

          <Card>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Últimos Orçamentos</Heading>
              <Button size="sm" variant="outline" rightIcon={<FiFileText />} onClick={() => router.push('/quotes')}>
                Ver Todos
              </Button>
            </Flex>
            {latestQuotes.map((quote) => (
              <Box key={quote.id} p={3} borderRadius="md" mb={2} bg="gray.700">
                <Flex justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{quote.clientName}</Text>
                    <Text fontSize="sm" color="gray.400">{quote.value}</Text>
                  </Box>
                  <Text 
                    color={
                      quote.status === 'Aprovado' ? 'green.400' : 
                      quote.status === 'Pendente' ? 'yellow.400' : 'blue.400'
                    }
                  >
                    {quote.status}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Card>
        </Grid>
      </Container>
    </Layout>
  );
} 