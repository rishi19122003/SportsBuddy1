# SportsBuddy - Cricket Partner Matching App

SportsBuddy is a web application that helps cricket enthusiasts find compatible playing partners in their local area.

## Features

- User authentication (register, login, logout)
- User profile management
- Secure authentication with JWT
- Responsive UI using Chakra UI
- Sports selection for finding partners
- Cricket player profile with skill ratings
- Partner matching using collaborative filtering based on:
  - Skill levels (batting, bowling, fielding)
  - Playing styles and preferences
  - Geographical location
  - Availability (days and times)
- Match percentage calculation between players

## Collaborative Filtering Implementation

The app uses a hybrid collaborative filtering approach to match players:

### Content-Based Filtering

Players are matched based on their skills, preferences, and playing styles:

- **Skill levels** for batting, bowling, and fielding
- **Playing styles** (e.g., batsman, bowler, all-rounder)
- **Availability** (weekdays/weekends, preferred times)
- **Location** (proximity-based matching)

### Collaborative Filtering

The system also considers user interactions to improve recommendations:

- **Explicit feedback**: Ratings given after playing together
- **Implicit feedback**: Friend requests, messaging, profile views

### Algorithms Used

1. **Cosine Similarity**: Measures similarity between user profiles
2. **Complementary Skill Matching**: Matches users with complementary skills
3. **User Interaction Weighting**: Adjusts scores based on interaction history

### Technical Implementation

- User profiles and preferences are converted to feature vectors
- Similarity metrics are calculated between users
- Interactions are tracked and weighted to influence recommendations
- Final matching score is a weighted combination of all factors

## Tech Stack

### Frontend
- React
- React Router for navigation
- Chakra UI for styling
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables:
   - Create or update `.env` file in the `server` directory with your settings
   - Sample `.env` configuration:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sportsbuddy
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   API_URL=http://localhost:5000
   ```
   
   Note: For Gmail, you need to use an app password. See [Google's documentation](https://support.google.com/accounts/answer/185833?hl=en) on how to set up app passwords.

## Running the Application

### Start the Server
```bash
cd server
npm run dev
```

### Start the Client
```bash
cd client
npm start
```

The application will be available at:
- Client: http://localhost:3000
- Server API: http://localhost:5000

## Troubleshooting

### Email Issues
If you're having issues with email sending:
1. Make sure your EMAIL_USER and EMAIL_PASSWORD are correct in the .env file
2. For Gmail, ensure you're using an app password, not your regular account password
3. Check the server logs for detailed error messages

### Database Issues
If MongoDB connection fails:
1. Ensure MongoDB is running locally (if using local MongoDB)
2. Check your connection string in the .env file

## Folder Structure

```
sportsbuddy/
├── client/                # Frontend React app
│   ├── public/            # Static files
│   └── src/               # React source files
│       ├── assets/        # Images, logos, etc.
│       ├── components/    # Reusable components
│       ├── context/       # Context providers
│       ├── hooks/         # Custom hooks
│       └── pages/         # Page components
├── server/                # Backend Node.js/Express server
│   ├── controllers/       # Request controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   └── routes/            # API routes
└── README.md              # Project documentation
```

## Future Features
- Find and connect with other users
- Create and join sports events
- Messaging system between users
- Rating system for partners
- Search and filter by sport type, location, skill level

## License
This project is licensed under the MIT License. 