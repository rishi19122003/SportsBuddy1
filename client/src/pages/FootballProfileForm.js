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

const FootballProfileForm = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    attackingSkill: 5,
    defendingSkill: 5,
    passSkill: 5,
    preferredPosition: '',
    preferredFoot: '',
    playingStyle: '',
    location: {
      type: 'Point',
      coordinates: [0, 0], // [longitude, latitude]
      address: ''
    },
    availability: {
      weekdays: false,
      weekends: true,
      preferred_time: 'Evening'
    },
    partnerPreferences: {
      minAttackingSkill: 1,
      maxAttackingSkill: 10,
      minDefendingSkill: 1,
      maxDefendingSkill: 10,
      preferredPositions: ['Any'],
      preferredPlayingStyles: ['Any'],
      preferredAvailability: {
        weekdays: true,
        weekends: true,
        preferred_time: ['Any']
      },
      complementarySkills: true,
      maxDistance: 20
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
        
        const { data } = await axios.get('/api/football/profile', config);
        setExistingProfile(data);
        setFormData({
          attackingSkill: data.attackingSkill,
          defendingSkill: data.defendingSkill,
          passSkill: data.passSkill,
          preferredPosition: data.preferredPosition,
          preferredFoot: data.preferredFoot,
          playingStyle: data.playingStyle,
          location: data.location,
          availability: data.availability,
          partnerPreferences: data.partnerPreferences || {
            minAttackingSkill: 1,
            maxAttackingSkill: 10,
            minDefendingSkill: 1,
            maxDefendingSkill: 10,
            preferredPositions: ['Any'],
            preferredPlayingStyles: ['Any'],
            preferredAvailability: {
              weekdays: true,
              weekends: true,
              preferred_time: ['Any']
            },
            complementarySkills: true,
            maxDistance: 20
          }
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
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const method = existingProfile ? 'put' : 'post';
      const endpoint = '/api/football/profile';
      
      const { data } = await axios[method](endpoint, formData, config);
      
      toast({
        title: 'Profile updated',
        description: 'Your football profile has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Could not update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Form field handlers
  const handleSkillChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleStyleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handlePartnerPreferenceChange = (field, value) => {
    setFormData({
      ...formData,
      partnerPreferences: {
        ...formData.partnerPreferences,
        [field]: value
      }
    });
  };

  const handlePartnerAvailabilityChange = (field, value) => {
    setFormData({
      ...formData,
      partnerPreferences: {
        ...formData.partnerPreferences,
        preferredAvailability: {
          ...formData.partnerPreferences.preferredAvailability,
          [field]: value
        }
      }
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Football Profile
        </Heading>
        <Text textAlign="center" color="gray.600">
          Complete your football profile to find the perfect playing partners
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={10} align="stretch">
            {/* Player Skills Section */}
            <Box>
              <Heading as="h2" size="lg" mb={6}>
                Your Football Skills
              </Heading>
              
              {/* Attacking Skill */}
              <FormControl mb={8}>
                <FormLabel>Attacking Skill</FormLabel>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={formData.attackingSkill}
                  onChange={(val) => handleSkillChange('attackingSkill', val)}
                  colorScheme="blue"
                >
                  <SliderMark value={1} mt={2} ml={-2} fontSize="sm">
                    Beginner
                  </SliderMark>
                  <SliderMark value={5} mt={2} ml={-2} fontSize="sm">
                    Intermediate
                  </SliderMark>
                  <SliderMark value={10} mt={2} ml={-2} fontSize="sm">
                    Advanced
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500">{formData.attackingSkill}</Box>
                  </SliderThumb>
                </Slider>
              </FormControl>
              
              {/* Defending Skill */}
              <FormControl mb={8}>
                <FormLabel>Defending Skill</FormLabel>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={formData.defendingSkill}
                  onChange={(val) => handleSkillChange('defendingSkill', val)}
                  colorScheme="blue"
                >
                  <SliderMark value={1} mt={2} ml={-2} fontSize="sm">
                    Beginner
                  </SliderMark>
                  <SliderMark value={5} mt={2} ml={-2} fontSize="sm">
                    Intermediate
                  </SliderMark>
                  <SliderMark value={10} mt={2} ml={-2} fontSize="sm">
                    Advanced
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500">{formData.defendingSkill}</Box>
                  </SliderThumb>
                </Slider>
              </FormControl>
              
              {/* Passing Skill */}
              <FormControl mb={8}>
                <FormLabel>Passing Skill</FormLabel>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={formData.passSkill}
                  onChange={(val) => handleSkillChange('passSkill', val)}
                  colorScheme="blue"
                >
                  <SliderMark value={1} mt={2} ml={-2} fontSize="sm">
                    Beginner
                  </SliderMark>
                  <SliderMark value={5} mt={2} ml={-2} fontSize="sm">
                    Intermediate
                  </SliderMark>
                  <SliderMark value={10} mt={2} ml={-2} fontSize="sm">
                    Advanced
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500">{formData.passSkill}</Box>
                  </SliderThumb>
                </Slider>
              </FormControl>
              
              {/* Preferred Position */}
              <FormControl mb={4}>
                <FormLabel>Preferred Position</FormLabel>
                <Select 
                  name="preferredPosition" 
                  value={formData.preferredPosition}
                  onChange={handleStyleChange}
                  placeholder="Select your preferred position"
                >
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                  <option value="Striker">Striker</option>
                  <option value="Winger">Winger</option>
                  <option value="Any">Any position</option>
                </Select>
              </FormControl>
              
              {/* Preferred Foot */}
              <FormControl mb={4}>
                <FormLabel>Preferred Foot</FormLabel>
                <Select 
                  name="preferredFoot" 
                  value={formData.preferredFoot}
                  onChange={handleStyleChange}
                  placeholder="Select your preferred foot"
                >
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                  <option value="Both">Both/Equal</option>
                </Select>
              </FormControl>
              
              {/* Playing Style */}
              <FormControl mb={4}>
                <FormLabel>Playing Style</FormLabel>
                <Select 
                  name="playingStyle" 
                  value={formData.playingStyle}
                  onChange={handleStyleChange}
                  placeholder="Select your playing style"
                >
                  <option value="Possession">Possession based</option>
                  <option value="Counter-attacking">Counter-attacking</option>
                  <option value="High-pressing">High-pressing</option>
                  <option value="Tiki-taka">Tiki-taka</option>
                  <option value="Defensive">Defensive</option>
                  <option value="Long-ball">Long-ball</option>
                  <option value="Wing-play">Wing-play</option>
                </Select>
              </FormControl>
            </Box>

            {/* Location Section */}
            <Box>
              <Heading as="h2" size="lg" mb={6}>
                Your Location
              </Heading>
              
              <HStack spacing={4} mb={4}>
                <FormControl flex={1}>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={formData.location.address}
                    onChange={handleAddressChange}
                    placeholder="Enter your address or use current location"
                  />
                </FormControl>
                <Button
                  mt={8}
                  colorScheme="blue"
                  onClick={getCurrentLocation}
                  isLoading={loadingLocation}
                  loadingText="Detecting..."
                >
                  Use Current Location
                </Button>
              </HStack>
              <FormControl>
                <FormHelperText>
                  Your location helps us find partners in your area
                </FormHelperText>
              </FormControl>
            </Box>

            {/* Availability Section */}
            <Box>
              <Heading as="h2" size="lg" mb={6}>
                Your Availability
              </Heading>
              
              <Stack direction={['column', 'row']} spacing={6} mb={4}>
                <FormControl>
                  <FormLabel>Weekdays</FormLabel>
                  <Checkbox
                    isChecked={formData.availability.weekdays}
                    onChange={(e) =>
                      handleAvailabilityChange('weekdays', e.target.checked)
                    }
                  >
                    Available on weekdays
                  </Checkbox>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Weekends</FormLabel>
                  <Checkbox
                    isChecked={formData.availability.weekends}
                    onChange={(e) =>
                      handleAvailabilityChange('weekends', e.target.checked)
                    }
                  >
                    Available on weekends
                  </Checkbox>
                </FormControl>
              </Stack>
              
              <FormControl mb={4}>
                <FormLabel>Preferred Time</FormLabel>
                <RadioGroup
                  value={formData.availability.preferred_time}
                  onChange={(value) =>
                    handleAvailabilityChange('preferred_time', value)
                  }
                >
                  <Stack direction={['column', 'row']} spacing={6}>
                    <Radio value="Morning">Morning</Radio>
                    <Radio value="Afternoon">Afternoon</Radio>
                    <Radio value="Evening">Evening</Radio>
                    <Radio value="Any">Any time</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Partner Preferences Section */}
            <Box>
              <Heading as="h2" size="lg" mb={6}>
                Partner Preferences
              </Heading>
              
              <FormControl mb={6}>
                <FormLabel>Distance</FormLabel>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={formData.partnerPreferences.maxDistance}
                  onChange={(val) =>
                    handlePartnerPreferenceChange('maxDistance', val)
                  }
                  colorScheme="blue"
                >
                  <SliderMark value={1} mt={2} ml={-2} fontSize="sm">
                    1km
                  </SliderMark>
                  <SliderMark value={25} mt={2} ml={-2} fontSize="sm">
                    25km
                  </SliderMark>
                  <SliderMark value={50} mt={2} ml={-2} fontSize="sm">
                    50km
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500">{formData.partnerPreferences.maxDistance}km</Box>
                  </SliderThumb>
                </Slider>
                <FormHelperText>
                  Maximum distance to potential partners
                </FormHelperText>
              </FormControl>
              
              <FormControl mb={6}>
                <FormLabel>Complementary Skills</FormLabel>
                <Checkbox
                  isChecked={formData.partnerPreferences.complementarySkills}
                  onChange={(e) =>
                    handlePartnerPreferenceChange(
                      'complementarySkills',
                      e.target.checked
                    )
                  }
                >
                  Match me with players whose skills complement mine
                </Checkbox>
                <FormHelperText>
                  When enabled, we'll try to match you with players whose skills complement yours
                </FormHelperText>
              </FormControl>
              
              {/* Availability Preferences */}
              <FormControl mb={6}>
                <FormLabel>Availability Preferences</FormLabel>
                <Stack direction={['column', 'row']} spacing={6} mb={4}>
                  <Checkbox
                    isChecked={formData.partnerPreferences.preferredAvailability.weekdays}
                    onChange={(e) =>
                      handlePartnerAvailabilityChange('weekdays', e.target.checked)
                    }
                  >
                    Weekdays
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.partnerPreferences.preferredAvailability.weekends}
                    onChange={(e) =>
                      handlePartnerAvailabilityChange('weekends', e.target.checked)
                    }
                  >
                    Weekends
                  </Checkbox>
                </Stack>
                <FormHelperText>
                  Select when you prefer your partners to be available
                </FormHelperText>
              </FormControl>
            </Box>

            <Divider />

            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={loading}
              loadingText="Submitting"
            >
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default FootballProfileForm; 