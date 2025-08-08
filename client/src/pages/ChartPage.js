import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, Container,Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css'; // Import the CSS file


function ChartPage ()  {
  const chartRef = useRef();
  const navigate = useNavigate();
  const [albumStack, setAlbumStack] = useState([]);

  useEffect(() => {
      const fetchAlbumStack = async () => {
        try {
          const res = await axios.get('/get-full-album-stack', {
            withCredentials: true,
          });
          setAlbumStack(res.data);
        } catch (err) {
          console.error('Error fetching album stack:', err);
        }
      };
      fetchAlbumStack();
      //console.log(albumStack)
    },albumStack);

  const handleDownload = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#000', // black background
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = 'album_per_year_chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const chunkAlbums = (albums, size = 5) => {
    const chunks = [];
    for (let i = 0; i < albums.length; i += size) {
      chunks.push(albums.slice(i, i + size));
    }
    return chunks;
  };

  const chunkedAlbums = chunkAlbums(albumStack, 5); 

return (
  <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} color="inherit">
          ← Back
        </Button>
        <Button variant="contained" onClick={handleDownload}>
          Download Chart
        </Button>
      </Box>

      <Box
        ref={chartRef}
        sx={{
          bgcolor: 'black',
          borderRadius: 2,
          py: 2,
          px: 3,
          maxWidth: 1000,
          mx: 'auto',
        }}
      >
        {chunkedAlbums.map((row, rowIndex) => (
          <Grid
            container
            spacing={1}
            key={rowIndex}
            alignItems="center"
            wrap="nowrap"
            sx={{ mb: 1, height: '100px' }} // force row height
          >
            {/* Album Covers */}
            {row.map((album, index) => (
              <Grid item key={index} sx={{ width: 100 }}>
                <Box
                  component="img"
                  src={album.image}
                  alt={`${album.album_name} - ${album.artist}`}
                  sx={{
                    width: '100px',
                    height: '100px',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              </Grid>
            ))}

            {/* Filler slots to make 5 total */}
            {Array.from({ length: 5 - row.length }).map((_, i) => (
              <Grid item key={`filler-${i}`} sx={{ width: 100 }} />
            ))}

            {/* Right-side aligned text */}
            <Grid item sx={{ pl: 1 }}>
              <Box>
                {row.map((album, i) => (
                  <Typography
                    key={i}
                    sx={{
                      color: 'white',
                      fontSize: '0.9rem',
                      lineHeight: '15px',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {album.year}: {album.album_name} - {album.artist}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Container>
  </Box>
);
}; 

export default ChartPage;
