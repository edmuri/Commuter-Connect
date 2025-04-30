import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './Styles/Login.css'
import train from '../assets/train.svg'

import {useNavigate} from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValid, setIsValid] = useState(true);

    const handleLogIn = () => {
        console.log("Sign In Button Clicked")
        let path = `/schedule`; 
        if (email.length === 0 || password.length === 0) {
            // Array is empty
            setIsValid(false)

        }else{
            navigate(path);
            // loadUserSettings()
        }
        
    };

    async function loadUserSettings(){

        let path = `/schedule`; 

        if(email === "UIC_Admin"){
            path = `/nearby`; 
        }

        let response = await fetch(`http://127.0.0.1:5000/getUserInfo?userID=${email}&password=${password}`,{
            method:'GET',
            mode: 'cors',
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json'
            }
        })

        let data = await response.json();

        console.log(data);

        let responseMessage = data['Response'];
        console.log(responseMessage);
        if(responseMessage == "All good!"){
            navigate(path);
            setIsValid(false);
            //change front end to the schedule page 
            // with all the information added
        }
        else if(responseMessage == "Wrong Password"){
            //Display wrong password to user
        }
        else{
            //Display User does not exist
        }
    };

    const handleSignUp = () => {
        console.log("Sign Up Button Clicked")
        let path = `/signup`; 
        navigate(path);
        
    };

    let navigate = useNavigate();
    

  return (
    <div className='login'>
        <div className='leftContainer'>

            <img className="train" src={train}/>
            <div id="welcomeText">
                <h3>Welcome to</h3>
                <h1>Commuter Connect</h1>
            </div>

        </div>

        <div className='log-in-container'>
            
            <div className="emailpassInput">
                <p>Email</p>
                <input
                    style={{borderColor: isValid ? '#769EB8': 'red',}}
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
            </div>
            
            <div className="emailpassInput">
                <p>Password</p>
                <input
                    style={{borderColor: isValid ? '#769EB8': 'red',}}
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
            </div>
            
            <button id="login-button" onClick={handleLogIn}>Log In</button>

            <div id="sign-up-link">
                <p>New to Commuter Connect?</p>
                <p onClick={handleSignUp} style={{ cursor: 'pointer', textDecoration: "underline" }}>Create an account.</p>
            </div>
            


        </div>

    </div>
  )
}

export default Login