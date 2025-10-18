Album-Per-Year (not the final name) is a personalized web app that lets users connect their Spotify or Last.fm account, enter their birthday, and then select one of their favorite albums from each year they’ve been alive. At the end, the app generates a Topsters-style album chart.The idea for this project came from a trend in online music communities where many of my friends were sharing charts of their favorite albums by year. I wanted to make my own, but it was tedious to recall every album I loved and remember its release year. That inspired me to build a tool that could automate the process in a fun way. While the core functionality of the application is complete, I decided to expand it into a learning project for machine learning and model deployment. The next major feature is a recommendation engine that predicts which albums a user has likely listened to and loved by generating a feature vector from their Spotify or Last.fm profile data. This vector is then passed to a TensorFlow Recommenders model to suggest albums that can
automatically populate the chart. This approach helps serve albums to users who don’t typically save full albums to their music library.

<p align="left">
  <img src="https://github.com/RishmitaR/Album-Per-Year/blob/main/Screenshot%202025-10-18%20151045.png" alt="Topster Chart Example" width="25%">
  <br>
  <em>Example of the trend</em>
</p>


**Project Status**
This project is currently a WIP
- [x] Core backend and Spotify API integration
- [x] PostgreSQL database populated with user and album data
- [x] Frontend: barebones UI for login, birthday input, and album selection
- [x] Simple chart rendering
- [ ] Integrate Last.fm API
- [ ] TensorFlow Recommenders model trained and functional (IN PROGRESS)
- [ ] Machine learning integration with backend (IN PROGRESS)
- [ ] Deploy live version (IN PROGRESS)


**How The Final Product Will Work**
1. Login & Setup: Users authenticate through Spotify or Last.fm, granting the app permission to access limited profile and listening data.
2. Enter Your Birthday: The app determines the range of years to include — one album for each year you’ve been alive.
3. Choose Your Albums: For each year, the user selects a favorite album fetched from Spotify. The backend retrieves release metadata (artist, title, year) for each selection.
5. Generate the Chart: Once complete, the app creates a Topsters-style album chart, listing each album’s title, artist, release year

**Machine Learning Component**

Training Data:
40,000+ users from the ListenBrainz dataset with artist, genre, and release information from MusicBrainz

Goal:
Recommend albums that fit each user’s listening habits based on limited profile information (e.g., recent plays, top artists).

Prediction Workflow:
1. User logs in with Spotify or Last.fm
2. Backend generates a user feature vector
3. TensorFlow Recommenders model predicts likely-loved albums
4. Recommended albums are displayed visually on the chart

This feature is designed to enhance the experience for users who may not have saved albums but still want an accurate reflection of their musical tastes.

The code for the model is currently being developed in a jupyter-notebook stored at this repository: 

To run current web application code:
**Setup & Installation**
Prerequisites
Node.js (v18 or later)
npm
PostgreSQL

1. Clone the Repository
```
git clone https://github.com/RishmitaR/Album-Per-Year.git
cd album-per-year
```
2. Install Dependencies
```
npm install
```

3. Setup Environment File in the server folder
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```
Obtain Spotify credentials by creating a developer app at the Spotify Developer Dashboard
 
