import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { FiUsers, FiCamera, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

// Componente para o card de estatísticas
function StatCard({ 
  label, 
  value, 
  helpText, 
  icon: Icon,
  trend,
  trendValue 
}: { 
  label: string; 
  value: string | number; 
  helpText?: string;
  icon: React.ElementType;
  trend?: 'increase' | 'decrease';
  trendValue?: string;
}) {
  return (
    <Card>
      <CardBody>
        <Stat>
          <HStack spacing={2} mb={2}>
            <Icon size={20} />
            <StatLabel color="gray.300">{label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl" color="gray.100">{value}</StatNumber>
          {helpText && (
            <StatHelpText color="gray.400">
              {trend && <StatArrow type={trend} />}
              {trendValue}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Flex height="100vh" align="center" justify="center" bg="#0F1117">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="blue.500"
          size="xl"
        />
      </Flex>
    );
  }

  return (
    <Layout userRole={user?.role}>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg" color="gray.100">Dashboard</Heading>
          <Text mt={1} color="gray.400">
            Visão geral do seu estúdio
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard
            label="Total de Clientes"
            value="0"
            helpText="Desde o último mês"
            icon={FiUsers}
            trend="increase"
            trendValue="0%"
          />
          
          <StatCard
            label="Sessões Agendadas"
            value="0"
            helpText="Desde o último mês"
            icon={FiCamera}
            trend="decrease"
            trendValue="0%"
          />
          
          <StatCard
            label="Faturamento Mensal"
            value="R$ 0"
            helpText="Desde o último mês"
            icon={FiDollarSign}
            trend="increase"
            trendValue="0%"
          />
        </SimpleGrid>
      </Container>
    </Layout>
  );
} 