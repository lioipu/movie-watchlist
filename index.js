const searchBtn = document.getElementById('search-btn')
const movieSearchField = document.getElementById('movie-search-field')

let isExpanded = false
// Your long text
let fullText = ''
// How many characters you want to show initially
const maxLength = 140
const watchlistArr = []

const STATE = {
    SEARCHED: 'SEARCHED',
    NONE: 'NONE',
    VIEWMORE: 'VIEWMORE'
}

let state = STATE.NONE

document.addEventListener( 'click', async e => {

    if(e.target.id === 'search-btn'){
        searchBtnClickHandler()
    } else if(e.target.dataset.readMoreBtnUuid) {
        console.log(e.target.dataset)
        viewMoreBtnClickHandler(e.target.dataset.readMoreBtnUuid)
    } else if(e.target.dataset.addToWatchlistBtnUuid){
        addToWatchlistBtnClickHandler(e.target.dataset.addToWatchlistBtnUuid)
    }
})

async function searchBtnClickHandler() {
    const response = await fetch(`http://www.omdbapi.com/?apikey=8f815d17&s=${movieSearchField.value}`)
    const data = await response.json()
    state = STATE.SEARCHED
    
    if(data.Response === "False"){
        console.error(data.Error)
        render(null, null)
        return
    }
    
    render(data)
}

function viewMoreBtnClickHandler(btnUuid){
    const btnEl = document.querySelector(`[data-read-more-btn-uuid~="${btnUuid}"]`)
    btnEl.dataset.isExpanded = btnEl.dataset.isExpanded === 'false' ? 'true' : 'false'
    state = STATE.VIEWMORE
    render(null ,btnUuid)
}

function addToWatchlistBtnClickHandler(btnUuid){
    console.log(btnUuid)
}

async function getMoreMoviesData(moviesData){
    const movies = await Promise.all(
        moviesData.Search.map( async movie => {
            const response = await fetch(`http://www.omdbapi.com/?apikey=8f815d17&i=${movie.imdbID}&plot=Short`)
            const data = await response.json()
            if(data.Response === "False"){
                console.error(data.Error)
                return
            }
            return data
        })
    )
    return getMoviesList(movies)
}

function getMoviesList(moviesData){
    let inWatchlist = false
    if(watchlistArr.find( watchlistMovie => watchlistMovie.inWatchlist === true )){
        inWatchlist = true
    } else {
        inWatchlist = false
    }

    if(!moviesData){
        return `
            <div class="start-explore" ><p class="start-explore-text">Unable to find what you’re looking for. Please try another search.</p></div>
        `
    }
    const moviesStr = moviesData.map( movie => { 
            return `
            <div class="movie">
                <img class="movie-poster" src="${movie.Poster}" alt="a movie poster">
                <div class="movie-content">
                    <div class="section">
                        <h3 class="movie-title">${movie.Title}</h3>
                        <i class="fa-solid fa-star" style="color: #FEC654"></i>
                        <p>${movie.imdbRating}</p>
                    </div>
                    <div class="section">
                        <p>${movie.Runtime}</p>
                        <p>${movie.Genre}</p>
                        <button class="add-to-watchlist-btn" data-add-to-watchlist-btn-uuid="${movie.imdbID}"><i class="fa fa-plus-circle" aria-hidden="true" style="font-size:  16px" ></i> Watchlist</button>
                    </div>
                    <div id="plot-text" data-movie-plot="${encodeURIComponent(movie.Plot)}">
                        ${movie.Plot.substring(0, maxLength)}
                        ${movie.Plot.length >= maxLength ? `<button id="read-more-btn" data-in-watchlist="${inWatchlist}" data-is-expanded="false" data-read-more-btn-uuid="${movie.imdbID}">...Read more</button>` : ''}
                    </div>
                </div>
            </div>`
        })
    return moviesStr.join('')
}

function getMoviePlot(btnEl) {
    const plot = decodeURIComponent(btnEl.parentElement.dataset.moviePlot)
    return `
        ${btnEl.dataset.isExpanded === 'false' ? plot.substring(0, maxLength) : plot}
        <button id="read-more-btn" data-is-expanded="${btnEl.dataset.isExpanded}" data-read-more-btn-uuid="${btnEl.dataset.readMoreBtnUuid}">${btnEl.dataset.isExpanded === 'false' ? '...Read more' : 'Read less'} </button>
    `
}

async function render(data, btnUuid){
    if(state === STATE.SEARCHED) {
        const moviesHTML = await getMoreMoviesData(data)
        document.getElementById('movies-list').innerHTML = moviesHTML
    } else if(state === STATE.VIEWMORE){
        const btnEl = document.querySelector(`[data-read-more-btn-uuid~="${btnUuid}"]`)
        btnEl.parentElement.innerHTML = getMoviePlot(btnEl)
    } else {
        console.log('hi')
        document.getElementById('movies-list').innerHTML = `
        <div class="start-explore">
            <i class="fa-solid fa-film fa-2xl" style="color: #d5d5d5; font-size:70px; height: 10px;"></i>
            <p class="start-explore-text">Start exploring</p>
        </div>`
    }
}

render(null, null)