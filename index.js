const searchBtn = document.getElementById('search-btn')
const movieSearchField = document.getElementById('movie-search-field')

searchBtn.addEventListener('click', async () => {
    
    const moviesList = document.getElementById('movies-list')
    const response = await fetch(`http://www.omdbapi.com/?apikey=8f815d17&t=${movieSearchField.value}&plot=full`)
    const data = await response.json()

    if(data.Response === "False"){
        console.error(data.Error)
    } else {
        console.log(data)
        moviesList.innerHTML = `
        <div class="movie">
            <img class="movie-poster" src="${data.Poster}" alt="a movie poster">
            <div class="movie-content">
                <div class="section">
                    <h3 class="movie-title">${data.Title}</h3>
                    <i class="fa-solid fa-star" style="color: #FEC654"></i>
                    <p>${data.imdbRating}</p>
                </div>
                <div class="section">
                    <p>${data.Runtime}</p>
                    <p>${data.Genre}</p>
                    <button class="add-to-watchlist-btn"><i class="fa fa-plus-circle" aria-hidden="true" style="font-size:  16px"></i></button>
                    <p>Watchlist</p>
                </div>
                <div>
                    <p>${data.Plot}</p>
                    <button id="read-more-btn">Read more</button>
                </div>
                </div>
            </div>
        </div>`
    }
})

function toggle(){
    const words = 125

}