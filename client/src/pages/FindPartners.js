import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Container,
  Avatar,
  Badge,
  Flex,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  AvatarBadge,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Tag,
  TagLabel,
  TagLeftIcon,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FiMapPin, FiClock, FiCalendar, FiAward, FiStar, FiMail, FiUserPlus, FiCheck, FiBell, FiInfo } from 'react-icons/fi';
import CricketPartnerPreferenceForm from './CricketPartnerPreferenceForm';

const FindPartners = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sportType = params.get('type'); // 'cricket', 'football', etc.

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDistance, setSearchDistance] = useState(10); // in kilometers
  const [hasProfile, setHasProfile] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  // New state for message modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingFriendRequest, setSendingFriendRequest] = useState(false);
  const [friendRequestMap, setFriendRequestMap] = useState({});

  // Track which friend request is being processed
  const [activeRequestId, setActiveRequestId] = useState(null);

  // New state for match details
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState({});

  // Fetch potential partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        
        const { data } = await axios.get(`/api/cricket/partners?distance=${searchDistance}`, config);
        setPartners(data.partners);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partners:', error);
        
        if (error.response?.status === 404) {
          // User needs to create a profile first
          setHasProfile(false);
          toast({
            title: 'Profile needed',
            description: 'Please create your user profile first.',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
        } else {
          toast({
            title: 'Error',
            description: error.response?.data?.message || 'Failed to load partners',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
        }
        
        setLoading(false);
      }
    };

    if (user) {
      fetchPartners();
    }
  }, [user, searchDistance, toast]);

  // Update the useEffect to check for existing friend requests
  useEffect(() => {
    // Skip if user is not authenticated
    if (!user || !user.token) return;

    const fetchFriendRequests = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        // Get sent requests
        const { data: sentRequests } = await axios.get('/api/social/friends/requests/sent', config);
        
        // Get received requests
        const { data: receivedRequests } = await axios.get('/api/social/friends/requests', config);
        
        // Get friends list
        const { data: friends } = await axios.get('/api/social/friends', config);

        // Build the friend request map
        const requestMap = {};
        
        // Map sent requests
        sentRequests.forEach(request => {
          requestMap[request.recipient._id] = request.status === 'pending' ? 'sent' : request.status;
        });
        
        // Map received requests
        receivedRequests.forEach(request => {
          requestMap[request.sender._id] = 'received';
        });
        
        // Map friends
        friends.forEach(friend => {
          requestMap[friend._id] = 'accepted';
        });
        
        setFriendRequestMap(requestMap);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
  }, [user, searchDistance]);

  const handleDistanceChange = (value) => {
    setSearchDistance(value);
  };

  const handleCreateProfile = () => {
    navigate('/cricket-profile');
  };

  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const { data } = await axios.get(`/api/cricket/partners?distance=${searchDistance}`, config);
      setPartners(data.partners);
      
      toast({
        title: 'Search refreshed',
        description: `Found ${data.partners.length} potential partners`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error refreshing partners:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to refresh partners',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to record user interaction
  const recordInteraction = async (targetUserId, interactionType, rating = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.post(
        '/api/interactions',
        {
          targetUserId,
          interactionType,
          rating
        },
        config
      );
      
      // No need to wait for response or show toast
    } catch (error) {
      console.error('Error recording interaction:', error);
      // Silent fail - don't notify user of interaction tracking errors
    }
  };

  // Open message modal for a specific partner
  const openMessageModal = (partner) => {
    setSelectedPartner(partner);
    setMessage('');
    setIsMessageModalOpen(true);
    
    // Record the interaction
    recordInteraction(partner.profile.user._id, 'view_profile');
  };

  // Close message modal
  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedPartner(null);
  };

  // Handle sending a message to a partner
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message to send',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setSendingMessage(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const { data } = await axios.post(
        '/api/social/messages', 
        {
          recipientId: selectedPartner.profile.user._id,
          content: message
        },
        config
      );
      
      // Record the interaction
      recordInteraction(selectedPartner.profile.user._id, 'send_message');
      
      toast({
        title: 'Message sent',
        description: `Your message has been sent to ${selectedPartner.profile.user.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      closeMessageModal();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Add handleFriendRequestAction function
  const handleFriendRequestAction = async (userId, status) => {
    try {
      setActiveRequestId(userId);
      setSendingFriendRequest(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      let response;
      let successMessage;
      let interactionType;
      
      // Handle different actions based on status
      if (status === 'none' || !status) {
        // Send new friend request
        console.log('Sending friend request to:', userId);
        response = await axios.post('/api/social/friends/request', { recipientId: userId }, config);
        console.log('Friend request response:', response.data);
        setFriendRequestMap(prev => ({ ...prev, [userId]: 'sent' }));
        successMessage = 'Friend request sent!';
        interactionType = 'send_friend_request';
      } 
      else if (status === 'received') {
        // Accept friend request
        console.log('Accepting friend request:', userId);
        response = await axios.put(`/api/social/friends/request/${userId}`, { action: 'accept' }, config);
        console.log('Accept response:', response.data);
        setFriendRequestMap(prev => ({ ...prev, [userId]: 'accepted' }));
        successMessage = 'Friend request accepted!';
        interactionType = 'accept_friend_request';
      }
      else if (status === 'sent') {
        // Cancel sent request
        console.log('Cancelling friend request:', userId);
        response = await axios.delete(`/api/social/friends/request/${userId}`, config);
        console.log('Cancel response:', response.data);
        setFriendRequestMap(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
        successMessage = 'Friend request cancelled';
      }
      else if (status === 'accepted') {
        // Remove friend
        console.log('Removing friend:', userId);
        response = await axios.delete(`/api/social/friends/${userId}`, config);
        console.log('Remove friend response:', response.data);
        setFriendRequestMap(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
        successMessage = 'Friend removed';
      }
      
      // Record interaction if applicable
      if (interactionType) {
        recordInteraction(userId, interactionType);
      }
      
      toast({
        title: 'Success',
        description: successMessage,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
    } catch (error) {
      console.error('Error handling friend request action:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process friend request',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setActiveRequestId(null);
      setSendingFriendRequest(false);
    }
  };

  // Helper functions for friend request button states
  const getFriendRequestIcon = (userId) => {
    const status = friendRequestMap[userId];
    switch (status) {
      case 'sent':
      case 'pending':
        return <FiClock />;
      case 'accepted':
        return <FiCheck />;
      case 'received':
        return <FiBell />;
      default:
        return <FiUserPlus />;
    }
  };

  const getFriendRequestColor = (userId) => {
    const status = friendRequestMap[userId];
    switch (status) {
      case 'sent':
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'green';
      case 'received':
        return 'purple';
      default:
        return 'blue';
    }
  };

  const getFriendRequestVariant = (userId) => {
    const status = friendRequestMap[userId];
    return status === 'accepted' ? 'solid' : 'outline';
  };

  const getFriendRequestLabel = (userId) => {
    const status = friendRequestMap[userId];
    switch (status) {
      case 'sent':
      case 'pending':
        return 'Request Sent';
      case 'accepted':
        return 'Friends';
      case 'received':
        return 'Accept Request';
      default:
        return 'Add Friend';
    }
  };

  const isDisabledFriendRequest = (userId) => {
    const status = friendRequestMap[userId];
    return status === 'sent' || status === 'pending' || status === 'accepted';
  };

  // Function to determine badge color based on score
  const getBadgeColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'teal';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'orange';
  };

  // Render skill level as stars and value
  const SkillRating = ({ value, label }) => (
    <HStack spacing={2}>
      <Text fontSize="sm" fontWeight="medium" width="80px">
        {label}:
      </Text>
      <HStack spacing={1}>
        {[...Array(10)].map((_, i) => (
          <Box
            key={i}
            h="8px"
            w="8px"
            borderRadius="full"
            bg={i < value ? 'teal.500' : 'gray.200'}
          />
        ))}
      </HStack>
      <Text fontSize="sm" fontWeight="bold" ml={2}>
        {value}/10
      </Text>
    </HStack>
  );

  // Toggle match details popover
  const toggleMatchDetails = (partnerId) => {
    setIsMatchDetailsOpen(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  };

  // Format match detail percentages for display
  const formatMatchDetail = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  // Render a match detail meter
  const MatchDetailMeter = ({ value, label, color = "teal" }) => (
    <HStack spacing={2} width="100%">
      <Text fontSize="sm" fontWeight="medium" width="140px">
        {label}:
      </Text>
      <Box width="full" position="relative">
        <Progress 
          value={value * 100} 
          size="sm" 
          colorScheme={color} 
          borderRadius="full"
        />
      </Box>
      <Text fontSize="sm" fontWeight="bold" width="45px" textAlign="right">
        {formatMatchDetail(value)}
      </Text>
    </HStack>
  );

  const handlePreferenceSearch = async (prefs) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.post('/api/cricket/partners/search', prefs, config);
      setPartners(data.partners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load partners',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH={'100vh'} bg={'gray.50'}>
      <Container maxW={'container.xl'} py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Find {sportType ? sportType.charAt(0).toUpperCase() + sportType.slice(1) : 'Sports'} Partners
          </Heading>
          
          {!hasProfile ? (
            <Box 
              bg="white" 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              textAlign="center"
            >
              <VStack spacing={6}>
                <Heading size="md">Create Your User Profile</Heading>
                <Text>
                  You need to create your user profile before you can find partners.
                  This helps us match you with players that complement your skills and style.
                </Text>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleCreateProfile}
                >
                  Create Profile
                </Button>
              </VStack>
            </Box>
          ) : (
            <>
              {sportType === 'cricket' && (
                <CricketPartnerPreferenceForm onSearch={handlePreferenceSearch} />
              )}
              {hasSearched && !loading && partners.length === 0 && (
                <Box bg="white" p={8} borderRadius="lg" boxShadow="md" textAlign="center">
                  <Text fontSize="lg" color="gray.600">No partners found matching your preferences.</Text>
                </Box>
              )}
              {hasSearched && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {partners.map((partner) => (
                    <Box
                      key={partner.profile._id}
                      bg="white"
                      p={6}
                      borderRadius="lg"
                      boxShadow="md"
                      transition="all 0.3s"
                      _hover={{
                        transform: 'translateY(-5px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => recordInteraction(partner.profile.user._id, 'view_profile')}
                    >
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center">
                          <HStack>
                            <Avatar 
                              size="md" 
                              name={partner.profile.user.name}
                              src={partner.profile.user.profilePicture}
                            >
                              <AvatarBadge bg="green.500" boxSize="1em" />
                            </Avatar>
                            <Box>
                              <Heading size="sm">{partner.profile.user.name}</Heading>
                              <Text fontSize="sm" color="gray.600">
                                {partner.profile.preferredPosition}
                              </Text>
                            </Box>
                          </HStack>
                          <HStack>
                            <Popover
                              isOpen={isMatchDetailsOpen[partner.profile._id]}
                              onClose={() => setIsMatchDetailsOpen(prev => ({ ...prev, [partner.profile._id]: false }))}
                            >
                              <PopoverTrigger>
                                <Button 
                                  size="xs" 
                                  variant="ghost" 
                                  colorScheme="teal"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMatchDetails(partner.profile._id);
                                  }}
                                >
                                  <Icon as={FiInfo} />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent width="300px">
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader fontWeight="bold">Match Details</PopoverHeader>
                                <PopoverBody>
                                  <VStack spacing={3} align="stretch">
                                    <Text fontSize="sm" fontWeight="medium">Our algorithm found that you're a great match!</Text>
                                    {partner.matchDetails && (
                                      <>
                                        <MatchDetailMeter 
                                          value={partner.matchDetails.featureSimilarity} 
                                          label="Similar Interests" 
                                          color="blue"
                                        />
                                        <MatchDetailMeter 
                                          value={partner.matchDetails.complementary} 
                                          label="Complementary Skills" 
                                          color="purple"
                                        />
                                        <MatchDetailMeter 
                                          value={partner.matchDetails.skillBalance} 
                                          label="Skill Match" 
                                          color="green"
                                        />
                                        <MatchDetailMeter 
                                          value={partner.matchDetails.availability} 
                                          label="Availability Match" 
                                          color="orange"
                                        />
                                        <MatchDetailMeter 
                                          value={partner.matchDetails.preferenceMatch || 0} 
                                          label="Preference Match" 
                                          color="pink"
                                        />
                                        {partner.matchDetails.interactions > 0 && (
                                          <MatchDetailMeter 
                                            value={partner.matchDetails.interactions} 
                                            label="Interaction History" 
                                            color="cyan"
                                          />
                                        )}
                                      </>
                                    )}
                                  </VStack>
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Badge
                              colorScheme={getBadgeColor(partner.similarityScore)}
                              fontSize="md"
                              py={1}
                              px={3}
                              borderRadius="full"
                            >
                              {partner.similarityScore}% Match
                            </Badge>
                          </HStack>
                        </Flex>
                        
                        <Divider />
                        
                        <VStack align="stretch" spacing={3}>
                          <SkillRating value={partner.profile.battingSkill} label="Batting" />
                          <SkillRating value={partner.profile.bowlingSkill} label="Bowling" />
                          <SkillRating value={partner.profile.fieldingSkill} label="Fielding" />
                        </VStack>
                        
                        <Divider />
                        
                        <VStack align="stretch" spacing={2}>
                          <HStack>
                            <Icon as={FiAward} color="teal.500" />
                            <Text fontSize="sm">
                              <Text as="span" fontWeight="medium">Style:</Text>{' '}
                              {partner.profile.battingStyle} batsman, {partner.profile.bowlingStyle} bowler
                            </Text>
                          </HStack>
                          
                          <HStack>
                            <Icon as={FiMapPin} color="teal.500" />
                            <Text fontSize="sm" noOfLines={1}>
                              <Text as="span" fontWeight="medium">Location:</Text>{' '}
                              {partner.profile.location}
                            </Text>
                          </HStack>
                          
                          <HStack>
                            <Icon as={FiCalendar} color="teal.500" />
                            <Text fontSize="sm">
                              <Text as="span" fontWeight="medium">Available:</Text>{' '}
                              {partner.profile.availability.weekdays ? 'Weekdays' : ''} 
                              {partner.profile.availability.weekdays && partner.profile.availability.weekends ? ' & ' : ''}
                              {partner.profile.availability.weekends ? 'Weekends' : ''}
                            </Text>
                          </HStack>
                          
                          <HStack>
                            <Icon as={FiClock} color="teal.500" />
                            <Text fontSize="sm">
                              <Text as="span" fontWeight="medium">Preferred time:</Text>{' '}
                              {partner.profile.availability.preferred_time}
                            </Text>
                          </HStack>
                        </VStack>
                        
                        <HStack spacing={2}>
                          <Button
                            leftIcon={getFriendRequestIcon(partner.profile.user._id)}
                            colorScheme={getFriendRequestColor(partner.profile.user._id)}
                            variant={getFriendRequestVariant(partner.profile.user._id)}
                            size="sm"
                            flex="1"
                            isLoading={sendingFriendRequest && activeRequestId === partner.profile.user._id}
                            isDisabled={isDisabledFriendRequest(partner.profile.user._id)}
                            onClick={() => handleFriendRequestAction(partner.profile.user._id, friendRequestMap[partner.profile.user._id])}
                          >
                            {getFriendRequestLabel(partner.profile.user._id)}
                          </Button>
                          <Button
                            leftIcon={<FiMail />}
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                            flex="1"
                            onClick={() => openMessageModal(partner)}
                          >
                            Message
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </VStack>
      </Container>

      {/* Message Modal */}
      <Modal isOpen={isMessageModalOpen} onClose={closeMessageModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Send Message to {selectedPartner?.profile.user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Start a conversation with {selectedPartner?.profile.user.name} to discuss playing cricket together.
            </Text>
            <FormControl>
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup spacing={3}>
              <Button variant="ghost" onClick={closeMessageModal}>
                Cancel
              </Button>
              <Button 
                colorScheme="teal" 
                leftIcon={<FiMail />}
                isLoading={sendingMessage}
                onClick={handleSendMessage}
              >
                Send Message
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FindPartners; 