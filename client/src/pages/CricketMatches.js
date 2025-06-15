import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Icon,
  Flex,
  Divider,
  useColorModeValue,
  Center,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiAward } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const CricketMatches = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }
    fetchMatches();
  }, [user, navigate]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/cricket/matches', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch matches');
      }

      setMatches(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch matches',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async (matchId) => {
    try {
      const response = await fetch(`/api/cricket/matches/${matchId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join match');
      }

      toast({
        title: 'Success',
        description: 'You have successfully joined the match!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh matches list
      fetchMatches();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>Cricket Matches</Heading>
          <Text color="gray.600">Find and join cricket matches in your area</Text>
        </Box>

        <Button
          colorScheme="teal"
          size="lg"
          width={{ base: "full", md: "auto" }}
          onClick={() => navigate('/create-cricket-match')}
        >
          Schedule New Match
        </Button>

        {matches.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.600">
              No matches scheduled yet. Be the first to create one!
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {matches.map((match) => (
              <Box
                key={match._id}
                bg={cardBg}
                p={6}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                shadow="md"
              >
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{match.title}</Heading>
                  
                  <HStack>
                    <Icon as={FiCalendar} color="teal.500" />
                    <Text>{formatDate(match.date)}</Text>
                  </HStack>

                  <HStack>
                    <Icon as={FiClock} color="teal.500" />
                    <Text>{match.time}</Text>
                  </HStack>

                  <HStack>
                    <Icon as={FiMapPin} color="teal.500" />
                    <Text>{match.location}</Text>
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Badge colorScheme="teal">{match.format}</Badge>
                    <Badge colorScheme="purple">{match.skill_level}</Badge>
                  </HStack>

                  <HStack>
                    <Icon as={FiUsers} color="teal.500" />
                    <Text>
                      {match.participants.length} / {match.playersNeeded} players
                    </Text>
                  </HStack>

                  {match.description && (
                    <Text fontSize="sm" color="gray.600">
                      {match.description}
                    </Text>
                  )}

                  <Button
                    colorScheme="teal"
                    isDisabled={match.status === 'full' || match.participants.includes(user._id)}
                    onClick={() => handleJoinMatch(match._id)}
                  >
                    {match.status === 'full' ? 'Match Full' : 
                     match.participants.includes(user._id) ? 'Already Joined' : 
                     'Join Match'}
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default CricketMatches; 