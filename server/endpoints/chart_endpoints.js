const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
 
function chart_endpoints(app){
    app.post('/update-album-stack', (req, res) => {
      const { year, artist, album_name, image } = req.body;
      if (!req.session.albumStack) req.session.albumStack = {};

      req.session.albumStack[year] = { artist, name: album_name, image };

      //console.log(req.session.albumStack)
      res.json(req.session.albumStack[year]);
    });

    app.get('/get-album-stack', (req,res) => {
      const year = parseInt(req.query.year)
      if (!req.session.albumStack) {
        return res.json(NaN);
      }
      res.json(req.session.albumStack[year])
    })

    app.get('/get-full-album-stack', (req, res) => {
      if (!req.session.albumStack) {
        return res.json([]);
      }
    
      const albumStack = req.session.albumStack;
    
      const sortedYears = Object.keys(albumStack)
        .map(year => parseInt(year))
        .sort((a, b) => a - b);
    
      const allAlbums = sortedYears.flatMap(year => {
        const album = albumStack[year];
      
        if (!album || typeof album !== 'object') {
          console.warn(`Invalid album data for year ${year}`, album);
          return [];
        }
      
        return [{
          year,
          album_name: album.name,
          artist: album.artist,
          image: album.image,
          // other metadata if needed
        }];
      });

      //console.log(allAlbums);
      res.json(allAlbums);
  });

};

module.exports = { chart_endpoints};
