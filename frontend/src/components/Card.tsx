import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface CardProps extends BoxProps {
  children: ReactNode;
  variant?: 'elevated' | 'flat';
}

export function Card({ children, variant = 'elevated', ...rest }: CardProps) {
  const elevatedStyles = {
    bg: '#171E2E',
    borderWidth: "1px",
    borderColor: '#2D3748',
    borderRadius: "xl",
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(8px)',
  };

  const flatStyles = {
    bg: 'rgba(23, 30, 46, 0.7)',
    borderWidth: "1px",
    borderColor: '#2D3748',
    borderRadius: "xl",
    backdropFilter: 'blur(8px)',
  };

  return (
    <Box
      {...(variant === 'elevated' ? elevatedStyles : flatStyles)}
      p={{ base: 4, md: 6 }}
      w="100%"
      maxW="100%"
      transition="all 0.2s"
      _hover={{
        transform: variant === 'elevated' ? 'translateY(-2px)' : 'none',
        boxShadow: variant === 'elevated' ? '0 6px 8px -1px rgba(0, 0, 0, 0.6)' : 'none',
      }}
      {...rest}
    >
      {children}
    </Box>
  );
} 