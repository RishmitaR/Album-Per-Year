import React, { useState, useEffect } from "react";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom"
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";


function HomePage(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
      window.location.href = 'http://localhost:8080/login';
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Spotify Auth Demo</h1>
        
                {!isLoggedIn ? (
                  <button onClick={handleLogin}>Login with Spotify</button>
            ) : (
              <>
                
              </>
            )}
      </div>
    )
}

export default HomePage; 