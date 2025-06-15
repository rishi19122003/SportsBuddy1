import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Avatar,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Spinner,
  Center,
  Image,
  Collapse,
  AspectRatio,
  IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  FiUsers,
  FiMessageSquare,
  FiVideo,
  FiPlus,
  FiSearch,
  FiShare2,
  FiBookmark,
  FiThumbsUp,
  FiMapPin,
  FiArrowLeft,
  FiImage,
  FiTrash2,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [trainingVideos, setTrainingVideos] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoFilters, setVideoFilters] = useState({
    sport: '',
    category: ''
  });
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef();

  const sportOptions = ['cricket', 'football', 'tennis', 'basketball', 'other'];
  const categoryOptions = ['technique', 'strategy', 'fitness', 'rules', 'equipment', 'other'];

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    sport: 'cricket',
    category: 'fitness'
  });

  const bgColor = useColorModeValue('white', 'gray.700');
  const mainBgColor = useColorModeValue('gray.50', 'gray.900');
  const commentBgColor = useColorModeValue('gray.50', 'gray.700');

  // Form states
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    sport: 'cricket',
    location: ''
  });

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'discussion',
    media: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  // Club Card Component
  const ClubCard = ({ club }) => {
    const [isJoining, setIsJoining] = useState(false);
    const toast = useToast();

    const isMember = club.members.some(memberId => memberId === user._id || memberId._id === user._id);
    const isPending = club.joinRequests?.some(
      request => request.user === user._id && request.status === 'pending'
    );

    const handleJoinClub = async () => {
      try {
        setIsJoining(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        const { data } = await axios.post(
          `/api/community/clubs/${club._id}/join`,
          {},
          config
        );

        // Update the clubs list with the updated club data
        setClubs(prevClubs =>
          prevClubs.map(c =>
            c._id === club._id ? { ...c, members: [...c.members, user._id] } : c
          )
        );

        toast({
          title: club.isPrivate ? 'Join request sent!' : 'Joined club!',
          description: club.isPrivate
            ? `Your request to join ${club.name} has been sent`
            : `You have successfully joined ${club.name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error joining club:', error);
        toast({
          title: 'Error joining club',
          description: error.response?.data?.message || 'Failed to join club',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsJoining(false);
      }
    };

    return (
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        bg={bgColor}
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        transition="all 0.2s"
      >
        <HStack spacing={4} mb={4}>
          <Avatar 
            size="md" 
            name={club.name} 
            src={club.image}
            bg="teal.500"
          />
          <VStack align="start" flex={1}>
            <Heading size="md">{club.name}</Heading>
            <HStack spacing={2}>
              <Text color="gray.600" fontSize="sm">
                {club.members.length} members
              </Text>
              <Text color="gray.600" fontSize="sm">•</Text>
              <Badge colorScheme="teal">
                {club.sport}
              </Badge>
              {club.isPrivate && (
                <Badge colorScheme="purple">Private</Badge>
              )}
            </HStack>
          </VStack>
          {isMember ? (
            <Badge colorScheme="green" p={2} borderRadius="md">
              Member
            </Badge>
          ) : isPending ? (
            <Badge colorScheme="orange" p={2} borderRadius="md">
              Request Pending
            </Badge>
          ) : (
            <Button
              colorScheme="teal"
              size="sm"
              onClick={handleJoinClub}
              isLoading={isJoining}
              loadingText="Joining..."
            >
              Join Club
            </Button>
          )}
        </HStack>
        <Text noOfLines={2} mb={3}>{club.description}</Text>
        <HStack spacing={2} fontSize="sm" color="gray.500">
          <Icon as={FiMapPin} />
          <Text>{club.location}</Text>
        </HStack>
      </Box>
    );
  };

  // Discussion Card Component
  const DiscussionCard = ({ post }) => (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
    >
      <HStack spacing={4} mb={4}>
        <Avatar size="sm" name={post.author.name} src={post.author.image} />
        <VStack align="start" flex={1}>
          <Text fontWeight="bold">{post.author.name}</Text>
          <Text fontSize="sm" color="gray.500">
            {post.createdAt}
          </Text>
        </VStack>
      </HStack>
      <Heading size="md" mb={2}>
        {post.title}
      </Heading>
      <Text noOfLines={3} mb={4}>
        {post.content}
      </Text>
      <HStack spacing={4}>
        <Button leftIcon={<FiThumbsUp />} variant="ghost" size="sm">
          {post.likes} Likes
        </Button>
        <Button leftIcon={<FiMessageSquare />} variant="ghost" size="sm">
          {post.comments} Comments
        </Button>
        <Button leftIcon={<FiShare2 />} variant="ghost" size="sm">
          Share
        </Button>
      </HStack>
    </Box>
  );

  // Function to validate and process video URL
  const processVideoUrl = (url) => {
    if (!url) return '';
    
    // Try to extract YouTube video ID
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(youtubeRegExp);
    
    if (match && match[2].length === 11) {
      // If it's a YouTube URL, return the embed URL with additional parameters
      // Use www.youtube-nocookie.com for better privacy and CORS handling
      return `https://www.youtube-nocookie.com/embed/${match[2]}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=0&rel=0&controls=1`;
    }
    
    // For other URLs, return as is - we'll handle them in the video player
    return url;
  };

  // Function to get thumbnail URL
  const getThumbnailUrl = (url) => {
    // For Cloudinary videos
    if (url.includes('cloudinary.com')) {
      // Replace the video extension with jpg and add /thumbnail transformation
      return url.replace(/\.[^/.]+$/, ".jpg").replace("/video/upload/", "/video/upload/c_thumb,w_300,h_200/");
    }

    // For YouTube videos
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(youtubeRegExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }

    // Return null for default placeholder
    return null;
  };

  // Training Video Card Component
  const VideoCard = ({ video }) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState(null);
    const [thumbnailError, setThumbnailError] = useState(false);
    const videoRef = useRef(null);
    const isOwner = video.author._id === user._id;

    const handleVideoError = (error) => {
      console.error('Video playback error:', error);
      setVideoError('Error playing video. Please try again.');
      setIsVideoLoading(false);
    };

    const handleVideoLoad = () => {
      setIsVideoLoading(false);
      setVideoError(null);
    };

    const handleThumbnailError = () => {
      setThumbnailError(true);
    };

    // Function to handle iframe errors for YouTube videos
    const handleIframeError = () => {
      console.error('YouTube iframe error');
      setVideoError('Error loading YouTube video. Please try again.');
      setIsVideoLoading(false);
    };

    // Function to render video player based on URL type
    const renderVideoPlayer = () => {
      if (video.url.includes('cloudinary.com')) {
        // Cloudinary video
        return (
          <Box position="relative" width="100%" height="100%">
            {isVideoLoading && (
              <Center position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1">
                <Spinner size="xl" />
              </Center>
            )}
            {videoError && (
              <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="blackAlpha.50" zIndex="1">
                <VStack spacing={2}>
                  <Icon as={FiAlertTriangle} w={8} h={8} color="red.500" />
                  <Text color="red.500" textAlign="center">{videoError}</Text>
                  <Button size="sm" onClick={() => {
                    setVideoError(null);
                    setIsVideoLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}>
                    Try Again
                  </Button>
                </VStack>
              </Center>
            )}
            <video
              ref={videoRef}
              controls
              style={{ width: '100%', height: '100%' }}
              src={video.url}
              title={video.title}
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
            >
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      }

      // YouTube video
      const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = video.url.match(youtubeRegExp);
      
      if (match && match[2].length === 11) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${match[2]}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=0&rel=0&controls=1`;
        
        return (
          <Box position="relative" width="100%" height="100%">
            {isVideoLoading && (
              <Center position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1">
                <Spinner size="xl" />
              </Center>
            )}
            {videoError && (
              <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="blackAlpha.50" zIndex="1">
                <VStack spacing={2}>
                  <Icon as={FiAlertTriangle} w={8} h={8} color="red.500" />
                  <Text color="red.500" textAlign="center">{videoError}</Text>
                  <Button size="sm" onClick={() => {
                    setVideoError(null);
                    setIsVideoLoading(true);
                    if (videoRef.current) {
                      videoRef.current.src = embedUrl;
                    }
                  }}>
                    Try Again
                  </Button>
                </VStack>
              </Center>
            )}
            <iframe
              ref={videoRef}
              title={video.title}
              src={embedUrl}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={handleVideoLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
            />
          </Box>
        );
      }

      // Other video types
      return (
        <Box position="relative" width="100%" height="100%">
          {isVideoLoading && (
            <Center position="absolute" top="0" left="0" right="0" bottom="0" zIndex="1">
              <Spinner size="xl" />
            </Center>
          )}
          {videoError && (
            <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="blackAlpha.50" zIndex="1">
              <VStack spacing={2}>
                <Icon as={FiAlertTriangle} w={8} h={8} color="red.500" />
                <Text color="red.500" textAlign="center">{videoError}</Text>
                <Button size="sm" onClick={() => {
                  setVideoError(null);
                  setIsVideoLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}>
                  Try Again
                </Button>
              </VStack>
            </Center>
          )}
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', height: '100%' }}
            src={video.url}
            title={video.title}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    };

    const handleDeleteVideo = async (videoId) => {
      try {
        if (!window.confirm('Are you sure you want to delete this video?')) {
          return;
        }

        setIsDeletingVideo(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        await axios.delete(`/api/training/videos/${videoId}`, config);
        
        // Remove the video from state
        setTrainingVideos(prev => prev.filter(video => video._id !== videoId));
        
        toast({
          title: 'Video deleted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting video:', error);
        toast({
          title: 'Error deleting video',
          description: error.response?.data?.message || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeletingVideo(false);
      }
    };

    return (
      <>
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          bg={bgColor}
          position="relative"
        >
          {isOwner && (
            <IconButton
              icon={<FiTrash2 />}
              position="absolute"
              top={2}
              right={2}
              colorScheme="red"
              variant="ghost"
              size="sm"
              isLoading={isDeletingVideo}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteVideo(video._id);
              }}
              aria-label="Delete video"
            />
          )}
          <Box
            cursor="pointer"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <Box
              height="200px"
              bg="gray.100"
              borderRadius="md"
              mb={4}
              position="relative"
              overflow="hidden"
            >
              {!thumbnailError && getThumbnailUrl(video.url) ? (
                <Image
                  src={getThumbnailUrl(video.url)}
                  alt={video.title}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                  onError={handleThumbnailError}
                />
              ) : (
                <Center h="100%" bg="gray.100">
                  <Icon as={FiVideo} w={12} h={12} color="gray.400" />
                </Center>
              )}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ bg: "blackAlpha.400" }}
                transition="background-color 0.2s"
              >
                <Icon
                  as={FiVideo}
                  w={12}
                  h={12}
                  color="white"
                />
              </Box>
            </Box>
            <Heading size="md" mb={2}>
              {video.title}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={2}>
              By {video.author.name} • {video.views} views
            </Text>
            <Text noOfLines={2}>{video.description}</Text>
            <HStack mt={2} spacing={2}>
              <Badge colorScheme="blue">{video.sport}</Badge>
              <Badge colorScheme="green">{video.category}</Badge>
            </HStack>
          </Box>
        </Box>

        {/* Video Modal */}
        <Modal 
          isOpen={isVideoModalOpen} 
          onClose={() => setIsVideoModalOpen(false)}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent maxW="900px">
            <ModalHeader>{video.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <AspectRatio ratio={16 / 9}>
                {renderVideoPlayer()}
              </AspectRatio>
              <VStack align="start" mt={4} spacing={2}>
                <Text fontWeight="bold">Description:</Text>
                <Text>{video.description}</Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue">{video.sport}</Badge>
                  <Badge colorScheme="green">{video.category}</Badge>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const handleCreateClub = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.post('/api/community/clubs', {
        name: newClub.name,
        description: newClub.description,
        sport: newClub.sport,
        location: newClub.location
      }, config);

      // Add the new club to the clubs list
      setClubs(prevClubs => [data, ...prevClubs]);

      // Reset form and close modal
      setNewClub({
        name: '',
        description: '',
        sport: 'cricket',
        location: ''
      });
      setIsCreateClubModalOpen(false);

      // Show success message
      toast({
        title: 'Club created!',
        description: `${data.name} has been created successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating club:', error);
      toast({
        title: 'Error creating club',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClubClick = async (club) => {
    setSelectedClub(club);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.get(`/api/community/posts?clubId=${club._id}`, config);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching club posts:', error);
      toast({
        title: 'Error fetching posts',
        description: error.response?.data?.message || 'Failed to load club posts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsLoading(true);
      
      if (!selectedClub) {
        toast({
          title: 'Error',
          description: 'No club selected',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const postData = {
        title: newPost.title,
        content: newPost.content,
        type: 'discussion',
        media: newPost.media,
        clubId: selectedClub._id
      };

      console.log('Sending post data:', {
        ...postData,
        mediaLength: postData.media?.length || 0,
        contentLength: postData.content.length
      });

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.post('/api/community/posts', postData, config);
      console.log('Post created successfully:', data);

      // Add new post to the list
      setPosts(prevPosts => [data, ...prevPosts]);

      // Reset form and close modal
      setNewPost({
        title: '',
        content: '',
        type: 'discussion',
        media: ''
      });
      setIsCreatePostModalOpen(false);

      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating post:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
      toast({
        title: 'Error creating post',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setIsUploading(true);
      const file = e.target.files[0];
      
      if (!file) {
        return;
      }

      // Image compression options
      const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1920, // Max width/height
        useWebWorker: true
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setNewPost(prev => ({
          ...prev,
          media: reader.result
        }));
        setIsUploading(false);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error uploading image',
        description: 'Failed to upload image. Please try a smaller image or different format.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsUploading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      setIsLiking(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.post(`/api/community/posts/${postId}/like`, {}, config);
      
      // Update the post in the state with the new data
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? data
            : post
        )
      );

      toast({
        title: 'Success',
        description: 'Post interaction updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update post interaction',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (postId) => {
    try {
      setIsCommenting(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.post(
        `/api/community/posts/${postId}/comment`,
        { content: commentInputs[postId] || '' },
        config
      );

      // Update the post in the state with the new data
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? data
            : post
        )
      );

      // Clear only this post's comment input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      toast({
        title: 'Success',
        description: 'Comment added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleDeletePost = async (postId) => {
    try {
      setIsDeleting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.delete(`/api/community/posts/${postId}`, config);

      // Remove the deleted post from the state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (post) => {
    try {
      setIsSharing(true);
      
      // Create a shareable URL for the post
      const shareUrl = `${window.location.origin}/community/clubs/${selectedClub._id}/posts/${post._id}`;
      const shareTitle = `Check out this post: ${post.title}`;
      const shareText = `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        
        toast({
          title: 'Shared successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Fallback to copying the link
        await navigator.clipboard.writeText(shareUrl);
        
        toast({
          title: 'Link copied to clipboard',
          description: 'You can now share it with others',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      // Only show error if it's not a user cancellation
      if (error.name !== 'AbortError') {
        toast({
          title: 'Error sharing post',
          description: 'Failed to share the post. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: 'File too large',
          description: 'Please select a video file smaller than 100MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      setSelectedVideo(file);
      setNewVideo(prev => ({ ...prev, url: '' })); // Clear URL when file is selected
    }
  };

  const handleAddVideo = async () => {
    try {
      // Validate required fields
      if (!newVideo.title || !newVideo.description || !newVideo.sport || !newVideo.category) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate that either URL or file is provided
      if (!newVideo.url && !selectedVideo) {
        toast({
          title: 'Missing video',
          description: 'Please either provide a video URL or upload a video file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setIsUploadingVideo(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let formData = new FormData();
      formData.append('title', newVideo.title);
      formData.append('description', newVideo.description);
      formData.append('sport', newVideo.sport);
      formData.append('category', newVideo.category);

      if (selectedVideo) {
        formData.append('video', selectedVideo);
      } else {
        const processedUrl = processVideoUrl(newVideo.url);
        if (!processedUrl) {
          toast({
            title: 'Invalid video URL',
            description: 'Please enter a valid video URL',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setIsUploadingVideo(false);
          return;
        }
        formData.append('url', processedUrl);
      }

      const { data } = await axios.post('/api/training/videos', formData, config);
      setTrainingVideos(prev => [data, ...prev]);
      setIsAddVideoModalOpen(false);
      setNewVideo({
        title: '',
        description: '',
        url: '',
        sport: 'cricket',
        category: 'fitness'
      });
      setSelectedVideo(null);

      toast({
        title: 'Video added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error response:', err.response?.data);
      toast({
        title: 'Error adding video',
        description: err.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Fetch clubs when component mounts
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const { data } = await axios.get('/api/community/clubs', config);
        setClubs(data);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        toast({
          title: 'Error fetching clubs',
          description: error.response?.data?.message || 'Failed to load clubs',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchClubs();
  }, [user.token, toast]);

  // Update useEffect for fetching training videos with filters
  useEffect(() => {
    const fetchTrainingVideos = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const { data } = await axios.get('/api/training/videos', {
          ...config,
          params: {
            search: videoSearchQuery,
            sport: videoFilters.sport,
            category: videoFilters.category
          }
        });
        setTrainingVideos(data);
      } catch (error) {
        console.error('Error fetching training videos:', error);
        toast({
          title: 'Error fetching training videos',
          description: error.response?.data?.message || 'Failed to load training videos',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const timeoutId = setTimeout(() => {
      fetchTrainingVideos();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [user.token, toast, videoSearchQuery, videoFilters]);

  // Club Detail View Component
  const ClubDetailView = () => (
    <Box>
      <HStack mb={6}>
        <Button leftIcon={<FiArrowLeft />} onClick={() => setSelectedClub(null)}>
          Back to Clubs
        </Button>
        <Heading size="lg" flex={1}>{selectedClub.name}</Heading>
        <Button
          colorScheme="teal"
          leftIcon={<FiPlus />}
          onClick={() => setIsCreatePostModalOpen(true)}
        >
          Create Post
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box
              key={post._id}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              bg={bgColor}
            >
              <HStack spacing={4} mb={4}>
                <Avatar
                  size="sm"
                  name={post.author.name}
                  src={post.author.profilePicture}
                />
                <VStack align="start" flex={1}>
                  <Text fontWeight="bold">{post.author.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </VStack>
                {post.author._id === user._id && (
                  <Button
                    leftIcon={<FiTrash2 />}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    isLoading={isDeleting}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        handleDeletePost(post._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </HStack>
              <Heading size="md" mb={2}>
                {post.title}
              </Heading>
              <Text mb={4}>{post.content}</Text>
              {post.media && (
                <Box mb={4}>
                  <img src={post.media} alt="Post media" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                </Box>
              )}
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiThumbsUp />}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post._id)}
                  isLoading={isLiking}
                  color={post.likes?.includes(user._id) ? "teal.500" : undefined}
                >
                  {post.likes?.length || 0} Likes
                </Button>
                <Button
                  leftIcon={<FiMessageSquare />}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post._id)}
                >
                  {post.comments?.length || 0} Comments
                </Button>
                <Button
                  leftIcon={<FiShare2 />}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(post)}
                  isLoading={isSharing}
                >
                  Share
                </Button>
              </HStack>

              <Collapse in={showComments[post._id]} animateOpacity>
                <VStack mt={4} spacing={4} align="stretch">
                  <Box maxH="300px" overflowY="auto">
                    {post.comments?.map((comment) => (
                      <Box
                        key={comment._id}
                        p={3}
                        bg={commentBgColor}
                        borderRadius="md"
                        mb={2}
                      >
                        <HStack spacing={3} mb={2}>
                          <Avatar
                            size="xs"
                            name={comment.user.name}
                            src={comment.user.profilePicture}
                          />
                          <Text fontWeight="bold" fontSize="sm">
                            {comment.user.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <Text fontSize="sm">{comment.content}</Text>
                      </Box>
                    ))}
                  </Box>
                  <Box position="sticky" bottom={0} bg={bgColor} pt={2}>
                    <FormControl>
                      <InputGroup>
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [post._id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && (commentInputs[post._id] || '').trim()) {
                              e.preventDefault();
                              handleComment(post._id);
                            }
                          }}
                        />
                        <Button
                          ml={2}
                          colorScheme="teal"
                          isLoading={isCommenting}
                          onClick={() => handleComment(post._id)}
                          isDisabled={!(commentInputs[post._id] || '').trim()}
                        >
                          Comment
                        </Button>
                      </InputGroup>
                    </FormControl>
                  </Box>
                </VStack>
              </Collapse>
            </Box>
          ))
        ) : (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No posts yet. Be the first to post!</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg={mainBgColor}>
      <Container maxW="container.xl" py={10}>
        {selectedClub ? (
          <Box>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              mb={6}
              onClick={() => setSelectedClub(null)}
            >
              Back to Clubs
            </Button>
            <ClubDetailView />
          </Box>
        ) : (
          <>
            <HStack justify="space-between" mb={8}>
              <Heading>Sports Community</Heading>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="teal"
                onClick={() => setIsCreateClubModalOpen(true)}
              >
                Create Club
              </Button>
            </HStack>

            <Tabs onChange={setActiveTab} colorScheme="teal">
              <TabList mb={8}>
                <Tab>Clubs & Teams</Tab>
                <Tab>Discussion Forum</Tab>
                <Tab>Training Videos</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search clubs..." />
                    </InputGroup>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {clubs.map((club) => (
                        <Box
                          key={club._id}
                          onClick={() => handleClubClick(club)}
                          cursor="pointer"
                        >
                          <ClubCard club={club} />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Discussion Forum Panel */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search discussions..." />
                    </InputGroup>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {posts.map((post) => (
                        <DiscussionCard key={post.id} post={post} />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Training Videos Panel */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={4} width="100%">
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <InputGroup maxW="60%">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search training videos..."
                            value={videoSearchQuery}
                            onChange={(e) => setVideoSearchQuery(e.target.value)}
                          />
                        </InputGroup>
                        <Button
                          colorScheme="teal"
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() => setIsAddVideoModalOpen(true)}
                        >
                          Add Video
                        </Button>
                      </Box>
                      <HStack spacing={4} width="100%">
                        <FormControl>
                          <Select
                            placeholder="Filter by sport"
                            value={videoFilters.sport}
                            onChange={(e) => setVideoFilters(prev => ({ ...prev, sport: e.target.value }))}
                          >
                            <option value="">All Sports</option>
                            {sportOptions.map((sport) => (
                              <option key={sport} value={sport}>
                                {sport.charAt(0).toUpperCase() + sport.slice(1)}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <Select
                            placeholder="Filter by category"
                            value={videoFilters.category}
                            onChange={(e) => setVideoFilters(prev => ({ ...prev, category: e.target.value }))}
                          >
                            <option value="">All Categories</option>
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </HStack>
                    </VStack>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {trainingVideos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}

        {/* Create Club Modal */}
        <Modal
          isOpen={isCreateClubModalOpen}
          onClose={() => setIsCreateClubModalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Club</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Club Name</FormLabel>
                  <Input
                    value={newClub.name}
                    onChange={(e) =>
                      setNewClub({ ...newClub, name: e.target.value })
                    }
                    placeholder="Enter club name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newClub.description}
                    onChange={(e) =>
                      setNewClub({ ...newClub, description: e.target.value })
                    }
                    placeholder="Describe your club"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Sport</FormLabel>
                  <Select
                    value={newClub.sport}
                    onChange={(e) =>
                      setNewClub({ ...newClub, sport: e.target.value })
                    }
                  >
                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={newClub.location}
                    onChange={(e) =>
                      setNewClub({ ...newClub, location: e.target.value })
                    }
                    placeholder="Enter club location"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={handleCreateClub}
                isLoading={isLoading}
              >
                Create Club
              </Button>
              <Button variant="ghost" onClick={() => setIsCreateClubModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create Post Modal */}
        <Modal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    placeholder="Enter post title"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Content</FormLabel>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    placeholder="Write your post content..."
                    minH="200px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    display="none"
                  />
                  <Button
                    onClick={() => fileInputRef.current.click()}
                    leftIcon={<FiImage />}
                    isLoading={isUploading}
                    w="full"
                  >
                    Upload Image
                  </Button>
                  {newPost.media && (
                    <Box mt={2}>
                      <Image
                        src={newPost.media}
                        alt="Preview"
                        maxH="200px"
                        borderRadius="md"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setNewPost({ ...newPost, media: '' })}
                        mt={2}
                      >
                        Remove Image
                      </Button>
                    </Box>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={handleCreatePost}
                isLoading={isLoading}
              >
                Create Post
              </Button>
              <Button variant="ghost" onClick={() => setIsCreatePostModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Video Modal */}
        <Modal isOpen={isAddVideoModalOpen} onClose={() => setIsAddVideoModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Training Video</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Enter video title"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    placeholder="Enter video description"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Video URL</FormLabel>
                  <Input
                    value={newVideo.url}
                    onChange={(e) => {
                      setNewVideo({ ...newVideo, url: e.target.value });
                      setSelectedVideo(null); // Clear selected file when URL is entered
                    }}
                    placeholder="Enter video URL"
                    disabled={selectedVideo !== null}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Or
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Video</FormLabel>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    ref={videoInputRef}
                    display="none"
                  />
                  <Button
                    onClick={() => videoInputRef.current.click()}
                    leftIcon={<FiVideo />}
                    w="full"
                    disabled={newVideo.url !== ''}
                  >
                    {selectedVideo ? selectedVideo.name : 'Choose Video File'}
                  </Button>
                  {selectedVideo && (
                    <HStack mt={2} justify="space-between">
                      <Text fontSize="sm" noOfLines={1}>
                        {selectedVideo.name}
                      </Text>
                      <IconButton
                        icon={<FiX />}
                        size="sm"
                        onClick={() => setSelectedVideo(null)}
                        aria-label="Remove selected video"
                      />
                    </HStack>
                  )}
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Maximum file size: 100MB
                  </Text>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Sport</FormLabel>
                  <Select
                    value={newVideo.sport}
                    onChange={(e) => setNewVideo({ ...newVideo, sport: e.target.value })}
                  >
                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsAddVideoModalOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleAddVideo}
                isLoading={isUploadingVideo}
              >
                Add Video
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default Community; 