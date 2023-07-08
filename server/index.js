'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function(username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });

            return done(null, user);
        })
    }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
        done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

const answerDelay = 300;

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

// GET /api/aerei
app.get('/api/aerei', (req, res) => {
    dao.getAereiList()
        .then(aerei => setTimeout(()=>res.json(aerei), answerDelay))
        .catch((err) => {console.log(err); res.status(500).end()});
});

// GET /api/aerei/<id>
app.get('/api/aerei/:id', async (req, res) => {
    try {
        const result = await dao.getPostiOccupatiAereo(req.params.id);
        if(result.error)
            res.status(404).json(result);
        else
            setTimeout(()=>res.json(result), answerDelay);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

// GET /api/aerei/<idAereo>/prenotazione/<idUser>
app.get('/api/aerei/:idAereo', async (req, res) => {
    try {
        const result = await dao.getPrenotazioneAereo(req.params.idAereo, req.user.id);
        if(result.error)
            res.status(404).json(result);
        else
            setTimeout(()=>res.json(result), answerDelay);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get('/api/aerei/:idAereo/posto/:posto', async (req, res) => {
    try {
        const result = await dao.getPostoPrenotato(req.params.idAereo, req.params.posto.toString());
        if(result.error)
            res.status(404).json(result);
        else
            setTimeout(()=>res.json(result), answerDelay);
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

// POST /api/answers
app.post('/api/aerei/:idAereo', isLoggedIn, [
    check('posti').isArray()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const idAereo = req.body.idAereo;
    const resultQuestion = await dao.getPostiOccupatiAereo(idAereo);  // needed to ensure db consistency
    if (resultQuestion.error)
        res.status(404).json(resultQuestion);   // questionId does not exist, please insert the question before the answer
    else {
        const prenotazione = {
            idAereo: req.body.idAereo,
            idUser: req.user.id
        };
        const posti = req.body.posti
        let postoOccupato = false

        //console.log("answer to add: "+JSON.stringify(answer));
        try {
            const postiOccupati = []
            for (const e of posti) {
                await dao.getPostoPrenotato(e, prenotazione.idAereo)
                    .then((element)=>{if(element[0]!=undefined) {
                        postoOccupato=true;
                        postiOccupati.push(element[0])
                    }})

            }
            if(postoOccupato) {
                res.status(503).json({
                    value: postiOccupati,
                    error: ` Ban Database error during the creation of answer ${prenotazione.posto} by ${prenotazione.idUser}.`
                });
            }
        } catch (err) {
            console.log(err);
            res.status(503).json({ error: `Database error during the creation of answer ${posti} by ${prenotazione.idUser}.` });
        }
        if(!postoOccupato) {
            try {
                const prenotazioneId = []
                for (const e of posti) {
                    const index = posti.indexOf(e);
                    prenotazioneId[index] = await dao.createPrenotazione(prenotazione, e);
                }
                // Return the newly created id of the question to the caller.
                // A more complex object can also be returned (e.g., the original one with the newly created id)
                setTimeout(() => res.status(201).json(prenotazioneId), answerDelay);
            } catch (err) {
                console.log(err);
                res.status(503).json({error: `Database error during the creation of answer ${posti} by ${prenotazione.idUser}.`});
            }
        }

    }
});


// DELETE /api/answers/<id>
app.delete('/api/aerei/:idAereo', isLoggedIn, async (req, res) => {
    try {
        const numRowChanges = await dao.deletePrenotazione(req.user.id, req.params.idAereo); // It is WRONG to use something different from req.user.id
        // number of changed rows is sent to client as an indicator of success
        setTimeout(()=>res.json(numRowChanges), answerDelay);
    } catch(err) {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of answer ${req.params.id}.`});
    }
});

/*** Users APIs ***/

// POST /sessions
// login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// DELETE /sessions/current
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
    console.log(`react-qa-server listening at http://localhost:${port}`);
});
