const express = require('express');
const axios = require('axios');
const app = express();

// Set window size
const WINDOW_SIZE = 10;

// Initialize stored numbers
let stored_numbers = [];

app.get('/numbers/:number_id', async (req, res) => {
  // Check if number ID is qualified
  const number_id = req.params.number_id;
  if (!['p', 'f', 'e', 'r'].includes(number_id)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  // Fetch numbers from third-party server
  const start_time = new Date().getTime();
  let numbers;  // Declare numbers here
  try {
    const response = await axios.get(`https://test-server.com/${number_id}`);
    numbers = response.data;  // Assign response data to numbers
    if (new Date().getTime() - start_time > 500) {
      return res.status(500).json({ error: 'Timeout fetching numbers' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching numbers' });
  }

  // Store unique numbers
  const new_numbers = numbers.filter(num => !stored_numbers.includes(num));
  stored_numbers.push(...new_numbers);
  stored_numbers = [...new Set(stored_numbers)];  // Remove duplicates
  stored_numbers = stored_numbers.slice(-WINDOW_SIZE);  // Limit to window size

  // Calculate average
  const avg =
    stored_numbers.reduce((sum, num) => sum + num, 0) / stored_numbers.length || 0;

  // Return response
  res.json({
    windowPrevState: stored_numbers.slice(0, -new_numbers.length),
    windowCurrState: stored_numbers,
    numbers,  // Now numbers is in scope
    avg,
  });
});