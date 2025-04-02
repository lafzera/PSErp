import { ReactNode, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Container,
  Text,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useBreakpointValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCamera,
  FiUsers,
  FiLogOut,
  FiUser,
  FiHome,
  FiDollarSign,
  FiSettings,
  FiBox,
  FiFileText,
  FiPackage,
  FiChevronDown,
  FiUserPlus,
  FiMenu,
  FiDatabase,
  FiServer,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { User } from '@/types';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon: IconType;
  isActive?: boolean;
  isMobile?: boolean;
  showLabel?: boolean;
}

interface NavbarProps {
  userRole?: User['role'];
}

function NavLink({ href, children, icon: Icon, isActive, isMobile, showLabel = true }: NavLinkProps) {
  const Component = isMobile ? VStack : HStack;
  return (
    <Link href={href} passHref>
      <Component
        as="a"
        spacing={2}
        px={3}
        py={2}
        rounded="md"
        width={isMobile ? "full" : "auto"}
        transition="all 0.2s"
        bg={isActive ? 'whiteAlpha.200' : 'transparent'}
        color={isActive ? '#E2E8F0' : '#A0AEC0'}
        _hover={{
          bg: 'whiteAlpha.200',
          color: '#E2E8F0',
        }}
        align={isMobile ? "center" : "flex-start"}
      >
        <Icon size={isMobile ? 24 : 20} />
        {showLabel && (
          <Text fontSize={isMobile ? "md" : { base: "sm", md: "md" }}>
            {children}
          </Text>
        )}
      </Component>
    </Link>
  );
}

export function Navbar({ userRole }: NavbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const showLabels = useBreakpointValue({ base: true, md: true, lg: true });
  
  const isAdmin = userRole === 'ADMIN';
  const isActive = (path: string) => router.pathname.startsWith(path);

  const navigationLinks = [
    { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { href: '/clients', icon: FiUsers, label: 'Clientes' },
    { href: '/quotes', icon: FiFileText, label: 'Orçamentos' },
    { href: '/products', icon: FiPackage, label: 'Produtos' },
    { href: '/financial', icon: FiDollarSign, label: 'Financeiro' },
    { href: '/inventory', icon: FiBox, label: 'Estoque' },
    ...(isAdmin ? [{ href: '/users', icon: FiUserPlus, label: 'Usuários' }] : []),
  ];

  return (
    <Box as="nav" bg="#171E2E" color="#E2E8F0" py={{ base: 2, sm: 3, md: 4 }} borderBottom="1px" borderColor="#2D3748">
      <Container maxW="container.xl">
        <Flex alignItems="center" justifyContent="space-between">
          <HStack spacing={{ base: 2, md: 4 }}>
            {isMobile && (
              <IconButton
                aria-label="Abrir menu"
                icon={<FiMenu size={24} />}
                onClick={onOpen}
                variant="ghost"
                color="#E2E8F0"
                _hover={{ bg: 'whiteAlpha.200' }}
              />
            )}
            
            <Link href="/" passHref>
              <Box
                as="a"
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                fontWeight="bold"
                color="#E2E8F0"
                _hover={{ color: '#3182CE', textDecoration: 'none' }}
                whiteSpace="nowrap"
              >
                PSErp
              </Box>
            </Link>
          </HStack>

          {!isMobile && (
            <HStack spacing={{ base: 2, md: 4 }} ml={8} flex={1} justifyContent="center">
              {navigationLinks.map((link) => (
                <Tooltip key={link.href} label={link.label} placement="bottom">
                  <Box>
                    <NavLink
                      href={link.href}
                      icon={link.icon}
                      isActive={isActive(link.href)}
                      showLabel={showLabels}
                    >
                      {link.label}
                    </NavLink>
                  </Box>
                </Tooltip>
              ))}
            </HStack>
          )}

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<FiChevronDown />}
              _hover={{ bg: 'whiteAlpha.200' }}
              _active={{ bg: 'whiteAlpha.300' }}
              size={{ base: "sm", md: "md" }}
            >
              <HStack spacing={2}>
                <Avatar 
                  size={{ base: "sm", md: "sm" }} 
                  name={user?.name}
                  bg="#3182CE"
                  color="#E2E8F0"
                />
                <Text 
                  fontSize={{ base: "sm", md: "md" }}
                  display={{ base: "none", sm: "block" }}
                >
                  {user?.name}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList bg="#171E2E" borderColor="#2D3748">
              <MenuItem 
                icon={<FiUser />}
                onClick={() => router.push('/profile')}
                _hover={{ bg: 'whiteAlpha.200' }}
                fontSize="sm"
              >
                Meu Perfil
              </MenuItem>
              {isAdmin && (
                <MenuItem 
                  icon={<FiUserPlus />}
                  onClick={() => router.push('/users')}
                  _hover={{ bg: 'whiteAlpha.200' }}
                  fontSize="sm"
                >
                  Usuários
                </MenuItem>
              )}
              <MenuDivider borderColor="#2D3748" />
              <MenuItem 
                icon={<FiLogOut />}
                onClick={signOut}
                _hover={{ bg: 'whiteAlpha.200' }}
                fontSize="sm"
                color="red.300"
              >
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Container>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="#171E2E" borderRight="1px" borderColor="#2D3748">
          <DrawerCloseButton color="#E2E8F0" />
          <DrawerHeader borderBottom="1px" borderColor="#2D3748">
            <Text color="#E2E8F0">Menu</Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  isActive={isActive(link.href)}
                  isMobile
                >
                  {link.label}
                </NavLink>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 