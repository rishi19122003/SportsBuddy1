import React, { useEffect, useState } from 'react';
import { Box, Flex, VStack, HStack, Input, Button, Text, Avatar, Spinner, useToast, Heading } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  // Fetch conversation users
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/social/messages/conversations', config);
        setConversations(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load conversations', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setLoadingConversations(false);
      }
    };
    if (user) fetchConversations();
  }, [user, toast]);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/social/messages/${selectedUser._id}`, config);
        setMessages(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load messages', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser, user, toast]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/social/messages', {
        recipientId: selectedUser._id,
        content: newMessage
      }, config);
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <Flex h="80vh" maxW="6xl" mx="auto" mt={10} bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      {/* Conversation List */}
      <Box w="300px" borderRightWidth={1} p={4} bg="gray.50">
        <Heading size="md" mb={4}>Chats</Heading>
        {loadingConversations ? <Spinner /> : (
          <VStack align="stretch" spacing={2}>
            {conversations.length === 0 ? <Text>No conversations.</Text> : conversations.map(conv => (
              <HStack
                key={conv._id}
                p={2}
                borderRadius="md"
                bg={selectedUser?._id === conv._id ? 'teal.100' : 'transparent'}
                cursor="pointer"
                _hover={{ bg: 'teal.50' }}
                onClick={() => setSelectedUser(conv)}
              >
                <Avatar size="sm" name={conv.name} src={conv.profilePicture} />
                <Text fontWeight="medium">{conv.name}</Text>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
      {/* Chat Window */}
      <Flex flex={1} direction="column" p={4}>
        {selectedUser ? (
          <>
            <HStack mb={4}>
              <Avatar size="md" name={selectedUser.name} src={selectedUser.profilePicture} />
              <Text fontWeight="bold" fontSize="lg">{selectedUser.name}</Text>
            </HStack>
            <Box flex={1} overflowY="auto" mb={4} borderWidth={1} borderRadius="md" p={4} bg="gray.50">
              {loadingMessages ? <Spinner /> : (
                <VStack align="stretch" spacing={3}>
                  {messages.length === 0 ? <Text>No messages yet.</Text> : messages.map(msg => (
                    <Box key={msg._id} alignSelf={msg.sender._id === user._id ? 'flex-end' : 'flex-start'}>
                      <Text fontSize="sm" color="gray.600">{msg.sender.name}</Text>
                      <Box bg={msg.sender._id === user._id ? 'teal.200' : 'gray.200'} p={2} borderRadius="md" maxW="300px">
                        {msg.content}
                      </Box>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <HStack mt={2}>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                isDisabled={sending}
              />
              <Button colorScheme="teal" onClick={handleSend} isLoading={sending}>Send</Button>
            </HStack>
          </>
        ) : (
          <Flex flex={1} align="center" justify="center">
            <Text color="gray.500">Select a conversation to start chatting</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Chat; 