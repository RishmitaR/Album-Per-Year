import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage" 
import EnterDatePage from './pages/EnterDatePage';
import AlbumSelectionPage from './pages/AlbumSelectionPage';
import ChartPage from './pages/ChartPage';


  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/EnterDate" element={<EnterDatePage />} />
          <Route path="/AlbumSelection" element={<AlbumSelectionPage/>} />
          <Route path="/Chart" element={<ChartPage/>} />
        </Routes>
      </Router>
    );
  }

  export default App;
