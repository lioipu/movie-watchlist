const searchBtn = document.getElementById('search-btn')
const movieSearchField = document.getElementById('movie-search-field')

let isExpanded = false
// Your long text
let fullText = ''
// How many characters you want to show initially
const maxLength = 140
let watchlistArr = []   
let state
let pageState = window.location.pathname
const STATE = {
    SEARCHED: 'SEARCHED',
    VIEWMORE: 'VIEWMORE',
    STARTEXPLORE: 'STARTEXPLORE',
    WATCHLIST:'WATCHLIST',
    EMPTYWATCHLIST: 'EMPTYWATCHLIST'
}

document.addEventListener( 'click', async e => {
    if(e.target.id === 'search-btn'){
        searchBtnClickHandler()
    } else if(e.target.dataset.readMoreBtnUuid) {
        viewMoreBtnClickHandler(e.target.dataset.readMoreBtnUuid)
    } else if(e.target.dataset.addToWatchlistBtnUuid){
        addToWatchlistBtnClickHandler(e.target.dataset.addToWatchlistBtnUuid)
    } 
})
// localStorage.clear()
if(JSON.parse(localStorage.getItem('watchlist'))){
    watchlistArr = JSON.parse(localStorage.getItem('watchlist'))
} else {
    watchlistArr = []
}

if(localStorage.getItem('pageState')){
    pageState = localStorage.getItem('pageState')
    // page was changed
    console.log(window.location.pathname)
    console.log(localStorage.getItem('pageState'))
    if(window.location.pathname !== pageState){
        localStorage.setItem('pageState', window.location.pathname)
        pageState = window.location.pathname
        // set the state depending on the page were get into
        if(window.location.pathname === '/index.html'){
            state = STATE.STARTEXPLORE
            localStorage.setItem('state', JSON.stringify(state))
        } else if(window.location.pathname === '/watchlist.html') {
            if(watchlistArr.length === 0){
                state = STATE.EMPTYWATCHLIST
                localStorage.setItem('state',JSON.stringify(state))
            } else {
                state = STATE.WATCHLIST
                localStorage.setItem('state',JSON.stringify(state))
            }
        }
    }

} else {
    localStorage.setItem('pageState', pageState)
}

if(JSON.parse(localStorage.getItem('state'))){
    state = JSON.parse(localStorage.getItem('state'))
} else {
    if(window.location.pathname === '/index.html') {
        state = STATE.STARTEXPLORE
        localStorage.setItem('state',JSON.stringify(state))
    } else if(window.location.pathname === '/watchlist.html') {
        if(watchlistArr.length === 0){
            state = STATE.EMPTYWATCHLIST
            localStorage.setItem('state',JSON.stringify(state))
        } else {
            state = STATE.WATCHLIST
            localStorage.setItem('state',JSON.stringify(state))
        }
    }
}


function updateLocalStorage(){
    localStorage.setItem('watchlist', JSON.stringify(watchlistArr))
    localStorage.setItem('state', JSON.stringify(state))
}

async function searchBtnClickHandler() {
    const response = await fetch(
        `http://www.omdbapi.com/?apikey=8f815d17&s=${movieSearchField.value}`
    )
    const data = await response.json()
    state = STATE.SEARCHED
    
    if(data.Response === "False"){
        console.error(data.Error)
        render(null, null)
        return
    }
    updateLocalStorage()
    render(data)
}

function viewMoreBtnClickHandler(btnUuid){
    const btnEl = document.querySelector(`[data-read-more-btn-uuid~="${btnUuid}"]`)
    btnEl.dataset.isExpanded = btnEl.dataset.isExpanded === 'false' ? 'true' : 'false'
    state = STATE.VIEWMORE
    render(null ,btnUuid)
}

async function addToWatchlistBtnClickHandler(btnUuid){
    const response = await fetch(
        `http://www.omdbapi.com/?apikey=8f815d17&i=${btnUuid}&plot=Short`
    )
    const data = await response.json()

    if(data.Response === "False"){
        console.error(data.Error)
        return
    }
    
    const tmpMovie = watchlistArr.find( movie => movie.imdbID === btnUuid)
    if(!tmpMovie){
        watchlistArr.push(
            {
                inWatchlist: 'true'
            }
        )
        Object.assign(watchlistArr[watchlistArr.length - 1], data)
        toggleAddToWatchlistBtnState(
            btnUuid, watchlistArr[watchlistArr.length - 1].inWatchlist
        )
    } else {
        const index = watchlistArr.indexOf( tmpMovie )
        toggleAddToWatchlistBtnState(btnUuid, 'false')
        watchlistArr.splice(index, 1)
    }
    
    if(watchlistArr.length === 0){
        state = STATE.EMPTYWATCHLIST
    }
    updateLocalStorage()
    if(state === STATE.WATCHLIST || state === STATE.EMPTYWATCHLIST){
        render(data, btnUuid)
    }
}
// localStorage.clear()

async function getMoreMoviesInfo(moviesData){
    const movies = await Promise.all(
        moviesData.Search.map( async movie => {
            const response = await fetch(
                `http://www.omdbapi.com/?apikey=8f815d17&i=${movie.imdbID}&plot=Short`
            )
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
    if(!moviesData){
        return `
            <div class="start-explore" >
                <p class="start-explore-text">
                    Unable to find what you’re looking for. Please try another search.
                </p>
            </div>
        `
    }
    const moviesStr = moviesData.map( ( movie, index ) => {
        console.log(index)
        inWatchlist = !!watchlistArr.find( movieInfo => movie.imdbID === movieInfo.imdbID)
            return `
            <div class="movie ${index !== moviesData.length - 1 ? `not-last-movie` : ''}">
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
                        <button class="add-to-watchlist-btn"
                            data-add-to-watchlist-btn-uuid="${movie.imdbID}" 
                            data-in-watchlist="${inWatchlist}" >
                                ${inWatchlist === false ?
                                `<i class="fa fa-plus-circle"
                                    aria-hidden="true" 
                                    style="font-size: 16px" ></i>` :
                                `<i class="fa fa-minus-circle"
                                    aria-hidden="true"
                                    style="font-size: 16px" ></i>`
                                }
                                Watchlist
                        </button>
                    </div>
                    <div id="plot-text" data-movie-plot="${encodeURIComponent(movie.Plot)}">
                        ${movie.Plot.substring(0, maxLength)}
                        ${movie.Plot.length >= maxLength ? `
                            <button id="read-more-btn"
                            data-is-expanded="false"
                            data-read-more-btn-uuid="${movie.imdbID}">
                                ...Read more
                            </button>` :
                            ''}
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
        <button id="read-more-btn"
        data-is-expanded="${btnEl.dataset.isExpanded}"
        data-read-more-btn-uuid="${btnEl.dataset.readMoreBtnUuid}">
            ${btnEl.dataset.isExpanded === 'false' ?
            '...Read more' :
            'Read less'}
        </button>
    `
}

function toggleAddToWatchlistBtnState(btnUuid, inWatchlist) {
    const btnEl = document.querySelector(`[data-add-to-watchlist-btn-uuid~="${btnUuid}"]`)
    btnEl.innerHTML = `${inWatchlist === 'false' ?
        `<i class="fa fa-plus-circle" aria-hidden="true" style="font-size: 16px" ></i>` :
        `<i class="fa fa-minus-circle" aria-hidden="true" style="font-size: 16px" ></i>`
        }
        Watchlist`
}

function setupPageState(){

}

async function render(data, btnUuid){
    console.log(state)
    switch(state){
        case STATE.SEARCHED:
            const moviesHTML = await getMoreMoviesInfo(data)
            document.getElementById('movies-list').innerHTML = moviesHTML
            break
        case STATE.VIEWMORE:
            const btnEl = document.querySelector(`[data-read-more-btn-uuid~="${btnUuid}"]`)
            btnEl.parentElement.innerHTML = getMoviePlot(btnEl)
            break
        case STATE.STARTEXPLORE:
            document.getElementById('movies-list').innerHTML = `
                <div class="start-explore">
                    <i class="fa-solid fa-film fa-2xl"
                    style="color: #d5d5d5; 
                    font-size:70px; 
                    height: 10px;"></i>
                    <p class="start-explore-text">Start exploring</p>
                </div>`
            break
        case STATE.WATCHLIST:
            console.log(watchlistArr)
            document.getElementById('movies-list').innerHTML = getMoviesList(watchlistArr)
            break
        case STATE.EMPTYWATCHLIST:
            document.getElementById('movies-list').innerHTML = `
                <div class="start-explore">
                    <p class="start-explore-text">Your watchlist is looking a little empty...</p>
                    <a href="index.html" style="color: black">
                        <i class="fa fa-plus-circle"
                        aria-hidden="true" 
                        style="font-size: 22px;color: #363636;" ></i> 
                        Let’s add some movies!
                    </a>
                </div>
            `            
        }

}
if(state === STATE.SEARCHED){
    searchBtnClickHandler()
} else {
    render(null, null)
}