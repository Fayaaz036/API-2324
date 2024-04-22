import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';
import fetch from 'node-fetch'; // Importeer fetch om gegevens van een externe API op te halen
import cookieParser from 'cookie-parser';

const engine = new Liquid({
  extname: '.liquid'
});

const app = new App();

app
  .use(logger())
  .use('/', sirv('dist/assets'))
  .use(cookieParser())
  .listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });

app.get('/', async (req, res) => {
  try {
    const trendingmovieData = await fetch(`https://api.themoviedb.org/3/trending/all/day?include_adult=false&language=en-US&api_key=${process.env.MOVIEDB_TOKEN}`)
      // const videoBanner = await fetch(`https://api.themoviedb.org/3/movie/693134/videos?language=en-US&api_key=${process.env.MOVIEDB_TOKEN}`)
  .then(res => res.json());
    res.send(renderTemplate('views/index.liquid', { title: 'Movies', trendingmovieData }));
    // console.log(trendingmovieData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movie data');
  }
});
app.get('/catagory', async (req, res) => {
  try {
    const catagoryMoviesData = await fetch( `https://api.themoviedb.org/3/genre/movie/list?language=en&include_adult=false&api_key=${process.env.MOVIEDB_TOKEN}`)
      .then(res => res.json());
    res.send(renderTemplate('views/catagory.liquid', { title: 'Catagory', genreData: catagoryMoviesData.genres }));
    console.log(catagoryMoviesData.genres);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movie data');
  }
});


app.get('/catagory/:id/', async (req, res) => {
  try {

    const genreId = req.params.id;
    const trendingmovieData = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}&api_key=${process.env.MOVIEDB_TOKEN}`)

      .then(res => res.json());
    res.send(renderTemplate('views/cataview.liquid', { title: 'Movie' , trendingmovieData: trendingmovieData.results, genreId: genreId }));
    console.log(trendingmovieData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movie details');
  }
});


app.get('/movie/:id/', async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.MOVIEDB_TOKEN}`)
      .then(res => res.json());
    res.send(renderTemplate('views/detail.liquid', { title: 'Movie', movie, movieId }));
    console.log(movieId);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movie details');
  }
});

app.get('/watchlist', async (req, res) => {
  try {
    const likedMoviesCookie = req.cookies.liked_movies;
    const likedMovies = likedMoviesCookie ? JSON.parse(likedMoviesCookie) : [];

    // Log de gelikete film-ID's in de console
    console.log('Gelikete film-ID\'s:', likedMovies);

    // Haal de filmgegevens op voor elke gelikete film
    const moviePromises = likedMovies.map(async movieId => {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.MOVIEDB_TOKEN}`);
      return response.json();
    });

    // Wacht tot alle filmgegevens zijn opgehaald
    const movie = await Promise.all(moviePromises);

    // Log de filmgegevens in de console
    console.log('Filmgegevens:', movie);

    // Render de watchlist-pagina met de gelikete film-ID's en filmgegevens
    res.send(renderTemplate('views/watchlist.liquid', { title: 'Watchlist', likedMovies, movie }));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movie details');
  }
});





const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data
  };

  return engine.renderFileSync(template, templateData);
};
