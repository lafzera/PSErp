import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Flex, Spinner, Box } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Flex 
        height="100vh" 
        width="100%"
        alignItems="center" 
        justifyContent="center" 
        bg="gray.900"
      >
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

  return <>{isAuthenticated ? children : null}</>;
} 