const apiKey = 'rLqOrNqCkn7RQJ96AjKBboIWFUq6nDzs8YhJKAsN';

const searchURL= 'https://developer.nps.gov/api/v1/parks'

function formatQueryParams(params){
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${
        encodeURIComponent(params[key])
    }`);
    return queryItems.join('&');
}

function getStateName(parkStates){
    //returns full state name(s) from state code(s)
    const statesArray = parkStates.split(',');
    return statesArray.map(state => {
        return statesCodeList[state];
    }).join(', ');
}

function displayResults(responseJson){
    $('#js-results').empty();
    responseJson.data.map((parkInfo) => {
        $('#js-results').append(
            `<div class="result-item">
            <h2>${parkInfo.fullName}</h2>
            <h3>Located: ${getStateName(parkInfo.states)}</h3>
            <p>${parkInfo.description}</p>
            <a href="${parkInfo.url}" target="_blank" rel="noopener noreferrer">More on ${parkInfo.name}</a>
            <a href="${parkInfo.directionsUrl}" target="_blank" rel="noopener noreferrer">Directions to ${parkInfo.name}</a>
            </div>`
        );
    });
    //hide the error message section, display the results section
    $('#js-error-msg').prop('hidden', true);
    $('#js-results').prop('hidden', false);
}

function getParks(states, maxResults=10){
    //calls the API
    const params = {
        api_key: apiKey,
        stateCode: states,
        limit: maxResults-1
    };
    const queryString = formatQueryParams(params);
    const url = searchURL + '?' + queryString;
    console.log(url)

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error (response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

function getStateCode(searchString){
    //returns list of state codes separated by commas from list of full state names
    const termArray = searchString.toLowerCase().split(',');
    const stateCodes = termArray.map(term => {
        let trimmedTerm = term.trim();
        if(trimmedTerm.length > 2) return statesList[trimmedTerm];
        return trimmedTerm;
    });
    console.log(stateCodes.join(','));
    return stateCodes.join(',');
}

function showUserError(){
// tell user to reenter parameter
$('#js-error-msg').text(`Check your spelling. Enter either state code(s) 
(e.g. CA) or full state name(s) (e.g. California)`);
$('#js-results').prop('hidden', true);
$('#js-error-msg').prop('hidden', false);
}

function watchForm(){
    $('#js-form').submit(event => {
        event.preventDefault();
        const searchString = $('#js-search-state').val();
        const maxResults = $('#js-max-results').val();
        const states = getStateCode(searchString);
        //even if stateCode parameter is empty, response will come back ok
        //and list parks from ALL states. Catch empty stateCode here 
        if(states) getParks(states, maxResults);
        else showUserError();
    });
}

$(watchForm);