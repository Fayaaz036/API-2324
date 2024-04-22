import './index.css';

console.log('Hello, world!');


// Voeg een click event listener toe aan het element met id 'watchlist'
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
    showAlert('Movie is removed from the list!');

  } else {
    // Voeg het nieuwe film-ID toe aan de array van gelikete films
    likedMovies.push(movieId);
    console.log(`Movie with id ${movieId} is liked!`);
    showAlert('Movie is added to the list!');
  }

  // Sla de bijgewerkte array van gelikete films op in de cookie
  setCookie('liked_movies', JSON.stringify(likedMovies), 30); // 30 dagen geldig
});

// Functie om een alert te tonen en na 2 seconden te laten verdwijnen
function showAlert (message) {
  const alertMessage = document.createElement('div');
  alertMessage.classList.add('alert');
  alertMessage.textContent = message;
  document.body.appendChild(alertMessage);

  setTimeout(() => {
    alertMessage.remove();
  }, 2000);
}



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

// Wacht tot alle afbeeldingen zijn geladen voordat de 'loaded' klasse wordt toegevoegd
window.addEventListener('load', function () {
  const posterItems = document.getElementsByClassName('item');
  posterItems.forEach(item => {
    item.classList.remove('loaded');
  });
});

