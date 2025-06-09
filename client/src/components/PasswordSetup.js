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
  useToast,
  Flex,
  Container,
  InputGroup,
  InputRightElement,
  VStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import api from '../utils/api';
import SportsBuddyLogo from '../assets/sportsBuddyLogo';
import { useAuth } from '../hooks/useAuth';

const PasswordSetup = ({ email, verificationToken, onRegistrationComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { completeRegistration } = useAuth();

  const handleCompleteRegistration = async () => {
    // Validation
    if (!password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password should be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Completing registration with:', { email, verificationToken });
      
      // Use the completeRegistration function from AuthContext instead of direct API call
      const userData = await completeRegistration(email, password, verificationToken);
      console.log('Registration completed, user data:', userData);

      toast({
        title: 'Registration Complete',
        description: 'Your account has been successfully created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Call the callback to handle redirect and pass the user data
      onRegistrationComplete(userData, password);
    } catch (error) {
      console.error('Registration completion error:', error);
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to complete registration. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
            <Heading fontSize={'3xl'} textAlign={'center'} color="gray.700">
              Set Your Password
            </Heading>
            <Text fontSize={'md'} color={'gray.600'} textAlign="center">
              Your email has been verified. Now, please set a secure password for your account.
            </Text>
          </Stack>
          
          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            p={8}
          >
            <VStack spacing={6}>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
              
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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
              
              <Button
                width="full"
                size="lg"
                bg={'teal.400'}
                color={'white'}
                _hover={{
                  bg: 'teal.500',
                }}
                onClick={handleCompleteRegistration}
                isLoading={isSubmitting}
                loadingText="Completing Registration"
              >
                Complete Registration
              </Button>
            </VStack>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
};

export default PasswordSetup; 