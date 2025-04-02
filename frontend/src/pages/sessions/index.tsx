import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiCamera } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/Card';
import { Session } from '@/services/api';

// TODO: Implementar a busca de sessões na API
const mockSessions: Session[] = [
  {
    id: '1',
    clientId: '1',
    date: new Date().toISOString(),
    status: 'SCHEDULED',
    type: 'WEDDING',
    notes: 'Sessão de casamento',
    photos: [],
  }
];

const sessionTypeLabels = {
  WEDDING: 'Casamento',
  BIRTHDAY: 'Aniversário',
  FAMILY: 'Família',
  PORTRAIT: 'Retrato',
  EVENT: 'Evento',
};

const statusColors = {
  SCHEDULED: 'blue',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export default function Sessions() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // TODO: Implementar a busca real de sessões
  const { data: sessions = mockSessions } = useQuery('sessions', () => mockSessions);

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Sessões Fotográficas</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Nova Sessão
          </Button>
        </Box>

        <Card>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Cliente</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th>Fotos</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sessions.map((session) => (
                <Tr key={session.id}>
                  <Td>
                    {format(new Date(session.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Td>
                  <Td>Nome do Cliente</Td>
                  <Td>{sessionTypeLabels[session.type as keyof typeof sessionTypeLabels]}</Td>
                  <Td>
                    <Badge colorScheme={statusColors[session.status as keyof typeof statusColors]}>
                      {statusLabels[session.status as keyof typeof statusLabels]}
                    </Badge>
                  </Td>
                  <Td>{session.photos.length} fotos</Td>
                  <Td>
                    <Stack direction="row" spacing={2}>
                      <IconButton
                        aria-label="Gerenciar fotos"
                        icon={<FiCamera />}
                        size="sm"
                        colorScheme="green"
                        onClick={() => {/* TODO: Implementar gerenciamento de fotos */}}
                      />
                      <IconButton
                        aria-label="Editar sessão"
                        icon={<FiEdit2 />}
                        size="sm"
                        onClick={() => {/* TODO: Implementar edição */}}
                      />
                      <IconButton
                        aria-label="Cancelar sessão"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => {/* TODO: Implementar cancelamento */}}
                      />
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </Stack>

      {/* TODO: Implementar modal de criação/edição de sessão */}
    </Container>
  );
} 