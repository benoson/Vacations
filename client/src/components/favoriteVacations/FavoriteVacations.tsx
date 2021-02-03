import React, { Component } from 'react';
import axios from 'axios';
import Vacation from '../../models/Vacation';
import { store } from '../../Redux/Store';
import { Unsubscribe } from 'redux';
import { ActionType } from '../../Redux/ActionType';
import {withRouter} from 'react-router';
import { isUserLoggedValidator } from '../../models/IsUserLoggedValidator';
import { interceptorHandler } from '../../models/InterceptorHandler';
import FavoriteVacationComponent from '../vacationComponent/FavoriteVacationComponent';
import { getUserTypeFromStorage } from '../../models/GetUserTypeFromStorage';
import { getUserInfoFromServerCache } from '../../models/GetUserInfoFromServerCache';
import socketIOClient from "socket.io-client";
import './favoriteVacations.css';


// ------------------------------------------------- This Component Displays All The User's Favorite Vacations ------------------------------------------------- //

interface VacationsState {
    favoriteVacations : Vacation[];
}

export class FavoriteVacations extends Component <any, VacationsState> {
    
    private unSubscribeStore : Unsubscribe;
    private userNameFromServerCache: string;
    private socket: any;

    constructor(props : any) {
        super(props);

        this.state = {
            favoriteVacations : new Array <Vacation> ()
        }
    }


    // ------------------------------------------------- Component Settings ------------------------------------------------- //
    
    componentWillUnmount = () => {

        // Unsubscribing the store's listener right before the component will unmount
        // In order to make a small optimization
        this.unSubscribeStore();

        try {
            // Disconnecting from the socket connection
            this.socket.disconnect();
        }
        catch {}
    }

    componentDidMount = async () => {

        // Explanation -> The interceptor is a just JS variable (from axios library). On refresh = it resets.
        // So, this Model takes the token the user got from the server (which is now inside the sessionStorage),
        // and assign it to the interceptor
        interceptorHandler();

        const isUserLogged = isUserLoggedValidator();
        if (isUserLogged) {
            
            const userInfoFromServerCache: {userType: string, userName: string} = await getUserInfoFromServerCache();
            this.userNameFromServerCache = userInfoFromServerCache.userName;

            // Initiating the Socket connection to the server
            this.initiateSocket();
        }

        // Optimizing a bit the memory leak of the store listener
        // Also subscribes automatically to the store
        this.unSubscribeStore = store.subscribe(
            () => this.setState ({
                favoriteVacations: store.getState().favoriteVacations
            })
        );

        // Checks whether the user's favorite vacations exist in the Global Store
        this.checkIfGlobalStoreHasFavoriteVacations();
    }



    // ------------------------------------------------- Model ------------------------------------------------- //

    private getFavoriteVacationsFromServer = async () => {
        
        // Explanation -> 2 layers validation:
        // Using a Model I made to check if the user is 'USER' type, and if so, attempt to fetch his favorite vacations.
        // This validation happens again in the server, using the server's cache, to MAKE SURE he is indeed a 'USER' type.
        // If the validation fails in the server, the request will not retrieve any favorite vacations.
        // This validation happens to speed up proccesses and for better UX -> Not seding a request to the server if not absolutely necessary!
        
        const userTypeFromStorage = getUserTypeFromStorage();

        if (userTypeFromStorage === "USER") {

            try {

                // The response we get, should be type of 'Vacation' class
                const response = await axios.get<Vacation[]>('http://localhost:3001/vacations/favorite_vacations');
                
                // Here we are receiving all the user's favorite vacations from the server, as a JSON
                const favoriteVacations : Vacation[] = response.data;
    
                // Updating the Global Store
                store.dispatch({
                    type: ActionType.GetFavoriteVacations,
                    payload: favoriteVacations
                });
            }
    
            catch (error) {
    
                try {
                    let errorMessage = error.response.data.error;
                    this.favoriteVacationsErrorHandler(errorMessage);
                }
                catch {
                    this.favoriteVacationsErrorHandler(error);
                }
            }
        }
    }

    private removeClickedVacationFromFavorites = async (clickedVacationID : number) => {

        /*
            Before unfollowing a vacation, checking if the user is currently logged in.
            This validation happens because a user might delete his token before trying
            to unfollow a vacation. In that case, throw him out to login again. -> Don't waste a server request on him.
        */

        // Using a Model I made to check if the user is still logged (Preventing duplication of code from all component that needs to make this validation).

        const isUserLogged = isUserLoggedValidator();

        if (isUserLogged) {

            interceptorHandler();

            // Defining all 'like' buttons in order to disable them until the request is done
            const likeButtonsNodeList = document.getElementsByClassName("likeBtn");
            const likeButtonsArr = Array.from(likeButtonsNodeList) as HTMLButtonElement[];

            try {

                this.disableButtonsGroup(likeButtonsArr);

                // The response we get, should be type of 'Vacation' class
                await axios.post(`http://localhost:3001/vacations/unfollow_vacation/${clickedVacationID}`);
       
                // Emitting a socket message to the server, in order to inform all clients about the new unfollowed vacation in the UI
                const socketInfo = {
                    clickedVacationID,
                    userName: this.userNameFromServerCache
                };

                this.socket.emit('decrease-vacation-followers-count', socketInfo);
            }
    
            catch (error) {
                let errorMessage = error.response.data.error;
                this.favoriteVacationsErrorHandler(errorMessage);
            }

            finally {
                this.enableButtonsGroup(likeButtonsArr);
            }
        }


        // In case a guest tried to follow a vacation, send him to the login page in order for him to login (a guest is not logged in)
        else {
            this.props.history.push('/login');
        }
    }



    // ------------------------------------------------- Controller ------------------------------------------------- //

    private OnUserDislikeClick = (clickedVacation : Vacation) => {

        let clickedVacationID: number = clickedVacation.vacationID;
        this.removeClickedVacationFromFavorites(clickedVacationID);
    }

    private checkIfGlobalStoreHasFavoriteVacations = () => {

        // If our favorite vacations state in the global store is empty, fetch the favorite vacations from the server and insert them to the global store

        const favoriteVacationsInGlobalStore = store.getState().favoriteVacations;

        if (favoriteVacationsInGlobalStore.length === 0) {
            this.getFavoriteVacationsFromServer();
        }

        // If we have the user's favorite vacations in the Global Store, fetch them instead of sending a request to the server
        else {
            this.setState ({
                favoriteVacations: favoriteVacationsInGlobalStore
            });
        }
    }

    private initiateSocket = () => {

        // Connecting to the server's Socket
        const userTokenForSocketIdentification = JSON.parse(sessionStorage.getItem('userInfo')).token;
        this.socket = socketIOClient('http://localhost:3002', { query: "userToken=" + userTokenForSocketIdentification});
    }



    // ------------------------------------------------- View ------------------------------------------------- //

    private disableButton = (button : HTMLButtonElement) : void => {
        button.disabled = true;
        button.style.cursor = "not-allowed";
    }

    private enableButton = (button : HTMLButtonElement) : void => {
        button.disabled = false;
        button.style.cursor = "pointer";
    }

    private disableButtonsGroup = (buttonsGroup : HTMLButtonElement[]) => {

        for (let button of buttonsGroup) {
            this.disableButton(button)
        }
    }

    private enableButtonsGroup = (buttonsGroup : HTMLButtonElement[]) => {

        for (let button of buttonsGroup) {
            this.enableButton(button)
        }
    }

    private favoriteVacationsErrorHandler = (errorMessage: string) => {

        // Letting the user know he received an error, by displaying the error as a Popup message

        let snackbar: HTMLDivElement = document.querySelector("#snackbar") as HTMLDivElement;
        snackbar.className = "show";
        snackbar.textContent = errorMessage;

        setTimeout(function() {
            snackbar.className = snackbar.className.replace("show", "");
        }, 3000);
    }


    render() {
        return (
            <div>
                {
                    // --------- If the user has no favorite vacations --------- //
                    this.state.favoriteVacations.length > 0
                    &&
                    
                        <div className="favoriteVacationsSection">

                            <div className="headerContainer">
                                <h2 className="sharp-text favoritesHeader">Your Favorite Vacations</h2>
                            </div>

                            <div className="favoriteVacations">

                                {/* ---------- All Vacations Cards, Using a Designated 'Favorite Vacation' Component ---------- */}

                                {this.state.favoriteVacations.map( (vacation : Vacation, index : number) => 
                                    <FavoriteVacationComponent key={index} vacation={vacation} OnUserDislikeClick={this.OnUserDislikeClick} />
                                )}
                            </div>
                        </div>
                }

                {/* The User's Snackbar Error Indication */}
                <div id="snackbar"></div>

            </div>
        )
    }
}

export default withRouter(FavoriteVacations);