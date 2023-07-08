/**
 * All the API calls
 */


const URL = 'http://localhost:3001/api';

async function getAereiList() {
    // call  /api/questions
    const response = await fetch(URL+'/aerei');
    const aerei = await response.json();
    if (response.ok) {
        return aerei.map((e) => ({ id: e.id, name: e.name, file: e.file, posti: e.posti }) )
    } else {
        throw aerei;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
}

async function getPostiOccupatiAereo(id) {
    // call  /api/questions/<id>
    const response = await fetch(URL+`/aerei/${id}`);
    const postiOccupati = await response.json();
    if (response.ok) {
        if(postiOccupati[0]==undefined){
            return 'empty'
        }
        return postiOccupati.map((e)=>({id: e.id, idAereo: e.idAereo, idUser: e.idUser, posto: e.posto}))
    } else {

        throw postiOccupati;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
}

async function getPrenotazioneAereo(idAereo) {
    // call  /api/questions/<id>/answers
    const response = await fetch(URL+`/aerei/${idAereo}`);
    const prenotazione = await response.json();
    if (response.ok) {
        return prenotazione.map((e) => ({id: e.id, idAereo: e.idAereo, idUser: e.idUser, posto: e.posto}) );
    } else {
        throw prenotazione;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
}
async function getPosto(idAereo,posto) {
    // call  /api/questions/<id>/answers
    const response = await fetch(URL+`/aerei/${idAereo}/posto/${posto}`);
    const prenotazione = await response.json();
    if (response.ok) {
        return prenotazione.map((e) => ({posto: e.posto}) );
    } else {
        throw prenotazione;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
    }
}


function addPrenotazione(idAereo, posti) {
    // call  POST /api/answers
    return new Promise((resolve, reject) => {
        fetch(URL+`/aerei/${idAereo}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({idAereo: idAereo, posti: [...posti]}),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((id) => resolve(id))
                    .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function deletePrenotazione(idAereo) {
    // call  DELETE /api/answers/<id>
    return new Promise((resolve, reject) => {
        fetch(URL+`/aerei/${idAereo}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}



async function logIn(credentials) {
    let response = await fetch(URL + '/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logOut() {
    await fetch(URL+'/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
}

async function getUserInfo() {
    const response = await fetch(URL+'/sessions/current', {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}



const API = {
    getAereiList, getPostiOccupatiAereo, getPrenotazioneAereo, addPrenotazione, deletePrenotazione, getPosto,
    logIn, logOut, getUserInfo
};
export default API;