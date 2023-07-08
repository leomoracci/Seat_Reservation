'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('prenotazione_posti.sqlite', (err) => {
    if(err) throw err;
});

// get all aerei
exports.getAereiList = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT aerei.id,name,file,posti FROM aerei';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const aerei = rows.map((e) => ({ id: e.id, name: e.name, file: e.file, posti: e.posti }));
            resolve(aerei);
        });
    });
};

// get i posti prenotati by {id}
exports.getPostiOccupatiAereo = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT postiPrenotati.id,idAereo,idUser,posto FROM postiPrenotati WHERE postiPrenotati.idAereo = ?';
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const listaPostiOccupati = rows.map((e) => ({
                id: e.id,
                idAereo: e.idAereo,
                idUser: e.idUser,
                posto: e.posto}));
            resolve(listaPostiOccupati);
        });
    });
};

exports.getPostoPrenotato = (posto, aereo) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT postiPrenotati.posto FROM postiPrenotati WHERE postiPrenotati.posto = ? AND postiPrenotati.idAereo = ?';
        db.all(sql, [posto, aereo], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const posto = rows.map((e) => ({posto: e.posto }));
            resolve(posto);
        });
    });
};

// get all answers
exports.getPrenotazioneAereo = (idAereo, idUser) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT postiPrenotati.id,idAereo,idUser,posto FROM aerei JOIN postiPrenotati ON aerei.id = postiPrenotati.idAereo WHERE aerei.id = ? AND postiPrenotati.idUser = ?';

        db.all(sql, [idAereo, idUser],(err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const listaPostiPrenotati = rows.map((e) => (
                {
                    id: row.id, idAereo: row.idAereo, idUser: row.idUser, posto: row.posto
                }));

            resolve(listaPostiPrenotati);
        });
    });
};


// add a new answer
exports.createPrenotazione = (prenotazione, posto) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO postiPrenotati(idAereo, idUser, posto) VALUES(?, ?, ?)';
        db.run(sql, [prenotazione.idAereo, prenotazione.idUser, posto], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// delete an existing answer
exports.deletePrenotazione = (idUser, isAereo) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM postiPrenotati WHERE idUser = ? AND idAereo = ?';  // Double-check that the answer belongs to the userId
        db.run(sql, [idUser, isAereo], function (err) {
            if (err) {
                reject(err);
                return;
            } else
                resolve(this.changes);  // return the number of affected rows
        });
    });
}
