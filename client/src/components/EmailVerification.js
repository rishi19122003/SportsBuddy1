import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  Stack,
  Heading,
  Text,
  useToast,
  Flex,
  Container,
  VStack
} from '@chakra-ui/react';
import api from '../utils/api';
import SportsBuddyLogo from '../assets/sportsBuddyLogo';

const EmailVerification = ({ email, onVerificationSuccess, resendOTP }) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const toast = useToast();
  const timerRef = useRef(null);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Sending verification request with:', { email, otp });
      
      const { data } = await api.post('/api/auth/verify-email', {
        email,
        otp
      });

      toast({
        title: 'Email Verified',
        description: 'Your email has been successfully verified!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Call the callback to proceed to the next step
      onVerificationSuccess(data);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Failed to verify OTP. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    
    try {
      await resendOTP();
      
      // Start the countdown timer (60 seconds)
      setCountdown(60);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: 'OTP Sent',
        description: 'A new OTP has been sent to your email',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to Resend OTP',
        description: error.response?.data?.message || 'Failed to resend OTP. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setResendDisabled(false);
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
              Verify Your Email
            </Heading>
            <Text fontSize={'md'} color={'gray.600'} textAlign="center">
              We've sent a verification code to {email}. 
              Please enter the code below to verify your email.
            </Text>
          </Stack>
          
          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            p={8}
          >
            <VStack spacing={6}>
              <FormControl id="otp" isRequired>
                <FormLabel textAlign="center">Enter Verification Code</FormLabel>
                <HStack justifyContent="center" spacing={2}>
                  <PinInput 
                    size="lg"
                    otp 
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </FormControl>
              
              <Button
                width="full"
                size="lg"
                bg={'teal.400'}
                color={'white'}
                _hover={{
                  bg: 'teal.500',
                }}
                onClick={handleVerify}
                isLoading={isSubmitting}
                loadingText="Verifying"
              >
                Verify Email
              </Button>
              
              <Button
                variant="link"
                color="teal.500"
                onClick={handleResendOTP}
                isDisabled={resendDisabled}
              >
                {resendDisabled
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend Verification Code'}
              </Button>
            </VStack>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
};

export default EmailVerification; 