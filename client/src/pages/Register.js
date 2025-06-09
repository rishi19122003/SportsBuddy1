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
  useToast,
  Flex,
  Container
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SportsBuddyLogo from '../assets/sportsBuddyLogo';
import EmailVerification from '../components/EmailVerification';
import PasswordSetup from '../components/PasswordSetup';
import api from '../utils/api';

// Registration steps
const STEPS = {
  EMAIL_ENTRY: 'EMAIL_ENTRY',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_SETUP: 'PASSWORD_SETUP'
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL_ENTRY);
  const [verificationToken, setVerificationToken] = useState('');
  const [userPassword, setUserPassword] = useState(''); // Store password for login
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Submit name and email to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log the request for debugging
      console.log('Sending request to /api/auth/request-verification with:', { name, email });
      
      const { data } = await api.post('/api/auth/request-verification', {
        name,
        email
      });
      
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your email for the verification code',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setCurrentStep(STEPS.EMAIL_VERIFICATION);
    } catch (error) {
      console.error('Error sending verification request:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send verification code. Status: ' + (error.response?.status || 'Unknown'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    try {
      await api.post('/api/auth/resend-verification', {
        email
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend verification code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  // Step 2: Handle OTP verification success
  const handleVerificationSuccess = (data) => {
    setVerificationToken(data.verificationToken);
    setCurrentStep(STEPS.PASSWORD_SETUP);
  };

  // Step 3: Handle registration completion
  const handleRegistrationComplete = async (data, password) => {
    try {
      // Store the user data directly from registration response
      // No need to login again since we already have the token
      setUserPassword(password);
      
      // Success notification
      toast({
        title: 'Welcome to SportsBuddy!',
        description: 'Your account has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration Error',
        description: 'Your account was created but we encountered an issue. Please try logging in.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login');
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.EMAIL_VERIFICATION:
        return (
          <EmailVerification 
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
            resendOTP={handleResendOTP}
          />
        );
        
      case STEPS.PASSWORD_SETUP:
        return (
          <PasswordSetup 
            email={email}
            verificationToken={verificationToken}
            onRegistrationComplete={handleRegistrationComplete}
          />
        );
        
      default: // STEPS.EMAIL_ENTRY
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
                    Create your account
                  </Heading>
                  <Text fontSize={'lg'} color={'gray.600'}>
                    to find your perfect sports partner ⚽
                  </Text>
                </Stack>
                
                <Box
                  rounded={'lg'}
                  bg={'white'}
                  boxShadow={'lg'}
                  p={8}
                >
                  <form onSubmit={handleRequestOtp}>
                    <Stack spacing={4}>
                      <FormControl id="name" isRequired>
                        <FormLabel>Full Name</FormLabel>
                        <Input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </FormControl>
                      
                      <FormControl id="email" isRequired>
                        <FormLabel>Email address</FormLabel>
                        <Input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </FormControl>
                      
                      <Stack spacing={10} pt={2}>
                        <Button
                          type="submit"
                          loadingText="Submitting"
                          size="lg"
                          bg={'teal.400'}
                          color={'white'}
                          _hover={{
                            bg: 'teal.500',
                          }}
                          isLoading={isSubmitting}
                        >
                          Continue
                        </Button>
                      </Stack>
                      
                      <Stack pt={6}>
                        <Text align={'center'}>
                          Already a user?{' '}
                          <Link as={RouterLink} to="/login" color={'teal.400'}>
                            Login
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
    }
  };

  return renderStep();
};

export default Register; 