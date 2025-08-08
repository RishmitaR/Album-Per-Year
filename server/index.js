const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

const { spotify_endpoints } = require( './endpoints/spotify_endpoints.js' );
const { chart_endpoints } = require('./endpoints/chart_endpoints.js');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', 
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, 
        },
}));

app.use(express.json());

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = 'http://localhost:8080/callback';
const frontendRedirectUri = 'http://localhost:3000/EnterDate';

spotify_endpoints(app,clientId,redirectUri,frontendRedirectUri);
chart_endpoints(app); 

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
