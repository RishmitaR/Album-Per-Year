
const dotenv = require('dotenv');
const axios = require('axios');
const { generateRandomString, generateCodeChallenge, getAlbumsNumber, getAlbumsFromArtist} = require('../helpers/spotify_helper.js');
dotenv.config();

function spotify_endpoints(app, clientId, redirectUri, frontendRedirectUri) {
  // Login endpoint
  app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', 'user-read-private user-read-email user-top-read user-read-recently-played user-library-read playlist-read-private playlist-read-collaborative user-follow-read');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', codeChallenge);

    res.redirect(authUrl.toString());
  });

  // Callback endpoint
  app.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.session.state;
    const codeVerifier = req.session.codeVerifier;

    if (!code || state !== storedState || !codeVerifier) {
      return res.status(400).send('Invalid or missing state/code_verifier');
    }

    const payload = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    try {
      const tokenRes = await axios.post(
        'https://accounts.spotify.com/api/token',
        payload.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const tokenData = tokenRes.data;

      if (tokenData.access_token) {
        res.cookie('spotify_token', tokenData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600 * 1000,
        });
        req.session.accessToken = tokenData.access_token;
        console.log( req.session.accessToken)
        res.redirect(frontendRedirectUri);
      } else {
        console.error('Error:', tokenData);
        res.status(500).send('Failed to get access token');
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).send('Token exchange failed');
    }
  });

  // Top Artists endpoint
  app.get('/top-artists', async (req, res) => {
    const token = req.session.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/artists?time_range=medium_term', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      res.json(response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(err.response?.status || 500).json({ error: 'Failed to fetch top artists' });
    }
  });

  // Album Per Year
  app.get('/albums-by-year', async (req, res) => {

    const token = req.session.accessToken;
    const birthYear = parseInt(req.query.birthYear); 
    //console.log(token)
    //console.log(`[${req.method}] ${req.url}`);

    if (!token) return res.status(401).json({ error: 'No token in session' });
    if (!birthYear) return res.status(400).json({ error: 'No birth year provided' });

    if (!token || !birthYear) {
      return res.status(400).json({ error: 'Missing access token or birth year' });
    }

    try {
      const albumMap = new Map();
      let offset = 0;
      chunkSize = 20;
      const currentYear = new Date().getFullYear();

      const albumNum = await getAlbumsNumber(token)
      //console.log(albumNum)

      while (offset < albumNum) {
        const resChunk = await axios.get(`https://api.spotify.com/v1/me/albums?limit=${chunkSize}&offset=${offset}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        for (const item of resChunk.data.items) {
          const album = item.album;
          const releaseYear = parseInt(album.release_date.split('-')[0]);

          console.log(album.name)
          console.log(releaseYear)

          if (releaseYear >= birthYear && releaseYear <= currentYear) {
            if(album.album_type == 'single'){continue}
            const metadata = {
              name: album.name,
              artist: album.artists.map(a => a.name).join(', '),
              image: album.images[0]?.url || null,
              releaseDate: album.release_date,
            };

            if (!albumMap.has(releaseYear)) {
              albumMap.set(releaseYear, [metadata]);
            } else {
              albumMap.get(releaseYear).push(metadata);
            }
          }
        }
        if(albumNum - offset < chunkSize){chunkSize = albumNum - offset}
        offset += chunkSize;
    }

    // Convert Map to plain object for JSON response
    const resultObj = Object.fromEntries(albumMap);
    res.json(resultObj);
    } catch (err) {
      console.error('Error fetching albums by year:', err.response?.data || err.message);
      res.status(500).json({ error: 'Failed to fetch albums' });
    }
  });

  //Search
  app.post('/spotify-search', async (req, res) => {
    //console.log('here')
    const token = req.session.accessToken;
    const artist = req.body.artist;
    const album = req.body.album;
    const year = parseInt(req.body.year);

    // console.log(token)
    // console.log(artist)
    // console.log(album)
    // console.log(year)
    
    let query = '';
    let queryArray = []
    let albumArray = []
    let response = ''

    if (album && !artist) {
      const encodedAlbum = encodeURIComponent(`album:${album}`);
      query = `https://api.spotify.com/v1/search?q=${encodedAlbum}&type=album&limit=20`;
      try {
        response = await axios.get(query, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
         });
         queryArray = response.data.albums.items
        }catch (err) {
          console.error('Spotify search error:', err.response?.data || err.message);
          res.status(500).json({ error: 'Failed to search' });
      }
    } else if (!album && artist) {
      albumArray = await getAlbumsFromArtist(artist,year,token)
    } else if (album && artist) {
      const combinedQuery = encodeURIComponent(`${album} by ${artist} `);
      query = `https://api.spotify.com/v1/search?q=${combinedQuery}&type=album%2Cartist&limit=20`;
      try {
        response = await axios.get(query, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
         });
         queryArray = response.data.albums.items
        }catch (err) {
          console.error('Spotify search error:', err.response?.data || err.message);
          res.status(500).json({ error: 'Failed to search' });
      }
    } else {
      return res.status(400).json({ error: 'Missing artist and album input' });
    }

    if(queryArray.length != 0){
      for (const item of queryArray) {
        console.log(year)
        const albumData = item
        const releaseYear = parseInt(albumData.release_date?.split('-')[0]);
        console.log(releaseYear)
        const inYear = releaseYear === parseInt(year);

        const metadata = {
          name: albumData.name,
          artist: albumData.artists?.map(a => a.name).join(', ') || 'Unknown',
          image: albumData.images?.[0]?.url || null,
          releaseDate: albumData.release_date || 'Unknown',
          isInYear: inYear
        };
        albumArray.push(metadata);
      }
    }
    //console.log(albumArray)
    res.json(albumArray);
  });  
}

module.exports = { spotify_endpoints };
