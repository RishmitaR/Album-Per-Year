  import React, { useState, useEffect } from 'react';
  import { Drawer, Box, Typography, IconButton, Dialog, Button, Stack, TextField, Checkbox, FormControlLabel, Divider, Grid, Card, CardContent, CardMedia } from '@mui/material';
  import { useNavigate } from "react-router-dom";
  import axios from 'axios';
  import '../styles/style.css'; // Import the CSS file


  function AlbumPage() {
    const navigate = useNavigate();
    const storedAlbumsRaw = localStorage.getItem('albums');
    const storedBirthYear = localStorage.getItem('birthYear');

    const [searchMessage, setSearchMessage] = useState('');
    const [selectedAlbum, setSelectedAlbum] = useState('')
    const [albumStack, setAlbumStack] = useState([]); 
    const [searchArtist, setSearchArtist] = useState('');
    const [searchAlbum, setSearchAlbum] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [chartButton, setChartButton] = useState(false); 

    let albumsByYear = {};
    try {
      albumsByYear = storedAlbumsRaw ? JSON.parse(storedAlbumsRaw) : {};
    } catch (err) {
      console.error("Failed to parse albums:", err);
    }

    const availableYears = Object.keys(albumsByYear)
      .map(year => parseInt(year))
      .sort((a, b) => a - b);

    //const initialYear = parseInt(storedBirthYear);
    const storedIndex = parseInt(localStorage.getItem('currentYearIndex'));
    const birthIndex = availableYears.indexOf(parseInt(storedBirthYear));
    const [currentYearIndex, setCurrentYearIndex] = useState(
    !isNaN(storedIndex) && storedIndex >= 0 && storedIndex < availableYears.length
      ? storedIndex
      : birthIndex >= 0
        ? birthIndex
        : 0
    );
    const currentYear = availableYears[currentYearIndex];
    const albums = albumsByYear[currentYear] || [];

    useEffect(() => {
      const fetchAlbumStack = async () => {
        try {
          const res = await axios.get('/get-album-stack', {
            params: { year: currentYear },
            withCredentials: true,
          });
          setSelectedAlbum(res.data);
        } catch (err) {
          console.error('Error fetching album stack:', err);
        }
      };
      fetchAlbumStack();
    }, [currentYear]);

    useEffect(() =>{
      if(currentYearIndex >= availableYears.length - 1 ){
        setChartButton(true); 
      }
      else{
        setChartButton(false); 
      }
    },)

    const handleSearch = async () => {
      try {
        const res = await axios.post('/spotify-search', {
          artist: searchArtist,
          album: searchAlbum,
          year: currentYear,
          }, { withCredentials: true });
        setSearchResults(res.data || []);
        if (res.data.length === 0) {
          setSearchMessage('No albums found.');
      } else {
          setSearchMessage('');
      }
      } catch (error) {
        console.error('Search error:', error);
        if (error.response && error.response.status === 404) {
          setSearchMessage('Artist not found.');
        } else {
          setSearchMessage('Search failed. Please try again.');
        }
        setSearchResults([]);
        console.error('Search error:', error);
      }
    };
    
    const goPrev = () => {
      if (currentYearIndex > 0) {
        const newIndex = currentYearIndex - 1;
        setCurrentYearIndex(newIndex);
        localStorage.setItem('currentYearIndex', newIndex.toString());
        setSearchResults([]);
      }
    };

    const goNext = () => {
      if (currentYearIndex < availableYears.length - 1) {
        const newIndex = currentYearIndex + 1;
        setCurrentYearIndex(newIndex);
        localStorage.setItem('currentYearIndex', newIndex.toString());
        setSearchResults([]);
      }
    };

    const goChart = () => {
      // make checks to make sure chart generation is valid
      // generate chart data + drawing
      
      navigate('/Chart');
    }

    const handleAlbumClick = async (album) => {
      try {
        console.log('click!')
        const res = await axios.post('/update-album-stack', {
          artist: album.artist,
          album_name: album.name,
          year: currentYear,
          image: album.image,
        }, { withCredentials: true });
        setAlbumStack(res.data); // update local state with returned stack
        console.log(albumStack)
        setSelectedAlbum(album);
      } catch (err) {
        console.error('Failed to update album stack:', err);
      }
    };

  //console.log(selectedAlbum)
  //console.log(currentYear)

  
  return (
    <Grid container spacing={2} minHeight="100vh">
      {/* Left Side – Search */}
      <Grid item size={6} sx={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Search
        </Typography>
        <Box display="flex" flexDirection="row" gap={2} marginBottom={2}>
          <TextField
            label="Artist"
            value={searchArtist}
            onChange={(e) => setSearchArtist(e.target.value)}
          />
          <TextField
            label="Album"
            value={searchAlbum}
            onChange={(e) => setSearchAlbum(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
        {searchMessage && (
          <Typography variant="body2" color="error">
            {searchMessage}
          </Typography>
        )}
        {searchResults.length > 0 && (
          <Grid
            container
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{ flexWrap: 'wrap' }}
          >
            {searchResults.map((album, index) => (
              <Grid item key={index}>
                <Card className="albumImg"
                  onClick= {album.isInYear ? () => handleAlbumClick(album) : undefined}
                  sx={{
                        width: 180,
                        height: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor:
                          selectedAlbum?.artist === album.artist &&
                          selectedAlbum?.name === album.name
                            ? 'blue'
                            : album.isInYear === false
                            ? 'gray'
                            : 'white',
                        cursor: album.isInYear ? 'pointer' : 'default',
                      }}
                >
                  <CardMedia 
                    component="img"
                    image={album.image}
                    alt={`${album.artist} - ${album.name}`}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <CardContent sx={{ padding: 1 }}>
                    <Typography variant="body2" noWrap>
                      <strong>{album.name}</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                    >
                      {album.artist}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      {/* Right Side – Albums */}
      <Grid item size={6} sx={{ paddingRight: '10px' }}>
        <Typography variant="h5" gutterBottom>
          Albums Released in {currentYear}
        </Typography>
        {/* Navigation Buttons */}
        <Box marginBottom={2}>
          <Button
            onClick={goPrev}
            disabled={currentYearIndex === 0}
            variant="outlined"
          >
            ← Previous Year
          </Button>
          <Button
            onClick={goNext}
            disabled={currentYearIndex === availableYears.length - 1}
            variant="outlined"
            sx={{ marginLeft: 2 }}
          >
            Next Year →
          </Button>
          {chartButton && 
            <Button onClick={goChart} variant="outlined" sx={{ marginLeft: 2 }}> Generate Chart</Button>
          }
        </Box>
        {/* Album Grid */}
        {albums.length > 0 ? (
          <Grid
            container
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{ flexWrap: 'wrap' }}
          >
            {albums.map((album, index) => (
              <Grid item key={index}>
                <Card className="albumImg"
                  onClick={() => handleAlbumClick(album)}
                  sx={{
                        width: 180,
                        height: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor:
                          selectedAlbum?.artist === album.artist &&
                          selectedAlbum?.name === album.name
                            ? 'blue'
                            : album.isInYear === false
                            ? 'gray'
                            : 'white',
                        cursor: album.isInYear ? 'pointer' : 'default',
                      }}
                >
                  <CardMedia 
                    component="img"
                    image={album.image}
                    alt={`${album.artist} - ${album.name}`}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <CardContent sx={{ padding: 1 }}>
                    <Typography variant="body2" noWrap>
                      <strong>{album.name}</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                    >
                      {album.artist}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No albums found for {currentYear}.</Typography>
        )}
      </Grid>
    </Grid>
  );
  }

  export default AlbumPage;
