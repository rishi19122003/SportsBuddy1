import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  Button,
  Divider,
  useToast,
  Spinner,
  Heading
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const Messages = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const { data } = await axios.get('/api/social/messages/conversations', config);
        setConversations(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const { data } = await axios.get(`/api/social/messages/${selectedUser._id}`, config);
        setMessages(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    };

    fetchMessages();
  }, [selectedUser, user, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.post('/api/social/messages', {
        recipientId: selectedUser._id,
        content: newMessage
      }, config);

      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Heading mb={6}>Messages</Heading>
      <Flex h="70vh" borderWidth={1} borderRadius="lg" overflow="hidden">
        {/* Conversations List */}
        <Box w="300px" borderRightWidth={1} bg="gray.50" overflowY="auto">
          {loading ? (
            <VStack py={8}>
              <Spinner />
            </VStack>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {conversations.map(conv => (
                <HStack
                  key={conv._id}
                  p={3}
                  cursor="pointer"
                  bg={selectedUser?._id === conv._id ? 'teal.50' : 'transparent'}
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => setSelectedUser(conv)}
                >
                  <Avatar size="sm" name={conv.name} src={conv.profilePicture} />
                  <Text fontWeight="medium">{conv.name}</Text>
                </HStack>
              ))}
              {conversations.length === 0 && (
                <Text p={4} color="gray.500">
                  No conversations yet
                </Text>
              )}
            </VStack>
          )}
        </Box>

        {/* Chat Window */}
        <Flex flex={1} direction="column">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <HStack p={3} bg="gray.50" borderBottomWidth={1}>
                <Avatar size="sm" name={selectedUser.name} src={selectedUser.profilePicture} />
                <Text fontWeight="medium">{selectedUser.name}</Text>
              </HStack>

              {/* Messages */}
              <VStack flex={1} p={4} overflowY="auto" spacing={4} align="stretch">
                {messages.map(message => (
                  <Box
                    key={message._id}
                    alignSelf={message.sender._id === user._id ? 'flex-end' : 'flex-start'}
                    maxW="70%"
                  >
                    <Box
                      bg={message.sender._id === user._id ? 'teal.500' : 'gray.100'}
                      color={message.sender._id === user._id ? 'white' : 'black'}
                      p={3}
                      borderRadius="lg"
                    >
                      <Text>{message.content}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Text>
                  </Box>
                ))}
                {messages.length === 0 && (
                  <Text color="gray.500" alignSelf="center">
                    No messages yet
                  </Text>
                )}
              </VStack>

              {/* Message Input */}
              <HStack p={3} borderTopWidth={1}>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  colorScheme="teal"
                  onClick={handleSendMessage}
                  isLoading={sending}
                >
                  Send
                </Button>
              </HStack>
            </>
          ) : (
            <Flex
              flex={1}
              align="center"
              justify="center"
              bg="gray.50"
            >
              <Text color="gray.500">
                Select a conversation to start chatting
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Container>
  );
};

export default Messages; 