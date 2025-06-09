import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const SportsBuddyLogo = ({ size = 'md', ...rest }) => {
  const sizes = {
    sm: {
      height: '30px',
      fontSize: '16px',
    },
    md: {
      height: '40px',
      fontSize: '20px',
    },
    lg: {
      height: '60px',
      fontSize: '28px',
    },
  };

  return (
    <Box 
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      <Text
        fontWeight="bold"
        fontSize={sizes[size].fontSize}
        letterSpacing="tighter"
        color="teal.500"
      >
        Sports<Text as="span" color="orange.500">Buddy</Text>
      </Text>
    </Box>
  );
};

export default SportsBuddyLogo; 