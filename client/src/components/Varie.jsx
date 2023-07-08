import './Varie.css'
import {useNavigate} from "react-router-dom";
function UtenteInfo(props){
    function checkPrenotazione(){
        let pren = false
        props.postiOccupati.forEach((element)=>{
            if(element.idUser == props.user.id) {
                if (element.idUser == props.user.id) {
                    pren = true
                }
            }
        })
        props.pushPrenotazione(pren)
        if(pren){
            return 'SI'
        }
        else {
            return 'NO'
        }

    }

    if(props.loggedIn && props.loaded) {
        return (
            <div className="user-info">
                <div className="flex items-center gap-1 header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path
                            d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.367-1.208.164-1.661.532-.453 1.32-.442 1.761.022.439.466.367 1.209-.164 1.661z"/>
                    </svg>
                    <div className=" text-2xl italic">Informazioni Utente</div>
                </div>
                <div className="user-parametri">
                    <div className="flex flex-col h-full my-auto">
                        <div className="user-h-row">
                            <div className="text-xl font-serif text-gray-400">ID Utente:</div>
                            <div className="text-xl font-serif text-gray-700">{props.user.id}</div>
                        </div>
                        <div className="user-h-row">
                            <div className="text-xl font-serif text-gray-400">Nome Utente:</div>
                            <div className="text-xl font-serif text-gray-700">{props.user.name}</div>
                        </div>
                        <div className="air-h-row">
                            <div className="text-xl font-serif text-gray-400">Prenotazione:</div>
                            <div className="text-xl font-serif text-green-700">{checkPrenotazione()}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return(
            <div className="user-info">
                <div className="flex items-center gap-1 header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path
                            d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.367-1.208.164-1.661.532-.453 1.32-.442 1.761.022.439.466.367 1.209-.164 1.661z"/>
                    </svg>
                    <div className=" text-2xl italic">Informazioni Utente</div>
                </div>
            </div>
        )
    }
}

function Prenotazione(props){

    let postiRandomSelezionati =0
    let prenotazione=false
    const handleChange = () =>{
        const aereo = JSON.parse(event.target.value)
        props.changeAereo(aereo)
    }

    const deletePrenotazione = () =>{
        props.updateSeatReservation([], props.airplaneType.name)

    }
    const checkAlert = () =>{
        if(props.myAlert){
            return 'Prenotazione annullata perchè i posti evidenziati in grigio sono occupati'
        }
        else {
            return ''
        }
    }

    function checkPrenotazione(){
        props.postiOccupati.forEach((element)=>{
            if(element.idUser == props.user.id) {
                if (element.idUser == props.user.id) {
                    prenotazione = true
                }
            }
        })
    }

    const handleSubmit = (e) =>{

        event.target[0].value=0
        let alphabet = ["A","B","C","D","E","F"]
        let posti = props.airplaneType.posti
        let postiSel = []
        e.preventDefault()
        let count = posti;
        let push=true
        while ((!push || postiSel.length<postiRandomSelezionati) && count<props.postiTotali){
            let s=''
            push=true
            s=Math.floor(count/posti)
            s+=alphabet[count%posti]
            props.postiOccupati.forEach((e) => {
                if (e.posto == s ) {
                    push=false
                }
            })
            if(push==true){
                postiSel.push(s)
            }
            count++
        }
        props.updateSeatReservation(postiSel, props.airplaneType.name)
    }

    function checkLog() {
        if (props.loggedIn) {
            checkPrenotazione()
            if (props.loggedIn && !prenotazione) {
                return <div className='h-full w-full'>
                            <div className="user-h-row">
                                <div className="text-xl font-serif text-gray-400">Posti Selezionati:</div>
                                <div className="text-xl text-gray-700">{buildStringPostiSelezionati()}</div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-xl font-serif text-gray-400">Seleziona Posti Casuali:</div>
                                <form className="flex gap-5 items-center" onSubmit={handleSubmit}>
                                    <input
                                        className="text-xl font-sans resize-none max-h-8 w-1/6 rounded-md border border-gray-400"
                                        type="number" defaultValue={0}
                                        onChange={() => postiRandomSelezionati = event.target.value}/>
                                    <input
                                        className="input rounded-full border-4 border-yellow-500 hover:bg-yellow-200 hover:shadow-xl shadow-blue-500 text-xl font-serif p-4"
                                        type="submit" value="Genera"/>

                                </form>
                            </div>
                            <div className="h-1/2 flex items-center gap-4 ">
                                <div className="w-1/3 h-1/2">
                                    <button
                                        className="font-sans h-full w-full rounded-full border-4 border-red-500 hover:bg-red-200 hover:shadow-xl shadow-red-500" onClick={deletePrenotazione}> Rimuovi posti selezionati
                                    </button>
                                </div>
                                <div className="w-2/3 h-1/2">
                                    <button
                                        className="text-2xl font-sans h-full w-full rounded-full border-4 border-blue-500 hover:bg-blue-200 hover:shadow-xl shadow-blue-500" onClick={props.prenotaPosti}> Prenota
                                    </button>
                                </div>
                            </div>
                        </div>;
            }
        }
        return <></>;
    }

    const buildStringPostiSelezionati = () =>{
        let s = ""
        props.postiSelezionati.forEach((element)=>{

            if(element.nomeAereo==props.airplaneType.name){
                element.posti.forEach((e)=>{
                    s+=e+" "
                })


            }
        })
        return(
            <div> {s} </div>
        )
    }

    return(
        <div className="user-info">
            <div className="flex items-center gap-1 header">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M4.058 5.284c1.3.313 14.092 3.764 19.2 5.128.447.131.703.484.738.877.009.1 0 .198-.019.298-.863 3.579-1.906 7.115-2.86 10.673-.133.45-.49.702-.878.736-.101.01-.198.002-.298-.017-6.439-1.551-12.8-3.418-19.199-5.128-.456-.134-.704-.492-.738-.877-.009-.1 0-.199.018-.297.864-3.581 1.907-7.117 2.86-10.674.157-.525.631-.82 1.176-.719m-1.832 10.893l17.216 4.601 2.331-8.692c-4.785-1.279-17.215-4.599-17.215-4.599-.778 2.896-1.555 5.794-2.332 8.69m16.148 3.479l.258-.963-2.717-.717-.259.965 2.718.715zm-5.019-1.325l.966.262.444-1.658-.965-.262-.445 1.658zm5.708-1.328l.259-.965-2.718-.717-.26.965 2.719.717zm-12.949-3.539l2.176-.869-2-2 .689-.276 3.381 1.448 1.725-.689c.456-.185 1.173-.068 1.311.276l.023.18c-.028.338-.403.77-.782.924l-1.725.688-1.449 3.379-.691.275.07-2.827-2.177.869-.514 1.006-.484.192-.037-1.585-1.065-1.172.482-.193 1.067.374zm7.945 2.242l.966.262.503-1.875-.967-.261-.502 1.874zm5.449-.434l.259-.966-2.719-.716-.258.965 2.718.717zm.465-1.768l.259-.965-2.718-.717-.259.966 2.718.716zm-5.153-.638l.967.261.444-1.658-.966-.261-.445 1.658zm-7.641-8.495c4.259-1.125 8.533-2.2 12.788-3.337.143-.035.208-.035.299-.034.427.028.765.27.912.691.678 2.297 1.28 4.614 1.88 6.931l-2.256-.604-1.283-4.794-8.318 2.223-4.022-1.076z"/></svg>                <div className=" text-2xl italic">Prenotazione</div>
            </div>
            <div className="user-parametri">
                <div className="flex flex-col w-full h-full p-4 my-auto">
                    <div className='h-1/3'>
                        <div className='alert'>{checkAlert()}</div>
                        <div className="prenotazione-1">
                            <div className="text-xl font-serif text-gray-400">Seleziona Aereo:</div>
                            <select defaultValue={props.airplaneType} className='cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' onChange={handleChange} >
                                <option value={JSON.stringify(props.aerei[0])}>{props.aerei[0].name}</option>
                                <option value={JSON.stringify(props.aerei[1])}>{props.aerei[1].name}</option>
                                <option value={JSON.stringify(props.aerei[2])}>{props.aerei[2].name}</option>
                            </select>
                        </div>
                    </div>

                    <div className="prenotazione-container">
                        {checkLog()}
                    </div>
                </div>
            </div>
        </div>
    )
}
function DettagliPrenotazione(props){

    let numPostiOccupati = 0
    let idPosti =''

    function checkPrenotazione(){
        props.postiOccupati.forEach((element)=>{
            if(element.idUser == props.user.id) {
                idPosti+=element.posto+' '
                numPostiOccupati++
            }
        })
    }

    function showButton() {
        if (numPostiOccupati == 0) {
            return <div></div>
        } else {
            return (<button
                className={"font-sans h-full w-full rounded-full border-4 border-red-500 shadow-red-500 hover:shadow-xl hover:bg-red-200 "}
                onClick={props.cancellaPrenotazione}> Cancella Prenotazione
            </button>)
        }
    }


    function checkLog() {
        if (props.loggedIn && props.loaded) {
            checkPrenotazione()
            return <>
                <div className="flex items-center gap-1 header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.367-1.208.164-1.661.532-.453 1.32-.442 1.761.022.439.466.367 1.209-.164 1.661z"/></svg>
                    <div className=" text-2xl italic">Dettagli Prenotazione</div>
                </div>
                <div className="pren-parametri">
                    <div className="flex flex-col h-full my-auto w-full">
                        <div className="pren-h-row">
                            <div className="text-xl font-serif text-gray-400">Numero Posti:</div>
                            <div className="text-xl font-sans text-gray-700">{numPostiOccupati}</div>
                        </div>
                        <div className="pren-h-row">
                            <div className="text-xl font-serif text-gray-400">ID Posti:</div>
                            <div className="text-xl text-gray-700">{idPosti}</div>
                        </div>
                        <div className="flex items-center gap-2 h-1/4 w-2/5">
                            {showButton()}
                        </div>
                    </div>
                </div>
            </>;
        }
        return <></>;
    }
    return(
        <div className="pren-info ">
            {checkLog()}
        </div>
    )
}

function Title(props){

    const navigate = useNavigate();


    return(
        <div className=" box-border border-8 p-4 border-b-4 flex items-center justify-around">
            <div className=" h-full flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23 0l-4.5 16.5-6.097-5.43 5.852-6.175-7.844 5.421-5.411-1.316 18-9zm-11 12.501v5.499l2.193-3.323-2.193-2.176zm-8.698 6.825l-1.439-.507 5.701-5.215 1.436.396-5.698 5.326zm3.262 4.287l-1.323-.565 4.439-4.503 1.32.455-4.436 4.613zm-4.083.387l-1.481-.507 8-7.89 1.437.397-7.956 8z"/></svg>
                <div className="text-4xl font-sans">
                    Prenotazione Posto Aereo
                </div>
            </div>
            <div className="h-full w-1/12">
                {props.loggedIn? <button className="text-2xl font-sans h-full w-full rounded-full border-8 border-blue-500 hover:bg-blue-200 hover:shadow-xl shadow-blue-500" onClick={()=>{
                        props.doLogOut();
                    }
                    }>Logout</button>:
                    props.logging? <div></div>:
                    <button className="text-2xl font-sans h-full w-full rounded-full border-8 border-blue-500 hover:shadow-xl hover:bg-blue-200 shadow-blue-500" onClick={()=>{
                        props.removeLoginButton();
                        navigate('/login');
                    }
                    }>Login </button> }
            </div>
        </div>
    )
}






export {UtenteInfo, Title, Prenotazione, DettagliPrenotazione}