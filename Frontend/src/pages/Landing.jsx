import React from "react";
import "../App.css"
import {Link} from "react-router-dom"

export default function Landing(){
    const router = useNavigate();
    return(
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Hare Krishna</h2>
                </div>
                <div className="navList">
                     <p onClick={() => {
                        router("/123")
                    }}>Join as Guest</p>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>
            <div className="landingPageMainContainer">
                <div>
                    <h1><span style={{color:"#FF9839"}} >Connect</span> With Your Loved Ones</h1>
                    <p>Cover A Distance By Hare Krishna</p>
                    <div role="button">
                        <Link to="/auth" >Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/public/mobile.jpeg" alt="" />
                </div>
            </div>
        </div>
    )
}
