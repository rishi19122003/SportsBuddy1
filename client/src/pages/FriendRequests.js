import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Divider,
  useToast,
  Spinner,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Textarea,
  ButtonGroup
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { FiMail } from 'react-icons/fi';

const FriendRequests = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Message modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch friend requests and friends
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        const [receivedData, sentData, friendsData] = await Promise.all([
          axios.get('/api/social/friends/requests', config),
          axios.get('/api/social/friends/requests/sent', config),
          axios.get('/api/social/friends', config)
        ]);

        setReceivedRequests(receivedData.data);
        setSentRequests(sentData.data);
        setFriends(friendsData.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load friend requests',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleRequestAction = async (requestId, action) => {
    setProcessing(requestId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.put(`/api/social/friends/request/${requestId}`, { action }, config);

      // Update the requests list
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

      // If accepted, add to friends list
      if (action === 'accept') {
        const request = receivedRequests.find(req => req._id === requestId);
        if (request) {
          setFriends(prev => [...prev, request.sender]);
        }
      }

      toast({
        title: 'Success',
        description: `Friend request ${action}ed`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} friend request`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setProcessing(friendId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.delete(`/api/social/friends/${friendId}`, config);
      setFriends(prev => prev.filter(friend => friend._id !== friendId));

      toast({
        title: 'Success',
        description: 'Friend removed',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleMessageClick = (friend) => {
    setSelectedFriend(friend);
    setMessage('');
    setIsMessageModalOpen(true);
  };

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
      
      await axios.post(
        '/api/social/messages', 
        {
          recipientId: selectedFriend._id,
          content: message
        },
        config
      );
      
      toast({
        title: 'Message sent',
        description: `Your message has been sent to ${selectedFriend.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      setIsMessageModalOpen(false);
      setSelectedFriend(null);
      setMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={5}>
        <VStack>
          <Spinner />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Heading mb={6}>Friend Requests</Heading>
      <Tabs>
        <TabList>
          <Tab>Received Requests {receivedRequests.length > 0 && <Badge ml={2} colorScheme="red">{receivedRequests.length}</Badge>}</Tab>
          <Tab>Sent Requests</Tab>
          <Tab>Friends</Tab>
        </TabList>

        <TabPanels>
          {/* Received Requests */}
          <TabPanel>
            <VStack align="stretch" spacing={4} divider={<Divider />}>
              {receivedRequests.map(request => (
                <HStack key={request._id} justify="space-between">
                  <HStack>
                    <Avatar name={request.sender.name} src={request.sender.profilePicture} />
                    <Box>
                      <Text fontWeight="medium">{request.sender.name}</Text>
                      <Text fontSize="sm" color="gray.500">{request.sender.email}</Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Button
                      colorScheme="teal"
                      size="sm"
                      isLoading={processing === request._id}
                      onClick={() => handleRequestAction(request._id, 'accept')}
                    >
                      Accept
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      isLoading={processing === request._id}
                      onClick={() => handleRequestAction(request._id, 'reject')}
                    >
                      Reject
                    </Button>
                  </HStack>
                </HStack>
              ))}
              {receivedRequests.length === 0 && (
                <Text color="gray.500">No pending friend requests</Text>
              )}
            </VStack>
          </TabPanel>

          {/* Sent Requests */}
          <TabPanel>
            <VStack align="stretch" spacing={4} divider={<Divider />}>
              {sentRequests.map(request => (
                <HStack key={request._id} justify="space-between">
                  <HStack>
                    <Avatar name={request.recipient.name} src={request.recipient.profilePicture} />
                    <Box>
                      <Text fontWeight="medium">{request.recipient.name}</Text>
                      <Text fontSize="sm" color="gray.500">{request.recipient.email}</Text>
                    </Box>
                  </HStack>
                  <Badge>{request.status}</Badge>
                </HStack>
              ))}
              {sentRequests.length === 0 && (
                <Text color="gray.500">No sent friend requests</Text>
              )}
            </VStack>
          </TabPanel>

          {/* Friends List */}
          <TabPanel>
            <VStack align="stretch" spacing={4} divider={<Divider />}>
              {friends.map(friend => (
                <HStack key={friend._id} justify="space-between">
                  <HStack>
                    <Avatar name={friend.name} src={friend.profilePicture} />
                    <Box>
                      <Text fontWeight="medium">{friend.name}</Text>
                      <Text fontSize="sm" color="gray.500">{friend.email}</Text>
                    </Box>
                  </HStack>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FiMail />}
                      colorScheme="teal"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageClick(friend)}
                    >
                      Message
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      isLoading={processing === friend._id}
                      onClick={() => handleRemoveFriend(friend._id)}
                    >
                      Remove
                    </Button>
                  </HStack>
                </HStack>
              ))}
              {friends.length === 0 && (
                <Text color="gray.500">No friends yet</Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Message Modal */}
      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Send Message to {selectedFriend?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Start a conversation with {selectedFriend?.name}.
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
              <Button variant="ghost" onClick={() => setIsMessageModalOpen(false)}>
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
    </Container>
  );
};

export default FriendRequests; 