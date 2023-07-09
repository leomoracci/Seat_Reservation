
import './Airplane.css'
import {useState} from "react";
import {Prenotazione} from "./Varie.jsx";
import API from "../API.jsx";

function Airplane(props) {
    const [dirty, setDirty] = useState(false);
    const [myAlert, setMyAlert] = useState(false);
    if (props.loaded) {
        let postiTotali;
        let postiSelezionati=props.postiSelezionati
        let postiInStandBy = props.postiInStandBy
        const updateSeatReservation = (id, nomeAereo) => {
            setDirty(!dirty)
            postiSelezionati.forEach((e)=>{
                if(nomeAereo==e.nomeAereo){
                    e.posti.push(id)
                }
            })
        }
        const updateSeatReservationRandom = (id, nomeAereo) => {
            setDirty(!dirty)
            postiSelezionati.forEach((e)=>{
                if(nomeAereo==e.nomeAereo){
                    e.posti=[]
                    id.forEach((f)=>{
                        e.posti.push(f)
                    })
                }
            })
        }


        const prenotaPosti = ()=>{
            props.postiSelezionati.forEach((e)=>{
                if(e.nomeAereo==props.airplaneType.name) {
                    API.addPrenotazione(props.airplaneType.id, [...e.posti])
                        .then(()=>{
                            props.updatePostiOccupati()

                        })
                        .catch((element)=>{
                            setTimeout(()=>{
                                props.setPostiInStandBy([])
                                props.updatePostiOccupati()
                                setMyAlert(false)
                            },5000)
                            props.setPostiInStandBy(element.value)
                            setMyAlert(true)
                        })

                }
            })
        }
        const deleteSeatReservation = (id, nomeAereo) => {
            setDirty(!dirty)
            postiSelezionati.forEach((e) => {
                if (nomeAereo == e.nomeAereo) {
                    let index = e.posti.indexOf(id)
                    if (index !== -1) {
                        e.posti.splice(index, 1)
                    }
                }
            })
        }

        postiTotali = props.airplaneType.file * props.airplaneType.posti;
        const buildGrid = () => {
            let f = []
            for (let i = 0; i < props.airplaneType.file; i++) {
                f.push(<Row postiInStandBy = {postiInStandBy} loggedIn={props.loggedIn} dirty = {dirty} postiSelezionati = {postiSelezionati} airplaneType={props.airplaneType} id={i + 1} key={i + 1} postiOccupati={props.postiOccupati} updateSeatReservation={updateSeatReservation}
                            deleteSeatReservation={deleteSeatReservation} seats={props.airplaneType.posti}> </Row>)
            }
            return f
        }

        return (
            <div className="air">
                <div className="air-left">
                    <AirInfo
                        postiSelezionati = {props.postiSelezionati}
                        dirty = {dirty}
                        postiTotali={postiTotali}
                        postiOccupati={props.postiOccupati}
                        airplaneType = {props.airplaneType}
                    >
                    </AirInfo>
                    <Prenotazione myAlert = {myAlert} prenotaPosti = {prenotaPosti} user ={props.user} updateSeatReservation = {updateSeatReservationRandom} postiTotali = {postiTotali} postiOccupati={props.postiOccupati} loggedIn={props.loggedIn} dirty={dirty} aerei={props.aereiList} airplaneType={props.airplaneType}
                                  postiSelezionati={postiSelezionati} changeAereo={props.changeAereo}></Prenotazione>
                </div>
                <div className="air-container">
                    <div className="air-grid overflow-auto">
                        {buildGrid()}
                    </div>
                </div>
            </div>
        )
    }
}
function Row(props){
    let alphabet = ["A","B","C","D","E","F"]

    const generaPosti = () => {
        let n =[];
        for (let i = 0; i < props.seats; i++){
            let state=0;
            let s = ''
            s+=props.id
            s+=alphabet[i]
            props.postiInStandBy.forEach((e)=>{
                if(e.posto !=undefined) {
                    if (e.posto == s) {

                        state = 3
                    }
                }
            })
            props.postiOccupati.forEach((e)=>{
                if(e.posto == s){
                    state=1
                }
            })
            n.push(<Seat loggedIn={props.loggedIn} dirty = {props.dirty} postiSelezionati = {props.postiSelezionati} airplaneType={props.airplaneType} initial_state={state} id = {(alphabet[i])} key = {(i+1)*props.id} updateSeatReservation={props.updateSeatReservation} deleteSeatReservation={props.deleteSeatReservation} rowId = {props.id}></Seat>)

        }
        return n
    }

    return(
        <div className="row-container" id = {props.id}>
            {generaPosti()}
        </div>
    )
}
function Seat(props) {
    let initial_state = props.initial_state
    let stato = 0
    props.postiSelezionati.forEach((e) => {
        if (e.nomeAereo == props.airplaneType.name) {

            e.posti.forEach((p) => {
                let s = ''
                s += props.rowId
                s += props.id
                if (p == s) {
                    stato=2
                }
            })
        }
    })
    const swapSeatState = () => {
        if(props.loggedIn) {
            if (initial_state != 1) {
                if (stato === 0) {
                    let s = ""
                    s += props.rowId
                    s += props.id
                    props.updateSeatReservation(s, props.airplaneType.name)
                } else if (stato === 2) {
                    let s = ""
                    s += props.rowId
                    s += props.id
                    props.deleteSeatReservation(s, props.airplaneType.name)
                }
            }
        }

    }

    return (
        <div onClick={()=>{swapSeatState()}}
             className={'seat-container ' + (props.loggedIn === true? 'cursor-pointer ':' ') + (initial_state === 0 ? 'border-green-500 ': initial_state === 1 ? 'border-red-500 ' : 'border-gray-500') + (stato === 2 ? ' border-yellow-500' : '')}>
            {props.rowId}{props.id}
        </div>
    )
}


function AirInfo(props){
    let postiSelezionatiAereo = 0
    props.postiSelezionati.forEach((e)=>{
        if(e.nomeAereo==props.airplaneType.name){
            postiSelezionatiAereo=e.posti.length
        }
    })
    return(
        <>
        <div className=" air-info">
            <div className="flex justify-center items-center gap-1 header">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.367-1.208.164-1.661.532-.453 1.32-.442 1.761.022.439.466.367 1.209-.164 1.661z"/></svg>
                <div className=" text-2xl italic">Informazioni Aereo</div>
            </div>
            <div className=" air-parametri">
                <div className="flex flex-col h-full my-auto">
                    <div className="air-h-row">
                        <div className="text-xl font-serif text-gray-400">Tipo Aereo:</div>
                        <div className="text-xl font-serif text-gray-700">{props.airplaneType.name}</div>
                    </div>
                    <div className="air-h-row">
                        <div className="text-xl font-serif text-gray-400">Posti Totali:</div>
                        <div className="text-xl font-serif text-gray-700">{props.postiTotali}</div>
                    </div>
                    <div className="air-h-row">
                        <div className="text-xl font-serif text-gray-400">Posti Occupati:</div>
                        <div className="text-xl font-serif text-red-700">{props.postiOccupati.length}</div>
                    </div>
                    <div className="air-h-row">
                        <div className="text-xl font-serif text-gray-400">Posti Liberi:</div>
                        <div className="text-xl font-serif text-green-700">{props.postiTotali-props.postiOccupati.length-postiSelezionatiAereo}</div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Airplane