# API @cmda-minor-web 2023 - 2024

Ik heb een app gemaakt waarbij je informatie over films kan krijgen en in catagorieen kan kijken welke films er zijn. 
Deze films kan je aan een watchlist toevoegen, en dan kan je ze later terug vinden.


## Functies
- Films fetchen van The MovieDB en weergeven op de webapp.
- Kijken op catagorieen.
- Opslaan van gelikete films met Cookies.

### Films fetchen van The MovieDB en weergeven op de webapp.
Om de data op te halen uit de API moet ik een fetch request doen. Hier vraag ik alle data op die in vervolgens in een grote array terug krijg. 
```js
app.get('/', async (req, res) => {
  try {
  const trendingmovieData = await fetch(`https://api.themoviedb.org/3/trending/all/day?include_adult=false&language=en-US&api_key=${process.env.MOVIEDB_TOKEN}`)
  .then(res => res.json());
  res.send(renderTemplate('views/index.liquid', { title: 'Movies', trendingmovieData }));
  // console.log(trendingmovieData);
  } catch (error) {
  console.error(error);
  res.status(500).send('Error fetching movie data');
  }
  });
```

Vervolgens haal ik delen uit de array om in te vullen op mijn template.
```html
{% layout "layouts/base.liquid" %}

{% block content %}

<div class="container">
  <h2 class="divTitle">Trending movies</h2>
  <ul class="trendingMovies">
    {% for movie in trendingmovieData.results %}
      {% if movie.original_title %}
        {% assign mov = movie.original_title %}
      {% else %}
        {% assign mov = movie.name %}
      {% endif %}
      <li class="item">
        <a href="/movie/{{ movie.id }}">
          {% render 'components/poster/poster.liquid', movie: movie %}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>

{% endblock %}
```
### Kijken op catagorieen.
Om alle catagorieen op te halen doe ik weer een fetch naar the moviedb. hier vraag ik nu naar alle categorieen die er aanwezig zijn in de API. 
```js
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
```

met de response hieruit kan ik de films laden per catagorie en vul ik het template in. 
```html
{% layout "layouts/base.liquid" %}

{% block content %}
<div class="container">
  {% assign titel = genreId %}
  <h2 class="divTitle">Category {{ titel }}</h2>
  <ul class="trendingMovies">
    {% for movie in trendingmovieData %}
      <li>
        <a href="/movie/{{ movie.id }}">
          {% render 'components/poster/poster.liquid', movie: movie %}
        </a>
      </li>
    {% endfor %}
  </ul>
  </div>
{% endblock %}

```

### Opslaan van gelikete films met Cookies.
om te beginnen moet ik eerst een cookie aanmaken die de id van de gelikte film bevat. Dat heb ik zo gedaan: 
```js
document.getElementById('watchlist').addEventListener('click', function () {
  // Haal de id van de film op uit de data attribute
  const movieId = this.getAttribute('data-movie-id');

  // Haal de bestaande gelikete films op uit de cookie of maak een lege array als er geen zijn
  let likedMovies = getCookie('liked_movies') ? JSON.parse(getCookie('liked_movies')) : [];

  // Controleer of het film-ID al in de array voorkomt
  if (likedMovies.includes(movieId)) {
    // Verwijder het film-ID als het al in de array staat
    likedMovies = likedMovies.filter(id => id !== movieId);
    console.log(`Movie with id ${movieId} is deleted from list!`);

  } else {
    // Voeg het nieuwe film-ID toe aan de array van gelikete films
    likedMovies.push(movieId);
    // Geef een melding aan de gebruiker dat de film geliket is
    console.log(`Movie with id ${movieId} is liked!`);
  }

  // Sla de bijgewerkte array van gelikete films op in de cookie
  setCookie('liked_movies', JSON.stringify(likedMovies), 30); // 30 dagen geldig

});

// Functie om een cookie te krijgen
function getCookie (name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Functie om een cookie in te stellen
function setCookie (name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}
```

de cookie is nu aangemaakt en bevat een array met id's deze id's. deze moeten nu gebruikt worden in de fetch call naar de api om als film teruggegeven te worden.
```js
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
```
met deze data kan ik mijn template invullen.
```html
{% layout "layouts/base.liquid" %}

{% block content %}
<div class="container">
  <h2 class="divTitle">Watchlist</h2>
  <ul class="trendingMovies">
    {% for movie in movie %}
      <li>
        <a href="/movie/{{ movie.id }}">
          {% render 'components/poster/poster.liquid', movie: movie %}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>
{% endblock %}

```



## Beoordeling

Je zal beoordeeld worden op basis van je code, creativiteit en je gedocumenteerde proces. Om het vak te halen zal je aan
de 3 criteria hieronder moeten voldoen. Een hoger cijfer kan je halen door verder te gaan dan de basis.

| Tekortkomingen | Criterium                                                                                                                                                                                                                                 | Verbeteringen |
|:---------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------|
|                | *Project* - Je app werkt en is online beschikbaar. Daarnaast heb je je concept, technologieen, gebruikte Web API's en proces duidelijk gedocumenteerd in je `README.md`.                                                                  |               |
|                | *Functionaliteit* - Je hebt minstens een overzicht en een detailpagina. Hoe meer dynamischer je functionaliteit.hoe beter.                                                                                                                |               |
|                | *Enhancements* - Je laat zien dat je begrijpt hoe het web werkt door meerdere Web API's te gebruiken om een zo aantrekkelijk mogelijke gebruikerservaring neer te zetten. Je gebruikt je eigen creativiteit om iets uniks neer te zetten. |               |

## Planning

| Planning                   | Maandag             | Dinsdag               | Vrijdag                |
|----------------------------|---------------------|-----------------------|------------------------|
| Week 1 - Kickoff & concept | Pasen               | Introductie en uitleg | Feedback gesprekken    |
| Week 2 - The baseline      | College + workshops | Workshops             | Feedback gesprekken    |
| Week 3 - Enhance           | College + workshops | Workshops             | Feedback gesprekken    |
| Week 4 - Enhance & wrap up | Individuele vragen  | Individuele vragen    | Beoordelingsgesprekken |

