import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';

const queryClient = new QueryClient();

// Configuração do tema dark
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0F1117',
        color: '#E2E8F0',
        fontSize: { base: 'sm', md: 'md' },
        lineHeight: 'tall',
      },
      '*::placeholder': {
        color: 'gray.400',
      },
      '*, *::before, *::after': {
        borderColor: '#2D3748',
      },
    }
  },
  colors: {
    gray: {
      700: '#2D3748',
      750: '#1E2533',
      800: '#171E2E',
      900: '#0F1117',
    },
    blue: {
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
    },
  },
  components: {
    Heading: {
      baseStyle: {
        color: '#E2E8F0',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
      },
      sizes: {
        '2xl': {
          fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
        },
        xl: {
          fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
        },
        lg: {
          fontSize: { base: 'lg', md: 'xl', lg: '2xl' },
        },
        md: {
          fontSize: { base: 'md', md: 'lg', lg: 'xl' },
        },
        sm: {
          fontSize: { base: 'sm', md: 'md', lg: 'lg' },
        },
      },
    },
    Text: {
      baseStyle: {
        color: '#E2E8F0',
        fontSize: { base: 'sm', md: 'md' },
        letterSpacing: '0.2px',
      },
      variants: {
        secondary: {
          color: '#A0AEC0',
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            color: '#E2E8F0',
            borderColor: '#2D3748',
            bg: '#171E2E',
            fontWeight: 'bold',
            fontSize: { base: 'sm', md: 'md' },
            py: { base: 3, md: 4 },
            px: { base: 3, md: 6 },
          },
          td: {
            color: '#E2E8F0',
            borderColor: '#2D3748',
            fontSize: { base: 'sm', md: 'md' },
            py: { base: 3, md: 4 },
            px: { base: 3, md: 6 },
          },
          tr: {
            _hover: {
              bg: 'rgba(45, 55, 72, 0.3)',
            },
          },
          caption: {
            color: 'gray.100',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: '#171E2E',
          borderColor: '#2D3748',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          p: { base: 4, md: 6 },
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        letterSpacing: '0.5px',
      },
      sizes: {
        lg: {
          px: { base: 4, md: 6 },
          py: { base: 2, md: 3 },
        },
        md: {
          px: { base: 3, md: 4 },
          py: { base: 1.5, md: 2 },
        },
        sm: {
          px: { base: 2, md: 3 },
          py: { base: 1, md: 1.5 },
        },
      },
      variants: {
        solid: {
          bg: '#3182CE',
          color: 'white',
          _hover: {
            bg: '#2B6CB0',
          },
          _active: {
            bg: '#2C5282',
          },
        },
        ghost: {
          color: '#E2E8F0',
          _hover: {
            bg: 'rgba(45, 55, 72, 0.6)',
          },
        },
        outline: {
          color: 'gray.100',
          borderColor: 'gray.600',
          _hover: {
            bg: 'gray.700',
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: '#171E2E',
            borderColor: '#2D3748',
            color: '#E2E8F0',
            _hover: {
              borderColor: '#4A5568',
            },
            _focus: {
              borderColor: '#3182CE',
              boxShadow: '0 0 0 1px #3182CE',
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: 'gray.700',
            borderColor: 'gray.600',
            color: 'gray.100',
            fontSize: { base: 'sm', md: 'md' },
            _hover: {
              borderColor: 'gray.500',
            },
            _focus: {
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            },
          },
          icon: {
            color: 'gray.100',
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          boxShadow: 'dark-lg',
          p: 2,
          minW: '200px',
        },
        item: {
          bg: 'gray.800',
          color: 'gray.100',
          fontSize: { base: 'sm', md: 'md' },
          _hover: {
            bg: 'gray.700',
          },
          _focus: {
            bg: 'gray.700',
          },
          _active: {
            bg: 'gray.600',
          },
        },
        divider: {
          borderColor: 'gray.700',
          my: 2,
        },
        command: {
          color: 'gray.300',
        },
      },
    },
    Modal: {
      baseStyle: {
        overlay: {
          bg: 'blackAlpha.800',
          backdropFilter: 'blur(8px)',
        },
        dialog: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          borderWidth: '1px',
          boxShadow: 'dark-lg',
          color: 'gray.100',
          mx: { base: 4, md: 8 },
          my: { base: 4, md: 8 },
        },
        header: {
          color: 'gray.100',
          fontWeight: 'bold',
          borderBottomWidth: '1px',
          borderColor: 'gray.700',
          pb: 4,
          fontSize: { base: 'lg', md: 'xl' },
        },
        closeButton: {
          color: 'gray.300',
          _hover: {
            bg: 'gray.700',
          },
          _active: {
            bg: 'gray.600',
          },
        },
        body: {
          color: 'gray.100',
          fontSize: { base: 'sm', md: 'md' },
        },
        footer: {
          borderTopWidth: '1px',
          borderColor: 'gray.700',
          pt: 4,
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          boxShadow: 'dark-lg',
          color: 'gray.100',
        },
        header: {
          color: 'gray.100',
          borderBottomColor: 'gray.700',
          fontSize: { base: 'sm', md: 'md' },
        },
        body: {
          color: 'gray.100',
          fontSize: { base: 'sm', md: 'md' },
        },
        footer: {
          borderTopColor: 'gray.700',
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'gray.700',
        color: 'gray.100',
        fontSize: { base: 'xs', md: 'sm' },
      },
    },
    FormLabel: {
      baseStyle: {
        color: 'gray.300',
        mb: 2,
        fontWeight: 'medium',
        fontSize: { base: 'sm', md: 'md' },
      },
    },
    FormErrorMessage: {
      baseStyle: {
        color: 'red.300',
        fontSize: { base: 'xs', md: 'sm' },
      },
    },
    Alert: {
      baseStyle: {
        container: {
          bg: 'gray.700',
          borderColor: 'gray.600',
          fontSize: { base: 'sm', md: 'md' },
        },
      },
    },
    Badge: {
      baseStyle: {
        px: 2,
        py: 1,
        rounded: 'md',
        fontWeight: 'medium',
        fontSize: { base: 'xs', md: 'sm' },
      },
      variants: {
        solid: {
          bg: 'blue.500',
          color: 'gray.100',
        },
        outline: {
          color: 'gray.100',
          borderColor: 'gray.600',
        },
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            color: 'gray.300',
            fontSize: { base: 'sm', md: 'md' },
            _selected: {
              color: 'gray.100',
              borderColor: 'blue.500',
            },
            _hover: {
              color: 'gray.100',
            },
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'blue.400',
        fontSize: { base: 'sm', md: 'md' },
        _hover: {
          color: 'blue.300',
          textDecoration: 'none',
        },
      },
    },
    Stat: {
      baseStyle: {
        label: {
          color: '#A0AEC0',
          fontWeight: 'medium',
          fontSize: { base: 'md', md: 'lg' },
          mb: 2,
        },
        number: {
          color: '#E2E8F0',
          fontWeight: 'bold',
          fontSize: { base: '2xl', md: '3xl' },
          mb: 2,
        },
        helpText: {
          color: '#A0AEC0',
          fontSize: { base: 'sm', md: 'md' },
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>PSErp</title>
          <meta name="description" content="Sistema de Gestão para Estúdios Fotográficos" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
} 