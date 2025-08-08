import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Container, Button } from '@mui/material';

function EnterDatePage() {
  const [date, setDate] = useState(dayjs());
  const navigate = useNavigate(); 

  const submitDate = async () => {
    const birthYear = date.year();

    try {
      const res = await axios.get('/albums-by-year', {
            params: { birthYear },
            withCredentials: true
        });
      console.log(res.data)
      localStorage.setItem('albums', JSON.stringify(res.data));
      localStorage.setItem('birthYear', birthYear);
      localStorage.setItem('currentYearIndex', NaN)
      navigate('/AlbumSelection');
    } catch (err) {
      console.log(typeof birthYear)
      console.error('Error fetching albums:', err);
    }
  };

  return (
    <Container>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          views={['year', 'month', 'day']}
          label="Enter Your Birthday"
          value={date}
          onChange={(newDate) => setDate(newDate)}
          slotProps={{
            textField: {
              helperText: 'MM/DD/YYYY',
            },
          }}
        />
      </LocalizationProvider>
      <Button
        variant="contained"
        color="primary"
        onClick={submitDate}
        style={{ marginTop: '1rem' }}
      >
        Submit Birthday
      </Button>
    </Container>
  );
}

export default EnterDatePage;
