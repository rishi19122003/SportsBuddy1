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
  InputGroup,
  InputRightElement,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';

const CricketProfileForm = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      coordinates: [0, 0],
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
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);

  // Location search function using Google Places API
  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const location = {
          type: 'Point',
          coordinates: [
            place.geometry.location.lng(),
            place.geometry.location.lat()
          ],
          address: place.formatted_address
        };

        setFormData(prev => ({
          ...prev,
          location
        }));
        setSearchTerm(place.formatted_address);

        toast({
          title: 'Location selected',
          description: `Selected location: ${place.formatted_address}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    }
  };

  // Get current location using Google's Geocoding API
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Use Google's Geocoding API for reverse geocoding
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?` +
              `latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            );
            
            if (response.data.results && response.data.results.length > 0) {
              const result = response.data.results[0];
              const address = result.formatted_address;
              
              setFormData(prev => ({
                ...prev,
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                  address: address
                }
              }));
              setSearchTerm(address);
              
              toast({
                title: 'Location detected',
                description: `Location: ${address}`,
                status: 'success',
                duration: 3000,
                isClosable: true
              });
            }
          } catch (error) {
            console.error('Error getting location address:', error);
            toast({
              title: 'Location error',
              description: 'Could not get your address. Please enter it manually.',
              status: 'error',
              duration: 3000,
              isClosable: true
            });
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location services in your browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Please try again or enter location manually.';
          }
          
          toast({
            title: 'Location error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true
          });
          setLoadingLocation(false);
        },
        geoOptions
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
    
    // Validate location
    if (!formData.location.coordinates || 
        formData.location.coordinates[0] === 0 || 
        formData.location.coordinates[1] === 0) {
      toast({
        title: 'Location required',
        description: 'Please select a location from the suggestions or use detect location',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
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
            Cricket Profile
          </Heading>
          <Text fontSize="lg" textAlign="center" color="gray.600">
            Complete your cricket profile. This information will be used to find suitable playing partners.
          </Text>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            rounded="lg"
            shadow="md"
            p={8}
          >
            {/* Location Section */}
            <VStack spacing={6} align="stretch" mb={8}>
              <Heading as="h2" size="md">
                Location
              </Heading>

              <FormControl isRequired>
                <FormLabel>Your Location</FormLabel>
                <LoadScript
                  googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                  libraries={['places']}
                >
                  <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    restrictions={{ country: 'in' }}
                  >
                  <InputGroup>
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for your location in India"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={getCurrentLocation}
                        isLoading={loadingLocation}
                      >
                        Detect
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  </Autocomplete>
                </LoadScript>
                <FormHelperText>
                  Enter your location to find partners in your area
                </FormHelperText>
              </FormControl>
            </VStack>

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