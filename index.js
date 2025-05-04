const searchBtn = document.getElementById('search-btn')
const movieSearchField = document.getElementById('movie-search-field')

let isExpanded = false
// Your long text
let fullText = ''
// How many characters you want to show initially
const maxLength = 140
let btnsArr = []

const STATE = {
    SEARCHED: 'SEARCHED',
    NONE: 'NONE',
    VIEWMORE: 'VIEWMORE'
}

let state = STATE.NONE

document.addEventListener( 'click', async e => {
    const btnId = e.target.dataset.readMoreBtnUuid
    const btnInfo = btnsArr.find(btn => btn.movieId === btnId)

    if(e.target.id === 'search-btn') {
        searchBtnClickHandler()
    } else if(btnInfo) {
        viewMoreBtnClickHandler(btnInfo)
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
    
    btnsArr = []
    data.Search.forEach( movie => btnsArr.push(
        {
            movieId: movie.imdbID,
            isExpanded: false
        }
    ))
    render(data)
}

function viewMoreBtnClickHandler(btnInfo){
    btnInfo.isExpanded = !btnInfo.isExpanded
    state = STATE.VIEWMORE
    render(null ,btnInfo)
}

async function getMoviesList(moviesData){
    if(!moviesData){
        return `
            <div class="start-explore" ><p class="start-explore-text">Unable to find what you’re looking for. Please try another search.</p></div>
        `
    }
    const movies = await Promise.all(


        moviesData.Search.map( async movie => {
            const response = await fetch(`http://www.omdbapi.com/?apikey=8f815d17&i=${movie.imdbID}&plot=Short`)
            const data = await response.json()
            
            if(data.Response === "False"){
                console.error(data.Error)
                return
            }    
            fullText = data.Plot

            return `
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
                    <div id="plot-text" data-movie-plot="${encodeURIComponent(fullText)}">
                        ${fullText.substring(0, maxLength)}
                        ${fullText.length >= maxLength ? `<button id="read-more-btn" data-read-more-btn-uuid="${movie.imdbID}">...Read more</button>` : ''}
                    </div>
                </div>
            </div>`
        })
    )

    return movies.join('')
}

function getMoviePlot(info, btnEl) {
    const plot = decodeURIComponent(btnEl.parentElement.dataset.moviePlot)

    return `
        ${info.isExpanded === false ? plot.substring(0, maxLength) : plot}
        <button id="read-more-btn" data-read-more-btn-uuid="${info.movieId}">${info.isExpanded === false ? '...Read more' : 'Read less'} </button>
    `
}

async function render(data, info){
    if(state === STATE.SEARCHED) {
        const moviesHTML = await getMoviesList(data)
        document.getElementById('movies-list').innerHTML = moviesHTML
    } else if(state === STATE.VIEWMORE){
        const btnEl = document.querySelector(`[data-read-more-btn-uuid~="${info.movieId}"]`)
        btnEl.parentElement.innerHTML = getMoviePlot(info, btnEl)
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