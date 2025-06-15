import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Container,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';

const CricketMatch = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [matchDetails, setMatchDetails] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    format: 'T20',
    playersNeeded: '',
    description: '',
    skill_level: 'Beginner',
  });

  const validateForm = () => {
    const newErrors = {};
    if (!matchDetails.title.trim()) newErrors.title = 'Title is required';
    if (!matchDetails.date) newErrors.date = 'Date is required';
    if (!matchDetails.time) newErrors.time = 'Time is required';
    if (!matchDetails.location.trim()) newErrors.location = 'Location is required';
    if (!matchDetails.playersNeeded || matchDetails.playersNeeded < 1 || matchDetails.playersNeeded > 22) {
      newErrors.playersNeeded = 'Players needed must be between 1 and 22';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMatchDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form Error',
        description: 'Please fill in all required fields correctly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Get the user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to create a match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    const { token } = JSON.parse(userData);
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Invalid authentication. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cricket/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(matchDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create match');
      }

      toast({
        title: 'Match Created!',
        description: 'Your cricket match has been scheduled successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/matches');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create the match. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">Schedule Cricket Match</Heading>
          <Text mt={2} color="gray.600">
            Create a cricket match and find players in your area
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={errors.title}>
              <FormLabel>Match Title</FormLabel>
              <Input
                name="title"
                value={matchDetails.title}
                onChange={handleInputChange}
                placeholder="e.g., Sunday Cricket Match"
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.date}>
              <FormLabel>Date</FormLabel>
              <Input
                name="date"
                type="date"
                value={matchDetails.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              <FormErrorMessage>{errors.date}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.time}>
              <FormLabel>Time</FormLabel>
              <Input
                name="time"
                type="time"
                value={matchDetails.time}
                onChange={handleInputChange}
              />
              <FormErrorMessage>{errors.time}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={errors.location}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={matchDetails.location}
                onChange={handleInputChange}
                placeholder="Enter match location"
              />
              <FormErrorMessage>{errors.location}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Match Format</FormLabel>
              <Select
                name="format"
                value={matchDetails.format}
                onChange={handleInputChange}
              >
                <option value="T20">T20</option>
                <option value="ODI">ODI</option>
                <option value="Test">Test Match</option>
                <option value="Custom">Custom Format</option>
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={errors.playersNeeded}>
              <FormLabel>Players Needed</FormLabel>
              <Input
                name="playersNeeded"
                type="number"
                value={matchDetails.playersNeeded}
                onChange={handleInputChange}
                placeholder="Number of players needed"
                min={1}
                max={22}
              />
              <FormErrorMessage>{errors.playersNeeded}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Skill Level</FormLabel>
              <Select
                name="skill_level"
                value={matchDetails.skill_level}
                onChange={handleInputChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={matchDetails.description}
                onChange={handleInputChange}
                placeholder="Add any additional details about the match"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="100%"
              mt={6}
              isLoading={isLoading}
              loadingText="Creating Match..."
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Schedule Match'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CricketMatch; 