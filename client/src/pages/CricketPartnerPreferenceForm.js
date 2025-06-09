import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Slider, SliderTrack, SliderFilledTrack, SliderThumb, HStack, Checkbox, Select, VStack, Text, CheckboxGroup, Input, useToast, InputGroup, InputRightElement, List, ListItem } from '@chakra-ui/react';

const defaultPreferences = {
  minBattingSkill: 1,
  maxBattingSkill: 10,
  minBowlingSkill: 1,
  maxBowlingSkill: 10,
  minFieldingSkill: 1,
  maxFieldingSkill: 10,
  preferredBattingStyles: ['Any'],
  preferredBowlingStyles: ['Any'],
  preferredPositions: ['Any'],
  weekdays: true,
  weekends: true,
  preferredTime: ['Any'],
  maxDistance: 20,
  location: {
    type: 'Point',
    coordinates: [0, 0],
    address: '',
    useProfileLocation: true
  }
};

const CricketPartnerPreferenceForm = ({ onSearch }) => {
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const toast = useToast();

  const searchLocation = async (query) => {
    try {
      // Using MapMyIndia Geocoding API (which is more accurate for Indian addresses)
      const response = await fetch(
        `https://apis.mapmyindia.com/advancedmaps/v1/YOUR_API_KEY/geo_code?addr=${encodeURIComponent(query)}&region=IND`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSuggestions(data.results.map(result => ({
          address: result.formatted_address,
          coordinates: [result.longitude, result.latitude]
        })));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: 'Location search error',
        description: 'Unable to search for locations. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleLocationSelect = (location) => {
    setPrefs(p => ({
      ...p,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        useProfileLocation: false
      }
    }));
    setSearchTerm(location.address);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Using MapMyIndia Reverse Geocoding for more accurate Indian addresses
            const response = await fetch(
              `https://apis.mapmyindia.com/advancedmaps/v1/YOUR_API_KEY/rev_geocode?lat=${latitude}&lng=${longitude}`
            );
            const data = await response.json();
            
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted_address;
              
              setPrefs(p => ({
                ...p,
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                  address,
                  useProfileLocation: false
                }
              }));
              setSearchTerm(address);
              
              toast({
                title: 'Location detected',
                description: `Search location: ${address}`,
                status: 'success',
                duration: 3000,
                isClosable: true
              });
            } else {
              throw new Error('No address found');
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
          toast({
            title: 'Location error',
            description: 'Unable to get your location. Please enable location services.',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true, // Request high accuracy
          timeout: 10000, // Wait up to 10 seconds
          maximumAge: 0 // Always get fresh location
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

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm && !prefs.location.useProfileLocation) {
        searchLocation(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(prefs);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" p={6} borderRadius="lg" boxShadow="md" mb={8}>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Input Player Preferences</Text>
        
        {/* Location Section */}
        <FormControl>
          <FormLabel>Search Location</FormLabel>
          <Checkbox
            mb={2}
            isChecked={prefs.location.useProfileLocation}
            onChange={(e) => {
              setPrefs(p => ({
                ...p,
                location: {
                  ...p.location,
                  useProfileLocation: e.target.checked
                }
              }));
              setShowSuggestions(false);
            }}
          >
            Use my profile location
          </Checkbox>
          {!prefs.location.useProfileLocation && (
            <Box position="relative">
              <InputGroup>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a location in India"
                  isDisabled={prefs.location.useProfileLocation}
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
              {showSuggestions && suggestions.length > 0 && (
                <List
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  boxShadow="md"
                  borderRadius="md"
                  maxH="200px"
                  overflowY="auto"
                  zIndex={1000}
                >
                  {suggestions.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      {suggestion.address}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </FormControl>

        {/* Batting Skill Range */}
        <FormControl>
          <FormLabel>Batting Skill Range</FormLabel>
          <RangeSlider
            min={1}
            max={10}
            step={1}
            value={[prefs.minBattingSkill, prefs.maxBattingSkill]}
            onChange={([min, max]) => setPrefs(p => ({ ...p, minBattingSkill: min, maxBattingSkill: max }))}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between">
            <Text>Min: {prefs.minBattingSkill}</Text>
            <Text>Max: {prefs.maxBattingSkill}</Text>
          </HStack>
        </FormControl>
        {/* Bowling Skill Range */}
        <FormControl>
          <FormLabel>Bowling Skill Range</FormLabel>
          <RangeSlider
            min={1}
            max={10}
            step={1}
            value={[prefs.minBowlingSkill, prefs.maxBowlingSkill]}
            onChange={([min, max]) => setPrefs(p => ({ ...p, minBowlingSkill: min, maxBowlingSkill: max }))}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between">
            <Text>Min: {prefs.minBowlingSkill}</Text>
            <Text>Max: {prefs.maxBowlingSkill}</Text>
          </HStack>
        </FormControl>
        {/* Fielding Skill Range */}
        <FormControl>
          <FormLabel>Fielding Skill Range</FormLabel>
          <RangeSlider
            min={1}
            max={10}
            step={1}
            value={[prefs.minFieldingSkill, prefs.maxFieldingSkill]}
            onChange={([min, max]) => setPrefs(p => ({ ...p, minFieldingSkill: min, maxFieldingSkill: max }))}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between">
            <Text>Min: {prefs.minFieldingSkill}</Text>
            <Text>Max: {prefs.maxFieldingSkill}</Text>
          </HStack>
        </FormControl>
        {/* Preferred Batting Style */}
        <FormControl>
          <FormLabel>Preferred Batting Style</FormLabel>
          <CheckboxGroup
            value={prefs.preferredBattingStyles}
            onChange={vals => setPrefs(p => ({ ...p, preferredBattingStyles: vals.length ? vals : ['Any'] }))}
          >
            <HStack>
              <Checkbox value="Any">Any</Checkbox>
              <Checkbox value="Right-handed">Right-handed</Checkbox>
              <Checkbox value="Left-handed">Left-handed</Checkbox>
            </HStack>
          </CheckboxGroup>
        </FormControl>
        {/* Preferred Bowling Style */}
        <FormControl>
          <FormLabel>Preferred Bowling Style</FormLabel>
          <CheckboxGroup
            value={prefs.preferredBowlingStyles}
            onChange={vals => setPrefs(p => ({ ...p, preferredBowlingStyles: vals.length ? vals : ['Any'] }))}
          >
            <HStack>
              <Checkbox value="Any">Any</Checkbox>
              <Checkbox value="Fast">Fast</Checkbox>
              <Checkbox value="Medium">Medium</Checkbox>
              <Checkbox value="Spin">Spin</Checkbox>
            </HStack>
          </CheckboxGroup>
        </FormControl>
        {/* Preferred Position */}
        <FormControl>
          <FormLabel>Preferred Position</FormLabel>
          <CheckboxGroup
            value={prefs.preferredPositions}
            onChange={vals => setPrefs(p => ({ ...p, preferredPositions: vals.length ? vals : ['Any'] }))}
          >
            <HStack>
              <Checkbox value="Any">Any</Checkbox>
              <Checkbox value="Batsman">Batsman</Checkbox>
              <Checkbox value="Bowler">Bowler</Checkbox>
              <Checkbox value="All-rounder">All-rounder</Checkbox>
              <Checkbox value="Wicket-keeper">Wicket-keeper</Checkbox>
            </HStack>
          </CheckboxGroup>
        </FormControl>
        {/* Availability */}
        <FormControl>
          <FormLabel>Availability</FormLabel>
          <HStack>
            <Checkbox isChecked={prefs.weekdays} onChange={e => setPrefs(p => ({ ...p, weekdays: e.target.checked }))}>Weekdays</Checkbox>
            <Checkbox isChecked={prefs.weekends} onChange={e => setPrefs(p => ({ ...p, weekends: e.target.checked }))}>Weekends</Checkbox>
          </HStack>
        </FormControl>
        {/* Preferred Time */}
        <FormControl>
          <FormLabel>Preferred Time</FormLabel>
          <CheckboxGroup
            value={prefs.preferredTime}
            onChange={vals => setPrefs(p => ({ ...p, preferredTime: vals.length ? vals : ['Any'] }))}
          >
            <HStack>
              <Checkbox value="Any">Any</Checkbox>
              <Checkbox value="Morning">Morning</Checkbox>
              <Checkbox value="Afternoon">Afternoon</Checkbox>
              <Checkbox value="Evening">Evening</Checkbox>
            </HStack>
          </CheckboxGroup>
        </FormControl>
        {/* Max Distance */}
        <FormControl>
          <FormLabel>Maximum Distance (km): {prefs.maxDistance}</FormLabel>
          <Slider
            min={1}
            max={100}
            value={prefs.maxDistance}
            onChange={val => setPrefs(p => ({ ...p, maxDistance: val }))}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text mt={2} textAlign="right">{prefs.maxDistance} km</Text>
        </FormControl>
        <Button colorScheme="teal" type="submit">Find Partners</Button>
      </VStack>
    </Box>
  );
};

export default CricketPartnerPreferenceForm; 