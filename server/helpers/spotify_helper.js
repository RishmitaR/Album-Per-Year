const crypto = require('crypto');
const axios = require('axios');


function generateRandomString(length) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function base64encode(buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateCodeChallenge(codeVerifier) {
  const hash = sha256(codeVerifier);
  return base64encode(hash);
}

async function getAlbumsNumber(inputToken){
  accessToken = inputToken
  try {
    const res = await axios.get('https://api.spotify.com/v1/me/albums?limit=1', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const total = res.data.total;
    //console.log('Total saved albums:', total);
    return total;
  } catch (err) {
    console.error('Error fetching saved albums:', err.response?.data || err.message);
    throw err;
  }
}

async function getAlbumsFromArtist(artistName, year, inputToken) {
  const token = inputToken;
  const encodedArtist = encodeURIComponent(`${artistName}`);
  const artistQuery = `https://api.spotify.com/v1/search?q=${encodedArtist}&type=artist&limit=10`;
  const returnArray = [];

  let artistId = null;

  try {
    const artistRes = await axios.get(artistQuery, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const artists = artistRes.data.artists.items;
    if (!artists || artists.length === 0) {
      console.error('No artist candidates found.');
      return [];
    }

    // Try each artist until we find one with albums
    for (const artist of artists) {
      const res = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const albums = res.data.items;

      if (albums && albums.length > 0) {
        artistId = artist.id;

        for (const album of albums) {
          if (album.album_type === 'single') continue;

          const releaseYear = parseInt(album.release_date.split('-')[0]);
          const inYear = releaseYear == year;

          returnArray.push({
            name: album.name,
            artist: album.artists.map(a => a.name).join(', '),
            image: album.images[0]?.url || null,
            releaseDate: album.release_date,
            isInYear: inYear,
          });
        }

        break; // Stop once we find the first artist with albums
      }
    }

    if (!artistId) {
      console.error('No artist with albums found.');
    }

  } catch (err) {
    console.error('Error fetching artist/albums:', err.response?.data || err.message);
  }

  return returnArray;
}


module.exports = {
  generateRandomString,
  generateCodeChallenge,
  getAlbumsNumber,
  getAlbumsFromArtist
};
