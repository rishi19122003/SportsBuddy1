import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Avatar,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  SimpleGrid,
  Icon,
  Divider,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SportsBuddyLogo from '../assets/sportsBuddyLogo';
import { FiUsers, FiUser, FiCalendar, FiMapPin, FiMessageSquare, FiActivity, FiSearch, FiEdit } from 'react-icons/fi';
import { GiCricketBat, GiSoccerBall, GiTennisRacket } from 'react-icons/gi';
import { MdSportsCricket } from 'react-icons/md';
import axios from 'axios';

const FeatureCard = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.700')}
      p={6}
      rounded="lg"
      shadow="base"
      borderWidth="1px"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        shadow: 'md',
      }}
    >
      <VStack spacing={4} align="start">
        <Icon as={icon} fontSize="2xl" color="teal.500" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{description}</Text>
        <Button
          mt={2}
          colorScheme="teal"
          variant="outline"
          rightIcon={<Box as={icon} size="1em" />}
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </VStack>
    </Box>
  );
};

const RecentActivityCard = ({ activity }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((new Date() - new Date(activity.timestamp)) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) setTimeString(Math.floor(interval) + ' years ago');
      else {
        interval = seconds / 2592000;
        if (interval > 1) setTimeString(Math.floor(interval) + ' months ago');
        else {
          interval = seconds / 86400;
          if (interval > 1) setTimeString(Math.floor(interval) + ' days ago');
          else {
            interval = seconds / 3600;
            if (interval > 1) setTimeString(Math.floor(interval) + ' hours ago');
            else {
              interval = seconds / 60;
              if (interval > 1) setTimeString(Math.floor(interval) + ' minutes ago');
              else setTimeString(Math.floor(seconds) + ' seconds ago');
            }
          }
        }
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [activity.timestamp]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'join': return <Icon as={FiUser} color="green.500" />;
      case 'match': return <Icon as={FiCalendar} color="blue.500" />;
      case 'search': return <Icon as={FiSearch} color="purple.500" />;
      case 'profile': return <Icon as={FiEdit} color="orange.500" />;
      default: return <Icon as={FiActivity} color="gray.500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'join': return 'green';
      case 'match': return 'blue';
      case 'search': return 'purple';
      case 'profile': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      mb={3}
      bg={useColorModeValue('white', 'gray.700')}
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex align="center">
        <Avatar 
          size="sm" 
          name={activity.user?.name || 'User'} 
          src={activity.user?.profilePicture} 
          mr={3} 
        />
        <Box flex="1">
          <HStack>
            <Text fontWeight="bold">{activity.user?.name || 'User'}</Text>
            {getActivityIcon(activity.type)}
          </HStack>
          <Text fontSize="sm" color="gray.600">
            {activity.action}
          </Text>
          {activity.details && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              {activity.details}
            </Text>
          )}
        </Box>
        <VStack align="end" spacing={1}>
          <Badge colorScheme={getActivityColor(activity.type)} fontSize="xs">
            {activity.type}
          </Badge>
        <Text fontSize="xs" color="gray.500">
            {timeString}
        </Text>
        </VStack>
      </Flex>
    </Box>
  );
};

const PopularSportCard = ({ icon, sport, count }) => {
  return (
    <Flex
      align="center"
      p={3}
      borderWidth="1px"
      borderRadius="md"
      mb={3}
      bg={useColorModeValue('white', 'gray.700')}
    >
      <Icon as={icon} fontSize="xl" color="teal.500" mr={3} />
      <Text flex="1" fontWeight="medium">
        {sport}
      </Text>
      <Badge colorScheme="teal" borderRadius="full" px={2}>
        {count} users
      </Badge>
    </Flex>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivities = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.get('/api/activities/recent', config);
      setRecentActivities(data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
    // Set up polling for real-time updates
    const interval = setInterval(fetchRecentActivities, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user.token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock popular sports
  const popularSports = [
    { icon: MdSportsCricket, sport: 'Cricket', count: 124 },
    { icon: GiSoccerBall, sport: 'Football', count: 98 },
    { icon: GiTennisRacket, sport: 'Tennis', count: 67 },
  ];

  return (
    <Box minH={'100vh'} bg={useColorModeValue('gray.50', 'gray.800')}>
      {/* Header */}
      <Box
        as="nav"
        bg={useColorModeValue('white', 'gray.800')}
        shadow="md"
        p={4}
      >
        <Flex
          maxW="container.xl"
          mx="auto"
          align="center"
          justify="space-between"
        >
          <SportsBuddyLogo size="md" />
          <HStack spacing={4}>
            <Avatar
              size="sm"
              name={user?.name}
              src={user?.profilePicture}
              bg="teal.500"
            />
            <Text fontWeight="medium">{user?.name}</Text>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={10}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
        >
          {/* Main Content - 3/4 width on large screens */}
          <GridItem colSpan={{ base: 1, lg: 3 }}>
            <VStack spacing={8} align="stretch">
              <Box textAlign="center">
                <Heading as="h1" size="xl" mb={2}>
                  Welcome to SportsBuddy, {user?.name}!
                </Heading>
                <Text color="gray.600">
                  Find your perfect sports partner and start playing today
                </Text>
              </Box>

              {/* Main Features */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FeatureCard
                  icon={FiActivity}
                  title="Find Sports Partners"
                  description="Choose your sport and find partners with similar skill levels and preferences."
                  buttonText="Find Partners"
                  onClick={() => navigate('/sports-selection')}
                />
                <FeatureCard
                  icon={FiUser}
                  title="User Profile"
                  description="Create or update your user profile with your cricket skills and preferences. This profile will be used by others to find you as a partner."
                  buttonText="Edit Profile"
                  onClick={() => navigate('/cricket-profile')}
                />
                <FeatureCard
                  icon={FiCalendar}
                  title="Cricket Matches"
                  description="View scheduled matches or create a new cricket match."
                  buttonText="View Matches"
                  onClick={() => navigate('/matches')}
                />
                <FeatureCard
                  icon={FiUsers}
                  title="Sports Community"
                  description="Join sports clubs, participate in discussions, share tips, and watch training videos from the community."
                  buttonText="Join Community"
                  onClick={() => navigate('/community')}
                />
                <FeatureCard
                  icon={FiMessageSquare}
                  title="Messages"
                  description="View and respond to messages from your sports buddies."
                  buttonText={<HStack>View Messages</HStack>}
                  onClick={() => navigate('/messages')}
                />
                <FeatureCard
                  icon={FiUsers}
                  title="Friend Requests"
                  description="See and accept friend requests from other players."
                  buttonText={<HStack>View Friend Requests</HStack>}
                  onClick={() => navigate('/friend-requests')}
                />
              </SimpleGrid>

              {/* Cricket-specific section */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={8}
                rounded="lg"
                shadow="base"
                borderWidth="1px"
                mt={4}
              >
                <Flex align="center" mb={6}>
                  <Icon as={MdSportsCricket} fontSize="3xl" color="teal.500" mr={3} />
                  <Heading as="h2" size="lg">
                    Cricket Partners
                  </Heading>
                </Flex>
                
                <Text mb={6}>
                  Find cricket partners based on your batting, bowling, and fielding skills.
                  Our matching algorithm helps you find complementary players in your area.
                </Text>
                
                <HStack spacing={4} flexWrap="wrap">
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<Icon as={FiUser} />}
                    onClick={() => navigate('/cricket-profile')}
                  >
                    User Profile
                  </Button>
                  <Button 
                    colorScheme="orange" 
                    leftIcon={<Icon as={FiUsers} />}
                    onClick={() => navigate('/find-partners')}
                  >
                    Find Cricket Partners
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </GridItem>

          {/* Sidebar - 1/4 width on large screens */}
          <GridItem colSpan={1}>
            <VStack spacing={6} align="stretch">
              {/* User Card */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={6}
                rounded="lg"
                shadow="base"
                borderWidth="1px"
              >
                <VStack spacing={4}>
                  <Avatar
                    size="xl"
                    name={user?.name}
                    src={user?.profilePicture}
                  />
                  <Heading size="md">{user?.name}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {user?.email}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    width="full"
                    leftIcon={<FiUser />}
                    onClick={() => navigate('/profile')}
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    width="full"
                    leftIcon={<FiUsers />}
                    onClick={() => navigate('/friend-requests')}
                  >
                    Friend Requests
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                    leftIcon={<FiMessageSquare />}
                    onClick={() => navigate('/messages')}
                  >
                    Messages
                  </Button>
                </VStack>
              </Box>

              {/* Recent Activity */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={6}
                rounded="lg"
                shadow="base"
                borderWidth="1px"
              >
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Last 3 Activities</Heading>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant="ghost"
                    onClick={() => setRecentActivities([])}
                  >
                    Clear All
                  </Button>
                </HStack>
                {loading ? (
                  <Center p={4}>
                    <Spinner />
                  </Center>
                ) : recentActivities.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {recentActivities.map((activity, index) => (
                      <RecentActivityCard 
                        key={activity._id || index} 
                        activity={activity}
                      />
                  ))}
                </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center">No recent activity</Text>
                )}
              </Box>

              {/* Popular Sports */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={6}
                rounded="lg"
                shadow="base"
                borderWidth="1px"
              >
                <Heading size="md" mb={4}>
                  Popular Sports
                </Heading>
                <VStack spacing={3} align="stretch">
                  {popularSports.map((sport, index) => (
                    <PopularSportCard
                      key={index}
                      icon={sport.icon}
                      sport={sport.sport}
                      count={sport.count}
                    />
                  ))}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 