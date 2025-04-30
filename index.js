const searchBtn = document.getElementById('search-btn')
const movieSearchField = document.getElementById('movie-search-field')

let isExpanded = false
// Your long text
let fullText = ''
// How many characters you want to show initially
const maxLength = 200
let isToggleAdded = true
let readMoreBtnStr

// function addEventListenerToMoviesList(){
//     const moviesList = document.getElementById('movies-list')
//     moviesList.addEventListener('click', (e) => {
//     })
// }

document.addEventListener( 'click', async e => {
    const uuid = e.target.dataset.readMoreBtnUuid
    if(e.target.id === 'search-btn') {  
        searchBtnClickHandler()      
    } else if(uuid) {
        viewMoreBtnClickHandler(uuid)
    }
})

async function searchBtnClickHandler() {
    const response = await fetch(`http://www.omdbapi.com/?apikey=8f815d17&s=${movieSearchField.value}`)
    const data = await response.json()

    if(data.Response === "False"){
        console.error(data.Error)
        return
    }    
    render(data)
}

function viewMoreBtnClickHandler(uuid){

}

async function getMoviesList(moviesData){
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
                    <div id="plot-text">
                        ${fullText.substring(0, maxLength)}
                        <button id="read-more-btn" data-read-more-btn-uuid="${crypto.randomUUID()}">Read more</button>
                    </div>
                </div>
            </div>`
        })
    )

    return movies.join('')
}

async function render(data){
    const moviesHTML = await getMoviesList(data)
    document.getElementById('movies-list').innerHTML = moviesHTML
}