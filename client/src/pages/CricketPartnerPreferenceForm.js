import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Slider, SliderTrack, SliderFilledTrack, SliderThumb, HStack, Checkbox, Select, VStack, Text, CheckboxGroup, Input, useToast, InputGroup, InputRightElement, List, ListItem } from '@chakra-ui/react';
import axios from 'axios';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';

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
  const [autocomplete, setAutocomplete] = useState(null);
  const toast = useToast();

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
          address: place.formatted_address,
          useProfileLocation: false
        };

        setPrefs(p => ({
          ...p,
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
              
              setPrefs(p => ({
                ...p,
                location: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                  address: address,
                  useProfileLocation: false
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate location data before searching
    if (!prefs.location.useProfileLocation) {
      if (!prefs.location.coordinates || 
          prefs.location.coordinates[0] === 0 || 
          prefs.location.coordinates[1] === 0) {
        toast({
          title: 'Location required',
          description: 'Please select a location from the suggestions or use your profile location',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        return;
      }
    }

    // Log the search preferences for debugging
    console.log('Searching with preferences:', {
      ...prefs,
      location: {
        ...prefs.location,
        coordinates: prefs.location.coordinates
      }
    });

    onSearch(prefs);
  };

  // Update the checkbox handler to properly reset location when switching
  const handleUseProfileLocationChange = (e) => {
    const useProfile = e.target.checked;
    setPrefs(p => ({
      ...p,
      location: {
        ...p.location,
        useProfileLocation: useProfile,
        // Reset coordinates and address if not using profile location
        ...(useProfile ? {} : {
          coordinates: [0, 0],
          address: ''
        })
      }
    }));
    if (!useProfile) {
      setSearchTerm('');
    }
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
            onChange={handleUseProfileLocationChange}
          >
            Use my profile location
          </Checkbox>
          {!prefs.location.useProfileLocation && (
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
              </Autocomplete>
            </LoadScript>
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