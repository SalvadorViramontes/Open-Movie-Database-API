const apikey = ''; // Valor que debe ser reemplazado por la llave personal
let baseUrl = 'http://www.omdbapi.com/'; // Dirección base de la REST API

let multimedia = []; // Variable global que albergará las películas y series múltiples que aparezcan en la búsqueda
let skip = 0; // Variable global que permite saltar n elementos del arreglo multimedia
let take = 4; // Variable global que indica cuantos elementos se toman del arreglo multimedia

// Función que permite hacer una búsqueda exacta de la serie o película
function exactSearch(){
    // Se extrae el texto de la barra de búsqueda
    let movieTitle = $("#search-bar").val();

    // Si existe texto, se procede a crear las variables que irán dentro del query de consulta
    if(movieTitle){
        let data = {
            t: movieTitle,
            apikey: apikey
        }
        // Se muestra el ícono animado de espera
        $("#waiting").show();
        // Se hace la consulta con la API y después de eso, se oculta el ícono de espera
        ajaxPoll(data).then(()=>{
            $("#waiting").hide();
        });
    }
}

// Función que permite hacer una búsqueda aproximada de series o películas
function approximatedSearch(){
    // Se extrae el texto de la barra de búsqueda
    let movieTitle = $("#search-bar").val();

    // Si existe texto, se procede a crear las variables que irán dentro del query de consulta
    if(movieTitle){
        let data = {
            s: movieTitle,
            apikey: apikey
        }
        // Se muestra el ícono animado de espera
        $("#waiting").show();
        // Se hace la consulta con la API y después de eso, se oculta el ícono de espera
        ajaxPoll(data).then(()=>{
            $("#waiting").hide();
        });
    }
}

// Función que permite mostrar las páginas de contenido cuando este 
// excede el número de elementos que se pueden visualizar a la vez
function changeVisibles(direction){
    // Si se presiona el botón derecho, se suma el valor para saltar los elementos
    if(direction === 'forth'){
        if(skip + take >= multimedia.length) return;
        skip = skip + take;
    }
    // Si se presiona el botón izquierdo, se resta el valor para saltar los elementos
    else if(direction === 'back'){
        if(skip - take < 0) return;
        skip = skip - take;
    }
    // Si el valor de salto es mayor a cero, se habilita el botón izquierdo, de lo
    // contrario, no se habilita
    let leftDisabled = true
    if(skip > 0) leftDisabled = false;
    $('.left').prop("disabled", leftDisabled);
    
    // Si el valor de salto es menor al número de elementos y la suma del valor de salto 
    // con la cantidad de elementos es menor o igual a éste, se habilita el botón izquierdo
    //, de lo contrario, no se habilita
    let rightDisabled = false
    if(multimedia.length > skip && multimedia.length >= skip + take){
        renderMultiple(multimedia.slice(skip,skip+take));
        $('#page').text(`${skip + 1} - ${skip + take}`);
    }
    else{
        rightDisabled = true;
        renderMultiple(multimedia.slice(skip));
        $('#page').text(`${skip + 1} - ${multimedia.length}`);
    }
    $('.right').prop("disabled", rightDisabled);
}

// Función utilizada para desplegar el resultado de la búsqueda exacta
function renderSingle(json){
    // Se crean y anexan los elementos necesarios para crear la plantilla del resultado
    $('<div class="card movie"/>').append('<div class="card-left"/>').appendTo('#panel-scroll');
    $('.card.movie').append('<div class="card-right"/>');
    $('.card-left').append(`<h3>${json.Title}</h3><ul class="movie-info"/>`);
    $('<li/>').append(`<b>Año:&nbsp;</b>${json.Year}`).appendTo('.movie-info');
    $('<li/>').append(`<b>Trama:&nbsp;</b>${json.Plot}`).appendTo('.movie-info');
    $('<li/>').append(`<b>Idioma:&nbsp;</b>${json.Language}`).appendTo('.movie-info');
    $('<li/>').append(`<b>Genero(s):&nbsp;</b>${json.Genre}`).appendTo('.movie-info');
    $('<li/>').append(`<b>Actores:&nbsp;</b>${json.Actors}`).appendTo('.movie-info');
    $('<li/>').append(`<b>Duración:&nbsp;</b>${json.Runtime}`).appendTo('.movie-info');

    let ratings = $('<li/>').append("<b>Notas:&nbsp;</b>");
    let ratingList = $('<ul/>');
    json.Ratings.forEach(rating => {
        ratingList.append(`<li>${rating.Source} - ${rating.Value}</li>`);
    });
    ratings.append(ratingList).appendTo('.movie-info');

    $('<li/>').append(`<b>Reseñas:&nbsp;</b>`)
    $('<li/>').append(`<b>Enlace IMDB:&nbsp;</b><a href="https://www.imdb.com/title/${json.imdbID}">https://www.imdb.com/title/${json.imdbID}</a>`).appendTo('.movie-info');
    if(json.hasOwnProperty('totalSeasons'))
        $('<li/>').append(`<b>Temporadas:&nbsp;</b>${json.totalSeasons}`).appendTo('.movie-info');

    $('.card-right').append(`<img src="${json.Poster}">`);
}

// Función utilizada para desplegar los resultados de la búsqueda aproximada
function renderMultiple(array){
     // Se crean y anexan los elementos necesarios para crear la plantilla del resultado
    array.forEach((item, index) => {
        let element = $(`<div id="element_${index}" class="element"/>`);
        let list = $('<ul class="movie-info"/>');
        $('<li/>').append(`<b>Título:&nbsp;</b>${item.Title}`).appendTo(list);
        $('<li/>').append(`<b>Año:&nbsp;</b>${item.Year}`).appendTo(list);
        $('<li/>').append(`<b>Enlace IMDB:&nbsp;</b><a href="https://www.imdb.com/title/${item.imdbID}</a>">https://www.imdb.com/title/${item.imdbID}</a>`).appendTo(list);
        list.appendTo(element);
        element.appendTo('#panel-scroll');
    })
}

// Función utilizada para consultar a la REST API y esperar a su resultado para tomar
// una acción
async function ajaxPoll(data){
    // Se crea una promesa para esperar a que la llamada a la REST API regrese un resultado
    let promise = new Promise((resolve, _reject) => {
        $.ajax({
            url : baseUrl,
            data,
            type : 'GET',
            dataType : 'json',
            success : function(json) {
                // Si el resultado es satisfactorio, se verifica el tipo de consulta para 
                // desplegar el resultado correspondiente
                if(data.hasOwnProperty('s')){
                    multimedia = json.Search;
                    skip = 0;
                    $('.panel-footer').show();
                    $('#panel-scroll').empty();
                    renderMultiple(multimedia.slice(skip,skip+take));
                    $('#page').text(`${skip + 1} - ${skip + take}`);
                    $('#total').text(`${multimedia.length}`);
                    $('.left').prop("disabled", true);
                    if(skip + take < multimedia.length)
                        $('.right').prop("disabled", false);
                }
                else if(data.hasOwnProperty('t')){
                    $('.panel-footer').hide();
                    $('#panel-scroll').empty();
                    renderSingle(json);
                }
            },
            error : function(xhr, status) {
                // Si existe un error en la llamada de la API, se muestra un mensaje de error
                $("#error").show();
            },
            complete : function(xhr, status) {
                // Una vez resuelta la llamada de la API, se completa la promesa
                resolve();
            }
        });
    });

    return promise;
}

// Método para inicializar los valores correspondientes en la interfaz
$(document).ready(function(){
    $("#waiting").hide();
    $("#error").hide();
    $('.left').prop("disabled", true);
    $('.right').prop("disabled", true);
    $('#page').text("0");
    $('#total').text("0");
    $('.panel-footer').hide();
    $("#exact").on('click', function(e){
        $("#error").hide();
        e.preventDefault();
        exactSearch();
    });
    $("#approx").on('click', function(e){
        $("#error").hide();
        e.preventDefault();
        approximatedSearch();
    });
    $(".left").on('click', function(e){
        $('#panel-scroll').empty();
        e.preventDefault();
        changeVisibles('back');
    });
    $(".right").on('click', function(e){
        $('#panel-scroll').empty();
        e.preventDefault();
        changeVisibles('forth');
    });
})

