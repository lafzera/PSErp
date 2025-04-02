import { Box, Container, Flex, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { PrivateRoute } from './PrivateRoute';
import { Navbar } from './Navbar';
import { useRouter } from 'next/router';
import { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
  isPrivate?: boolean;
  userRole?: User['role'];
}

export function Layout({ children, isPrivate = true, userRole }: LayoutProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <Box minH="100vh" bg="gray.900">
      {!isLoginPage && <Navbar userRole={userRole} />}
      <Box 
        as="main" 
        flex="1" 
        py={{ base: 4, sm: 6, md: 8 }}
        px={{ base: 2, sm: 4, md: 6 }}
      >
        {isPrivate ? (
          <PrivateRoute>
            {children}
          </PrivateRoute>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
} 