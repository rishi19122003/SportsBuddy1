import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Stack,
  Heading,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Checkbox,
  RadioGroup,
  Radio,
  useToast,
  VStack,
  HStack,
  Flex,
  Container,
  Input,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const CricketProfileForm = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    battingSkill: 5,
    bowlingSkill: 5,
    fieldingSkill: 5,
    battingStyle: '',
    bowlingStyle: '',
    preferredPosition: '',
    location: {
      type: 'Point',
      coordinates: [0, 0], // [longitude, latitude]
      address: ''
    },
    availability: {
      weekdays: false,
      weekends: true,
      preferred_time: 'Evening'
    }
  });

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // Load existing profile if available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        
        const { data } = await axios.get('/api/cricket/profile', config);
        setExistingProfile(data);
        setFormData({
          battingSkill: data.battingSkill,
          bowlingSkill: data.bowlingSkill,
          fieldingSkill: data.fieldingSkill,
          battingStyle: data.battingStyle,
          bowlingStyle: data.bowlingStyle,
          preferredPosition: data.preferredPosition,
          location: data.location,
          availability: data.availability
        });
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Get current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding to get address from coordinates
            const { latitude, longitude } = position.coords;
            
            // Using Open Street Map Nominatim API for geocoding (free)
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            const address = response.data.display_name;
            
            setFormData({
              ...formData,
              location: {
                type: 'Point',
                coordinates: [longitude, latitude],
                address
              }
            });
            
            toast({
              title: 'Location detected',
              description: `Your location: ${address}`,
              status: 'success',
              duration: 3000,
              isClosable: true
            });
          } catch (error) {
            console.error('Error getting location address:', error);
            toast({
              title: 'Location error',
              description: 'Could not get your address. Please enter it manually.',
              status: 'error',
              duration: 3000,
              isClosable: true
            });
            
            // Still update coordinates
            setFormData({
              ...formData,
              location: {
                ...formData.location,
                coordinates: [position.coords.longitude, position.coords.latitude]
              }
            });
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location error',
            description: 'Unable to get your location. Please enable location services.',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
          setLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: 'Location not supported',
        description: 'Geolocation is not supported by your browser.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      setLoadingLocation(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.battingStyle || !formData.bowlingStyle || !formData.preferredPosition) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (formData.location.address === '') {
      toast({
        title: 'Error',
        description: 'Please provide your location',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.post('/api/cricket/profile', formData, config);
      
      toast({
        title: 'Profile saved',
        description: 'Your cricket profile has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred while saving your profile',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleSkillChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleStyleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        address: e.target.value
      }
    });
  };

  const handleAvailabilityChange = (field, value) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [field]: value
      }
    });
  };

  return (
    <Box minH={'100vh'} bg={'gray.50'}>
      <Container maxW={'container.md'} py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            User Profile
          </Heading>
          <Text fontSize="lg" textAlign="center" color="gray.600">
            Complete your user profile. This information will be used by others to find you as a cricket partner.
          </Text>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            rounded="lg"
            shadow="md"
            p={8}
          >
            {/* Skill Ratings */}
            <VStack spacing={8} align="stretch" mb={8}>
              <Heading as="h2" size="md">
                Rate Your Skills (1-10)
              </Heading>

              <FormControl>
                <FormLabel fontWeight="bold">Batting Skill: {formData.battingSkill}</FormLabel>
                <Slider
                  defaultValue={5}
                  min={1}
                  max={10}
                  step={1}
                  value={formData.battingSkill}
                  onChange={(val) => handleSkillChange('battingSkill', val)}
                  colorScheme="teal"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <Flex justify="space-between" width="100%">
                  <Text fontSize="xs">Beginner</Text>
                  <Text fontSize="xs">Expert</Text>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Bowling Skill: {formData.bowlingSkill}</FormLabel>
                <Slider
                  defaultValue={5}
                  min={1}
                  max={10}
                  step={1}
                  value={formData.bowlingSkill}
                  onChange={(val) => handleSkillChange('bowlingSkill', val)}
                  colorScheme="teal"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <Flex justify="space-between" width="100%">
                  <Text fontSize="xs">Beginner</Text>
                  <Text fontSize="xs">Expert</Text>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Fielding Skill: {formData.fieldingSkill}</FormLabel>
                <Slider
                  defaultValue={5}
                  min={1}
                  max={10}
                  step={1}
                  value={formData.fieldingSkill}
                  onChange={(val) => handleSkillChange('fieldingSkill', val)}
                  colorScheme="teal"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
                <Flex justify="space-between" width="100%">
                  <Text fontSize="xs">Beginner</Text>
                  <Text fontSize="xs">Expert</Text>
                </Flex>
              </FormControl>
            </VStack>

            <Divider my={6} />

            {/* Playing Styles */}
            <VStack spacing={6} align="stretch" mb={8}>
              <Heading as="h2" size="md">
                Playing Style
              </Heading>

              <FormControl isRequired>
                <FormLabel>Batting Style</FormLabel>
                <Select
                  placeholder="Select batting style"
                  value={formData.battingStyle}
                  onChange={(e) => handleStyleChange('battingStyle', e.target.value)}
                >
                  <option value="Right-handed">Right-handed</option>
                  <option value="Left-handed">Left-handed</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Bowling Style</FormLabel>
                <Select
                  placeholder="Select bowling style"
                  value={formData.bowlingStyle}
                  onChange={(e) => handleStyleChange('bowlingStyle', e.target.value)}
                >
                  <option value="Fast">Fast</option>
                  <option value="Medium">Medium</option>
                  <option value="Spin">Spin</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Preferred Position</FormLabel>
                <Select
                  placeholder="Select preferred position"
                  value={formData.preferredPosition}
                  onChange={(e) => handleStyleChange('preferredPosition', e.target.value)}
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </Select>
              </FormControl>
            </VStack>

            <Divider my={6} />

            {/* Location */}
            <VStack spacing={6} align="stretch" mb={8}>
              <Heading as="h2" size="md">
                Location
              </Heading>

              <FormControl isRequired>
                <FormLabel>Your Location</FormLabel>
                <Flex>
                  <Input
                    value={formData.location.address}
                    onChange={handleAddressChange}
                    placeholder="Your location"
                    mr={2}
                  />
                  <Button
                    onClick={getCurrentLocation}
                    colorScheme="blue"
                    isLoading={loadingLocation}
                    loadingText="Detecting"
                    size="md"
                    width="auto"
                  >
                    Detect
                  </Button>
                </Flex>
                <FormHelperText>
                  We use your location to find players near you.
                </FormHelperText>
              </FormControl>
            </VStack>

            <Divider my={6} />

            {/* Availability */}
            <VStack spacing={6} align="stretch" mb={8}>
              <Heading as="h2" size="md">
                Availability
              </Heading>

              <FormControl>
                <FormLabel>When are you available?</FormLabel>
                <Stack spacing={2}>
                  <Checkbox
                    colorScheme="teal"
                    isChecked={formData.availability.weekdays}
                    onChange={(e) => 
                      handleAvailabilityChange('weekdays', e.target.checked)
                    }
                  >
                    Weekdays
                  </Checkbox>
                  <Checkbox
                    colorScheme="teal"
                    isChecked={formData.availability.weekends}
                    onChange={(e) => 
                      handleAvailabilityChange('weekends', e.target.checked)
                    }
                  >
                    Weekends
                  </Checkbox>
                </Stack>
              </FormControl>

              <FormControl>
                <FormLabel>Preferred Time</FormLabel>
                <RadioGroup
                  value={formData.availability.preferred_time}
                  onChange={(value) => 
                    handleAvailabilityChange('preferred_time', value)
                  }
                >
                  <Stack direction="row">
                    <Radio value="Morning">Morning</Radio>
                    <Radio value="Afternoon">Afternoon</Radio>
                    <Radio value="Evening">Evening</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>

            <Button
              mt={8}
              colorScheme="teal"
              size="lg"
              width="full"
              type="submit"
              isLoading={loading}
              loadingText="Saving"
            >
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default CricketProfileForm; 