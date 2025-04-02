import { Box, Container, Heading } from '@chakra-ui/react';
import { Layout } from '@/components/Layout';
import { SystemConfigComponent } from '@/components/SystemConfig';

export default function SettingsPage() {
  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg">Configurações do Sistema</Heading>
        </Box>
        <SystemConfigComponent />
      </Container>
    </Layout>
  );
} 