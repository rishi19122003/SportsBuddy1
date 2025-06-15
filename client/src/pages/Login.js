import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Stack, 
  Heading, 
  Text, 
  Link, 
  InputGroup, 
  InputRightElement,
  useToast,
  Flex,
  Container
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SportsBuddyLogo from '../assets/sportsBuddyLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      // Get the redirect path from location state, or default to dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Flex 
      minH={'100vh'} 
      align={'center'} 
      justify={'center'}
      bg="gray.50"
    >
      <Container maxW="lg" py={12} px={{ base: 4, sm: 8 }}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Stack align={'center'}>
            <SportsBuddyLogo size="lg" mb={5}/>
            <Heading fontSize={'4xl'} textAlign={'center'} color="gray.700">
              Sign in to your account
            </Heading>
            <Text fontSize={'lg'} color={'gray.600'}>
              to enjoy all of our cool features ✌️
            </Text>
          </Stack>
          
          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            p={8}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement h={'full'}>
                      <Button
                        variant={'ghost'}
                        onClick={() => setShowPassword((show) => !show)}
                      >
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <Stack spacing={5}>
                  <Button
                    type="submit"
                    colorScheme={'teal'}
                    size="lg"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign in
                  </Button>
                </Stack>
                
                <Stack pt={6}>
                  <Text align={'center'}>
                    Don't have an account?{' '}
                    <Link as={RouterLink} to="/register" color={'teal.400'}>
                      Sign up
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
};

export default Login; 