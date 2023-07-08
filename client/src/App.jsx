
import './App.css'
import {BrowserRouter, Routes, Route, Outlet, Link, Navigate} from 'react-router-dom';
import Airplane from "./components/Airplane.jsx";
import {useEffect, useState} from "react";
import {UtenteInfo, Title, DettagliPrenotazione} from "./components/Varie.jsx";
import {LoginForm} from "./components/LoginForm.jsx";
import API from "./API.jsx";
function App() {

    return (
    <BrowserRouter>
        <Main/>
    </BrowserRouter>

  )
}

function Main(){

    const [loggedIn, setLoggedIn] = useState(false);
    const [logging, setLogging] = useState(false)
    const [dirty, setDirty] = useState(true);
    const [user, setUser] = useState(undefined);


    useEffect(()=> {
        const checkAuth = async() => {
            try {
                // here you have the user info, if already logged in
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch(err) {
                // NO need to do anything: user is simply not yet authenticated
                //handleError(err);
            }
        };
        checkAuth()
    }, []);

    const removeLoginButton = ()=>{
        setLogging(true)
    }
    const addLoginButton = ()=>{
        setLogging(false)
    }
    const putDirtyOn = ()=>{
        setDirty(!dirty)
    }
    const loginSuccessful = (user) => {
        setUser(user);
        setLoggedIn(true);
    }
    const doLogOut = () => {
        API.logOut()
        setLogging(false)
        setLoggedIn(false)
        setUser(undefined)
    }

    return(
        <Routes>
            <Route path="/" element={<>
                <Title doLogOut = {doLogOut} removeLoginButton={removeLoginButton} logging = {logging} loggedIn = {loggedIn}></Title>
                <Outlet></Outlet>
            </>}>
                <Route path="" element={<HomePage user = {user} putDirtyOn = {putDirtyOn} loggedIn = {loggedIn} dirty = {dirty}/>}/>
                <Route path="login" element={loggedIn? <Navigate replace to='/' />:  <LoginForm addLoginButton = {addLoginButton} loginSuccessful={loginSuccessful} />} />
            </Route>
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    )
}

function NotFoundPage() {
    return(
    <>
        <div className={"bg-amber-700"} style={{"textAlign": "center", "paddingTop": "5rem"}}>
            <h1>
                <i className="bi bi-exclamation-circle-fill"/>
                {" "}
                The page cannot be found
                {" "}
                <i className="bi bi-exclamation-circle-fill"/>
            </h1>
            <br/>
            <p>
                The requested page does not exist, please head back to the <Link to={"/"}>app</Link>.
            </p>
        </div>
    </>
    );
}

function HomePage(props) {

    const [errorMsg, setErrorMsg] = useState('');
    const [aerei, setAerei] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [postiOccupati, setPostiOccupati] = useState();
    const [airplaneType, setAirplaneType] = useState({});
    const [postiInStandBy, setPostiInStandBy] = useState([])
    let postiSelezionati = [{nomeAereo : 'locale', posti:[]},{nomeAereo : 'regionale', posti:[]}, {nomeAereo : 'internazionale', posti:[]}];
    let prenotazione

    function handleError(err) {
        console.log('err: '+JSON.stringify(err));  // Only for debug
        let errMsg = 'Unkwnown error';
        if (err.errors) {
            if (err.errors[0])
                if (err.errors[0].msg)
                    errMsg = err.errors[0].msg;
        } else if (err.error) {
            errMsg = err.error;
        }

        setErrorMsg(errMsg);
        setTimeout(()=>props.putDirtyOn(), 2000);  // Fetch correct version from server, after a while
    }

    useEffect( () => {
        API.getAereiList()
            .then((aereiList) => {
                setAerei(aereiList);
                setAirplaneType(aereiList[0])
                API.getPostiOccupatiAereo(aereiList[0].id)
                    .then((pOccupati) => {
                        if (pOccupati=='empty'){
                            setPostiOccupati([]);
                            setLoaded(true)
                        }
                        else {
                            setPostiOccupati(pOccupati);
                            setLoaded(true)
                        }

                    })
                    .catch((err) => {
                        handleError(err)})
            })
            .catch((err) => handleError(err));
    }, []);
    const changeAereo = (e) =>{

        setAirplaneType(e)
        API.getPostiOccupatiAereo(e.id)
            .then((pOccupati) => {
                if (pOccupati=='empty'){
                    setPostiOccupati([]);
                }
                else {
                    setPostiOccupati(pOccupati);
                }
            })
            .catch((err) => handleError(err));

    }
    const updatePostiOccupati = () => {
        API.getPostiOccupatiAereo(airplaneType.id)
            .then((pOccupati) => {
                if (pOccupati=='empty'){
                    setPostiOccupati([]);
                }
                else {
                    setPostiOccupati(pOccupati);
                }
            })
            .catch((err) => handleError(err));
    }


    const pushPrenotazione = (pren) => {
        prenotazione = pren
    }
    const updatePostiInStandBy = (p) => {
        setPostiInStandBy(p)
    }

    const cancellaPrenotazione = () => {
        if(prenotazione) {
            API.deletePrenotazione(airplaneType.id).then(()=>{
                updatePostiOccupati()
            })
        }
    }

    return(
        <div className={" main"}>
            <div className={"card left"}>
                <div className={"card info"}>
                    <UtenteInfo pushPrenotazione = {pushPrenotazione} loaded ={loaded} postiOccupati = {postiOccupati} user = {props.user} loggedIn={props.loggedIn}></UtenteInfo>
                </div>
                <div className={"card body"}>
                    <DettagliPrenotazione  prenotazione = {prenotazione} cancellaPrenotazione = {cancellaPrenotazione} user = {props.user} loaded ={loaded} postiOccupati = {postiOccupati} loggedIn={props.loggedIn}></DettagliPrenotazione>
                </div>
            </div>
            <div className={"card airplane"}>
               <Airplane setPostiInStandBy={updatePostiInStandBy} updatePostiOccupati = {updatePostiOccupati} user = {props.user} prenotazione = {prenotazione} loggedIn={props.loggedIn} postiSelezionati = {postiSelezionati} loaded ={loaded} aereiList = {aerei} airplaneType = {airplaneType} changeAereo = {changeAereo} postiOccupati ={postiOccupati} postiInStandBy = {[...postiInStandBy]}></Airplane>
            </div>
        </div>
    )
}

export default App
