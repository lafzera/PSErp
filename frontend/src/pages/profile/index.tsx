import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Stack,
  Flex,
  Avatar,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FiEdit2, FiUser, FiLock, FiSettings } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { users, profile as profileApi, User, Profile } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordForm } from '@/components/profile/PasswordForm';
import { PreferencesForm } from '@/components/profile/PreferencesForm';

export default function ProfilePage() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Consultar dados do usuário e perfil
  const { 
    data: user,
    isLoading: isLoadingUser,
    error: userError 
  } = useQuery('currentUser', users.getCurrentUser);
  
  const { 
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useQuery('profile', profileApi.getProfile);

  // Mutação para atualizar o perfil
  const updateProfileMutation = useMutation(
    (data: Partial<Profile>) => profileApi.updateProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast({
          title: 'Perfil atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar perfil',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Mutação para atualizar o avatar
  const updateAvatarMutation = useMutation(
    (file: File) => profileApi.updateAvatar(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast({
          title: 'Avatar atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setSelectedFile(null);
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar avatar',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Mutação para alterar a senha
  const changePasswordMutation = useMutation(
    (data: { currentPassword: string; newPassword: string }) => 
      users.changePassword(data),
    {
      onSuccess: () => {
        toast({
          title: 'Senha alterada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao alterar senha',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Mutação para atualizar preferências
  const updatePreferencesMutation = useMutation(
    (data: Profile['preferences']) => profileApi.updatePreferences(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        toast({
          title: 'Preferências atualizadas com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar preferências',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Funções de manipulação
  const handleProfileUpdate = async (data: Partial<Profile>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    await changePasswordMutation.mutateAsync(data);
  };

  const handlePreferencesUpdate = async (data: Profile['preferences']) => {
    await updatePreferencesMutation.mutateAsync(data);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      updateAvatarMutation.mutate(event.target.files[0]);
    }
  };

  // Exibir mensagem de erro se houver problemas ao carregar dados
  if (userError || profileError) {
    return (
      <Layout>
        <Container maxW="container.lg" py={8}>
          <Card>
            <Text color="red.500">
              Erro ao carregar informações do perfil. Por favor, tente novamente mais tarde.
            </Text>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout userRole={user?.role}>
      <Container maxW="container.lg" py={8}>
        <Box mb={8}>
          <Heading size="lg">Perfil do Usuário</Heading>
          <Text color="gray.600" mt={2}>
            Gerencie suas informações pessoais e preferências
          </Text>
        </Box>

        {isLoadingUser || isLoadingProfile ? (
          <Text>Carregando informações...</Text>
        ) : (
          <>
            <Card mb={6}>
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Box position="relative">
                  <Avatar 
                    size="2xl" 
                    name={user?.name}
                    src={userProfile?.avatar}
                  />
                  <Box position="absolute" bottom="0" right="0">
                    <label htmlFor="avatar-upload">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                      <IconButton
                        as="span"
                        aria-label="Alterar foto"
                        icon={<FiEdit2 />}
                        size="sm"
                        colorScheme="blue"
                        isRound
                        cursor="pointer"
                      />
                    </label>
                  </Box>
                </Box>

                <Box flex="1">
                  <Heading size="md">{user?.name}</Heading>
                  <Text color="gray.600">{user?.email}</Text>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Função: {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'PHOTOGRAPHER' ? 'Fotógrafo' : 'Assistente'}
                  </Text>
                  {userProfile?.bio && (
                    <Text mt={2}>{userProfile.bio}</Text>
                  )}
                </Box>
              </Flex>
            </Card>

            <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab><Box as="span" mr={2}><FiUser /></Box> Dados Pessoais</Tab>
                <Tab><Box as="span" mr={2}><FiLock /></Box> Alterar Senha</Tab>
                <Tab><Box as="span" mr={2}><FiSettings /></Box> Preferências</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Card>
                    <ProfileForm 
                      initialData={userProfile} 
                      onSubmit={handleProfileUpdate}
                      isLoading={updateProfileMutation.isLoading}
                    />
                  </Card>
                </TabPanel>
                <TabPanel>
                  <Card>
                    <PasswordForm 
                      onSubmit={handlePasswordChange}
                      isLoading={changePasswordMutation.isLoading}
                    />
                  </Card>
                </TabPanel>
                <TabPanel>
                  <Card>
                    <PreferencesForm 
                      initialData={userProfile?.preferences}
                      onSubmit={handlePreferencesUpdate}
                      isLoading={updatePreferencesMutation.isLoading}
                    />
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Container>
    </Layout>
  );
} 