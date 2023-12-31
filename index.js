const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors'); 
const app = express();
const port = process.env.PORT || 5005;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());
app.use(cors()); 

app.post('/register', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser.rows.length === 0) {
     
      await pool.query('INSERT INTO users (username) VALUES ($1)', [username]);
      res.status(201).json({ message: 'User created and logged in successfully' });
    } else {
      
      res.status(200).json({ message: 'User logged in successfully' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  app.post('/api/like', async (req, res) => {
    const { username, movieId } = req.body;

    try {
        const existingLike = await pool.query('SELECT * FROM liked_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);

        if (existingLike.rows.length > 0) {
           
            await pool.query('DELETE FROM liked_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);
            res.json({ message: 'Movie unliked successfully' });
        } else {
           
            await pool.query('INSERT INTO liked_movies (username, movie_id) VALUES ($1, $2)', [username, movieId]);
            res.json({ message: 'Movie liked successfully' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/liked-movies/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
     
      const likedMovies = await pool.query(
        
        'SELECT movie_id FROM liked_movies WHERE username = $1',
        [username]
        
      );
    
  
     
      const movieIds = likedMovies.rows.map(row => row.movie_id);
  
      res.json(movieIds);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/watchlist', async (req, res) => {
    const { username, movieId } = req.body;

    try {
        const existingWatchlistItem = await pool.query('SELECT * FROM watchlist_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);

        if (existingWatchlistItem.rows.length > 0) {
            // If the movie is already in the watchlist, remove it
            await pool.query('DELETE FROM watchlist_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);
            res.json({ message: 'Movie removed from the watchlist successfully' });
        } else {
            // If the movie is not in the watchlist, add it
            await pool.query('INSERT INTO watchlist_movies (username, movie_id) VALUES ($1, $2)', [username, movieId]);
            res.json({ message: 'Movie added to the watchlist successfully' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  app.get('/api/watchlist-movies/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
      // Query the database to get the liked movies for the user
      const watchList_mov = await pool.query(
        
        'SELECT movie_id FROM watchlist_movies WHERE username = $1',
        [username]
        
      ); 
  
      
      const movieIds = watchList_mov.rows.map(row => row.movie_id);
  
      res.json(movieIds); 
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

