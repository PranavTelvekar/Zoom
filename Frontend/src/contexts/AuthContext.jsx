import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import server from "../environment"

export const AuthContext = createContext({})

const client = axios.create({
  baseURL: `http://${server}/api/v1/users`  // Ensure http:// is included
})

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password
      });

      if (response.status === 201) {  // Use 201 directly for creation
        return response.data.message;
      }
    } catch (err) {
      throw err;
    }
  }

  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {  // Use /login for authentication
        username,
        password
      });

      if (response.status === 200) {  // 200 for success
        localStorage.setItem("data", response.data.token);
        navigate('/');  // Redirect to homepage after login
      }
    } catch (err) {
      throw err;
    }
  }


  const getHistoryOfUser=async()=>{
    try {
      let request=await client.get("/get_all_activity",{
        params:{
          token:localStorage.getItem("token")
        }
      })

      return request.data;
    } catch (error) {
      throw error;
    }
  }

  const addToUserHistory=async(meetingCode)=>{
    try {
      let request=await client.post("/add_to_activity",{
        token:localStorage.getItem("tokent"),
        meeting_code:meetingCode
      })
      return request
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ userData, setUserData, handleRegister, handleLogin , getHistoryOfUser , addToUserHistory}}>
      {children}
    </AuthContext.Provider>
  )
}
