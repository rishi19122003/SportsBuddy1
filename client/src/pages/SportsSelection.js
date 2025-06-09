import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Flex,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';
import { 
  GiCricketBat, 
  GiSoccerBall, 
  GiTennisRacket, 
  GiBasketballBasket,
  GiVolleyballBall
} from 'react-icons/gi';
import { MdSportsCricket, MdSportsTennis } from 'react-icons/md';
import { IoTennisball } from 'react-icons/io5';

const SportsCard = ({ icon, title, description, isActive = false, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const activeBgColor = useColorModeValue('teal.50', 'teal.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBorderColor = 'teal.500';

  return (
    <Box
      p={6}
      bg={isActive ? activeBgColor : bgColor}
      borderWidth="1px"
      borderColor={isActive ? activeBorderColor : borderColor}
      borderRadius="lg"
      boxShadow="md"
      transition="all 0.3s"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
        borderColor: 'teal.500',
      }}
    >
      <VStack spacing={4} align="center">
        <Icon as={icon} fontSize="4xl" color={isActive ? 'teal.500' : 'gray.500'} />
        <Heading size="md" textAlign="center">
          {title}
        </Heading>
        <Text textAlign="center" color="gray.600" fontSize="sm">
          {description}
        </Text>
        {isActive && (
          <Button size="sm" colorScheme="teal" mt={2}>
            Selected
          </Button>
        )}
      </VStack>
    </Box>
  );
};

const SportsSelection = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = React.useState('cricket');

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
  };

  const handleContinue = () => {
    if (selectedSport === 'cricket') {
      navigate('/find-partners?type=cricket');
    } else if (selectedSport === 'football') {
      navigate('/football-profile');
    } else {
      // For future implementation of other sports
      navigate('/dashboard');
    }
  };

  return (
    <Box minH={'100vh'} bg={'gray.50'}>
      <Container maxW={'container.xl'} py={10}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="xl" mb={2}>
              Select Your Sport
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Choose the sport you want to find partners for
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            <SportsCard
              icon={MdSportsCricket}
              title="Cricket"
              description="Find cricket partners for batting, bowling, or full matches"
              isActive={selectedSport === 'cricket'}
              onClick={() => handleSportSelect('cricket')}
            />
            
            <SportsCard
              icon={GiSoccerBall}
              title="Football"
              description="Connect with football players for matches or practice"
              isActive={selectedSport === 'football'}
              onClick={() => handleSportSelect('football')}
            />
            
            <SportsCard
              icon={GiTennisRacket}
              title="Tennis"
              description="Find tennis partners for singles or doubles matches"
              isActive={selectedSport === 'tennis'}
              onClick={() => handleSportSelect('tennis')}
            />
            
            <SportsCard
              icon={GiBasketballBasket}
              title="Basketball"
              description="Connect with basketball players for games or practice"
              isActive={selectedSport === 'basketball'}
              onClick={() => handleSportSelect('basketball')}
            />
            
            <SportsCard
              icon={GiVolleyballBall}
              title="Volleyball"
              description="Find volleyball partners for beach or indoor games"
              isActive={selectedSport === 'volleyball'}
              onClick={() => handleSportSelect('volleyball')}
            />
            
            <SportsCard
              icon={MdSportsTennis}
              title="Badminton"
              description="Connect with badminton players for singles or doubles"
              isActive={selectedSport === 'badminton'}
              onClick={() => handleSportSelect('badminton')}
            />
            
            <SportsCard
              icon={IoTennisball}
              title="Table Tennis"
              description="Find table tennis partners for matches or practice"
              isActive={selectedSport === 'table-tennis'}
              onClick={() => handleSportSelect('table-tennis')}
            />
            
            <SportsCard
              icon={FiActivity}
              title="More Sports"
              description="More sports coming soon - stay tuned!"
              isActive={selectedSport === 'more'}
              onClick={() => handleSportSelect('more')}
            />
          </SimpleGrid>

          <Flex justify="center" mt={10}>
            <Button 
              colorScheme="teal" 
              size="lg" 
              px={10}
              onClick={handleContinue}
            >
              Continue with {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default SportsSelection; 