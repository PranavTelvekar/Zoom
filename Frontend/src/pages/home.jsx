import React, { useContext, useState } from "react";

import withAuth from "../utils/withAuth"
import { useNavigate } from "react-router-dom";

import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

import "../App.css"
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent(){

    let navigate=useNavigate()

    const [meetingCode,setMeetingCode]=useState("")

    const {addToUserHistory} =useContext(AuthContext)

    let handleJoinVideoCall=async()=>{
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }


    return(
        <>
        
            <div className="navBar">
                <div style={{display:"flex",alignItems:"center"}}>

                    <h3>Hare Krishana</h3>
                </div>

                <div style={{display:"flex",alignItems:"center"}}>
                    <IconButton onClick={
                        ()=>{ navigate("/history")}
                    }>
                        <RestoreIcon/>
                        <p>History</p>
                    </IconButton>

                    <Button onClick={()=>{

                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout

                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{display:"flex",gap:"10px"}}>
                            <TextField onChange={e=>setMeetingCode(e.target.value)}></TextField>
                            <Button onClick={handleJoinVideoCall}variant="contained">Join Call</Button>

                        </div>
                        
                    </div>
                </div>

                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        
        </>
    )
}


//export default withAuth(HomeComponent)

export default HomeComponent