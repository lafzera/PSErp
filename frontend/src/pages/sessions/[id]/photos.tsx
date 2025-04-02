import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
  Image,
  IconButton,
  useToast,
  Progress,
  Badge,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiTrash2, FiDownload } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card } from '@/components/Card';

// TODO: Implementar integração com a API
const mockPhotos = [
  {
    id: '1',
    url: 'https://via.placeholder.com/300',
    filename: 'foto1.jpg',
  }
];

export default function SessionPhotos() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const queryClient = useQueryClient();

  // TODO: Implementar busca real de fotos
  const { data: photos = mockPhotos } = useQuery(['session-photos', id], () => mockPhotos);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    toast({
      title: 'Upload iniciado',
      description: `${acceptedFiles.length} fotos serão enviadas.`,
      status: 'info',
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        toast({
          title: 'Upload concluído',
          status: 'success',
        });
        setUploadProgress(0);
      }
    }, 500);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Fotos da Sessão</Heading>
          <Text mt={2} color="gray.600">
            Gerencie as fotos desta sessão fotográfica
          </Text>
        </Box>

        <Card
          {...getRootProps()}
          cursor="pointer"
          bg={isDragActive ? 'gray.50' : 'white'}
          _hover={{ bg: 'gray.50' }}
        >
          <input {...getInputProps()} />
          <Stack align="center" py={10} spacing={4}>
            <Text fontSize="lg">
              {isDragActive
                ? 'Solte as fotos aqui...'
                : 'Arraste e solte as fotos aqui, ou clique para selecionar'}
            </Text>
            <Text color="gray.500" fontSize="sm">
              Formatos aceitos: JPG, JPEG, PNG
            </Text>
          </Stack>
        </Card>

        {uploadProgress > 0 && (
          <Progress value={uploadProgress} size="sm" colorScheme="blue" />
        )}

        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {photos.map((photo) => (
            <Card key={photo.id} isHoverable>
              <Stack spacing={4}>
                <Box position="relative" paddingTop="100%" overflow="hidden">
                  <Image
                    src={photo.url}
                    alt={photo.filename}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
                <Text fontSize="sm" noOfLines={1}>{photo.filename}</Text>
                <Stack direction="row" justify="space-between">
                  <IconButton
                    aria-label="Baixar foto"
                    icon={<FiDownload />}
                    size="sm"
                    onClick={() => {/* TODO: Implementar download */}}
                  />
                  <IconButton
                    aria-label="Excluir foto"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => {/* TODO: Implementar exclusão */}}
                  />
                </Stack>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
} 