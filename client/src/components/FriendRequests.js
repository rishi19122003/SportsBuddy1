import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function FriendRequests() {
  const [value, setValue] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch received requests
      const receivedRes = await axios.get('/api/social/friends/requests');
      console.log('Received requests:', receivedRes.data);
      setReceivedRequests(receivedRes.data);

      // Fetch sent requests
      const sentRes = await axios.get('/api/social/friends/requests/sent');
      console.log('Sent requests:', sentRes.data);
      setSentRequests(sentRes.data);

      // Fetch friends list
      const friendsRes = await axios.get('/api/social/friends');
      console.log('Friends list:', friendsRes.data);
      setFriends(friendsRes.data);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      setError('Failed to load friend requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      setError(null);
      await axios.put(`/api/social/friends/request/${requestId}`, { action });
      fetchFriendRequests(); // Refresh the lists
    } catch (err) {
      console.error('Error responding to friend request:', err);
      setError('Failed to process friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      setError(null);
      await axios.delete(`/api/social/friends/${friendId}`);
      fetchFriendRequests(); // Refresh the lists
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={value} onChange={handleTabChange} centered>
        <Tab label={`Received (${receivedRequests.length})`} />
        <Tab label={`Sent (${sentRequests.length})`} />
        <Tab label={`Friends (${friends.length})`} />
      </Tabs>

      <TabPanel value={value} index={0}>
        <List>
          {receivedRequests.length === 0 ? (
            <Typography color="textSecondary">No pending friend requests</Typography>
          ) : (
            receivedRequests.map((request) => (
              <ListItem
                key={request._id}
                secondaryAction={
                  <Box>
                    <Button
                      color="primary"
                      onClick={() => handleRequestResponse(request._id, 'accept')}
                    >
                      Accept
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleRequestResponse(request._id, 'reject')}
                    >
                      Reject
                    </Button>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar src={request.sender.profilePicture} alt={request.sender.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.sender.name}
                  secondary={request.sender.email}
                />
              </ListItem>
            ))
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <List>
          {sentRequests.length === 0 ? (
            <Typography color="textSecondary">No sent friend requests</Typography>
          ) : (
            sentRequests.map((request) => (
              <ListItem key={request._id}>
                <ListItemAvatar>
                  <Avatar src={request.recipient.profilePicture} alt={request.recipient.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.recipient.name}
                  secondary={`Status: ${request.status}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <List>
          {friends.length === 0 ? (
            <Typography color="textSecondary">No friends yet</Typography>
          ) : (
            friends.map((friend) => (
              <ListItem
                key={friend._id}
                secondaryAction={
                  <Button
                    color="error"
                    onClick={() => handleRemoveFriend(friend._id)}
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={friend.profilePicture} alt={friend.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={friend.name}
                  secondary={friend.email}
                />
              </ListItem>
            ))
          )}
        </List>
      </TabPanel>
    </Box>
  );
}

export default FriendRequests; 