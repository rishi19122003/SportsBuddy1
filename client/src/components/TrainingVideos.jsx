import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const TrainingVideos = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    sport: '',
    category: '',
    search: ''
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    sport: '',
    category: ''
  });

  const sportOptions = ['cricket', 'football', 'tennis', 'basketball', 'other'];
  const categoryOptions = ['technique', 'strategy', 'fitness', 'rules', 'equipment', 'other'];

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/training/videos', {
        params: filters
      });
      setVideos(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    try {
      await axios.post('/api/training/videos', newVideo);
      setOpenDialog(false);
      setNewVideo({
        title: '',
        description: '',
        url: '',
        sport: '',
        category: ''
      });
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding video');
    }
  };

  const handleLike = async (videoId) => {
    try {
      const { data } = await axios.post(`/api/training/videos/${videoId}/like`);
      setVideos(videos.map(v => v._id === videoId ? data : v));
    } catch (err) {
      setError(err.response?.data?.message || 'Error liking video');
    }
  };

  const handleComment = async (videoId) => {
    try {
      const { data } = await axios.post(`/api/training/videos/${videoId}/comment`, {
        content: newComment
      });
      setVideos(videos.map(v => v._id === videoId ? data : v));
      setNewComment('');
      setSelectedVideo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding comment');
    }
  };

  const handleShare = async (video) => {
    try {
      const shareData = {
        title: video.title,
        text: `Check out this training video: ${video.title}`,
        url: window.location.origin + `/training/videos/${video._id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        // You might want to show a toast notification here
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Training Videos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Video
        </Button>
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search videos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sport</InputLabel>
              <Select
                value={filters.sport}
                label="Sport"
                onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {sportOptions.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Videos Grid */}
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/300x200"
                alt={video.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {video.description}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                  <Chip label={video.sport} size="small" />
                  <Chip label={video.category} size="small" />
                </Stack>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <IconButton onClick={() => handleLike(video._id)}>
                      {video.likes.some(like => like._id === userInfo._id) ? (
                        <ThumbUp color="primary" />
                      ) : (
                        <ThumbUpOutlined />
                      )}
                    </IconButton>
                    <IconButton onClick={() => setSelectedVideo(video)}>
                      <Comment />
                    </IconButton>
                    <IconButton onClick={() => handleShare(video)}>
                      <Share />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {video.views} views
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Video Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Training Video</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video URL"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sport</InputLabel>
                  <Select
                    value={newVideo.sport}
                    label="Sport"
                    onChange={(e) => setNewVideo({ ...newVideo, sport: e.target.value })}
                  >
                    {sportOptions.map((sport) => (
                      <MenuItem key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newVideo.category}
                    label="Category"
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVideo} variant="contained" color="primary">
            Add Video
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            {selectedVideo?.comments.map((comment) => (
              <Box key={comment._id} mb={2}>
                <Typography variant="subtitle2">{comment.user.name}</Typography>
                <Typography variant="body2">{comment.content}</Typography>
              </Box>
            ))}
            <Box mt={2}>
              <TextField
                fullWidth
                label="Add a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVideo(null)}>Cancel</Button>
          <Button
            onClick={() => handleComment(selectedVideo._id)}
            variant="contained"
            color="primary"
            disabled={!newComment.trim()}
          >
            Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingVideos; 