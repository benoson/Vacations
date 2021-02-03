import React from 'react';
import { useHistory } from "react-router-dom";
import { isUserLoggedValidator } from '../../models/IsUserLoggedValidator';
import { store } from '../../Redux/Store';
import { ActionType } from '../../Redux/ActionType';
import axios from 'axios';
import './topNavbar.css';


// ------------------------------------------------- This Component Displays The Top Navigation Bar ------------------------------------------------- //

export default function TopNavbar() {

    const history = useHistory();



    // ------------------------------------------------- Controller ------------------------------------------------- //

    // Handles The User's Request To Logout And Login
    const onUserLoginStautsChange = async () => {
        
        let isUserLogged = isUserLoggedValidator() ;

        if (isUserLogged) {
            
            // Sending a 'logout' request, in order to delete the user from the server's cache
            try {
                await axios.post(`http://localhost:3001/users/logout`);
            }
            catch {}
            finally {
                // Clearing the user's favorite vacations from the Global Store
                store.dispatch({
                    type: ActionType.OnUserLogout
                });
            }
        }
        
        sessionStorage.clear();
        history.push("/login");
    }



    // ------------------------------------------------- View ------------------------------------------------- //
    
    // When the user scrolls down, change the navigation bar
    window.onscroll = () => {
        try {
            const topNavBar = document.querySelector("#topNavbar") as HTMLElement;
            const logStatusBtn = document.querySelector("#logStatusBtn") as HTMLElement;

            if (document.body.scrollTop > 130 || document.documentElement.scrollTop > 130) {
                topNavBar.style.backgroundColor = "#174d5f";
                topNavBar.style.color = "white";
                logStatusBtn.style.color = 'white';
            }
    
            else if (document.body.scrollTop <= 130 || document.documentElement.scrollTop <= 130) {
                topNavBar.style.backgroundColor = "transparent";
                topNavBar.style.color = "#15304c";
                logStatusBtn.style.color = 'blue';
            }
        }
        catch {}
    };


    return (
        <div id="topNavbar" className="topNavbar">

            {isUserLoggedValidator() ? 
                <div className="helloUserSection">
                    {
                        // Displaying The Username In The Navigation Bar
                        JSON.parse(sessionStorage.getItem("userInfo")).userName
                    }

                    <span id="logStatusBtn" onClick={onUserLoginStautsChange} className="topNavItem loginStatusButton">
                            Logout
                        </span>
                </div>
                :
                <div className="helloUserSection">
                    <span id="loginStatusBtn" onClick={onUserLoginStautsChange} className="topNavItem loginStatusButton">
                        Login
                    </span>
                </div>
            }

        </div>
    )
}
