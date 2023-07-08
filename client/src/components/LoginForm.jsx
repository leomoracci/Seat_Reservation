import {useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../API.jsx";


function LoginForm(props) {
    const[username, setUsername] = useState('leo@test.com');
    const[password, setPassword] = useState('pwd');
    const[errorMessage, setErrorMessage] = useState('') ;

    const navigate = useNavigate();

    const doLogIn = (credentials) => {
        API.logIn(credentials)
            .then( user => {
                setErrorMessage('');
                props.loginSuccessful(user);
            })
            .catch(() => {
                // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
                setErrorMessage('Wrong username and/or password');
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        const credentials = { username, password };

        // SOME VALIDATION, ADD MORE if needed (e.g., check if it is an email if an email is required, etc.)
        let valid = true;
        if(username === '' || password === '')
            valid = false;

        if(valid)
        {
            doLogIn(credentials);
        } else {
            // TODO: show a better error message...
            setErrorMessage('Error(s) in the form, please fix it/them.')
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div
                    className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Entra Con Il Tuo Account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                <input type="email" name="email" id="email"  placeholder="leo@test.com" defaultValue={username} onChange={()=>{setUsername(event.target.value)}}
                                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                       required=""/>
                            </div>
                            <div>
                                <label htmlFor="password"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input type="password" name="password" placeholder="••••••••" id="password" defaultValue={password} onChange={()=>{setPassword(event.target.value)}}
                                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                       required=""/>
                            </div>
                            <div className="flex justify-around gap-4">
                                <button
                                    className="w-full text-gray-600 hover:text-white bg-red-100 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"  onClick={()=>{
                                        props.addLoginButton();
                                        navigate('/')
                                    }}>Cancel
                                </button>
                                <button type="submit"
                                        className="w-full text-gray-600 hover:text-white bg-blue-100 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in
                                </button>
                            </div>
                        </form>
                        <div className='text-red-500 flex justify-center'>
                            {errorMessage}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export {LoginForm}