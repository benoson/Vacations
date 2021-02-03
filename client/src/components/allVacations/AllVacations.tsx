import React, { Component } from 'react';
import Vacation from '../../models/Vacation';
import { store } from '../../Redux/Store';
import axios from 'axios';
import { ActionType } from '../../Redux/ActionType';
import { Unsubscribe } from 'redux';
import {withRouter} from 'react-router';
import { NavLink } from 'react-router-dom';
import settingsImage from '../../assets/settingsImg.png';
import deleteSVG from '../../assets/deleteSVG.svg';
import spinningEarthSVG from '../../assets/spinningEarthSVG.svg';
import { isUserLoggedValidator } from '../../models/IsUserLoggedValidator';
import { interceptorHandler } from '../../models/InterceptorHandler';
import { getUserInfoFromServerCache } from '../../models/GetUserInfoFromServerCache';
import VacationComponent from '../vacationComponent/VacationComponent';
import TextField from '@material-ui/core/TextField';
import socketIOClient from "socket.io-client";
import './allVacations.css';
import '../topNavbar/topNavbar.css';


// ------------------------------------------------- This Component Displays All The Vacations The Website Has To Offer  ------------------------------------------------- //

interface allVacationsState {
    allVacations : Vacation[];
}

export class AllVacations extends Component <any, allVacationsState> {

    private unSubscribeStore : Unsubscribe;
    private userTypeFromServerCache: string;
    private userNameFromServerCache: string;
    private imageToDeleteFromServer: string;
    private socket: any;

    constructor(props : any) {
        super(props);

        this.state = {
            allVacations : new Array <Vacation> ()
        };
    }


    // ------------------------------------------------- Component Settings ------------------------------------------------- //

    componentWillUnmount = () => {

        // Unsubscribing the store's listener right before the component will unmount
        // In order to make a small space optimization
        this.unSubscribeStore();

        try {
            // Disconnecting from the socket connection
            this.socket.disconnect();
        }
        catch {
            this.vacationsErrorHandler('Something went wrong while trying to disconnect from Socket');
        }
    }

    componentDidMount = async () => {

        // Optimizing a bit the memory leak of the store listener. Also subscribes automatically to the store
        this.unSubscribeStore = store.subscribe(
            
            () => this.setState ({
                allVacations: store.getState().allVacations
            })
        );

        const isUserLogged = isUserLoggedValidator();
        if (isUserLogged) {
            await this.getUserInfoFromServerCache();

            // Initiating the Socket connection to the server
            this.initiateSocket();
        }

        this.checkIfGlobalStoraHasAllVacations();
    }



    // ------------------------------------------------- Model ------------------------------------------------- //

    private getAllVacationsFromServer = async () => {

        // Getting all the vacations from the server and inserting them to the Global Store
        
        try {
            // The response we get, should be type of 'Vacation' class
            const response = await axios.get<Vacation[]>('http://localhost:3001/vacations');

            // Here we are receiving all the vacations from the server, as a JSON
            const allVacations: Vacation[] = response.data;

            // Insert all the vacations from the server to the Global Store
            store.dispatch({
                type: ActionType.GetAllVacations,
                payload: allVacations
            });
        }

        catch (error) {

            // In case of an error, receiving the error, and displaying it in a Pop-Up UI message for the user
            try {
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }

            catch {
                this.vacationsErrorHandler(error);
            }
        }
    }

    private followVacation = async (clickedVacation : Vacation) => {

        // This function occurs after validations approved that this vacation can be liked by the user

        interceptorHandler();

        // Defining all 'like' buttons in order to disable them until the request is done
        const likeButtonsNodeList = document.getElementsByClassName("likeBtn");
        const likeButtonsArr = Array.from(likeButtonsNodeList) as HTMLButtonElement[];

        try {

            this.disableButtonsGroup(likeButtonsArr);

            // Attempting to make a POST request to the server with the clicked vacation's ID, to follow that vacation
            const clickedVacationID : number = clickedVacation.vacationID;
            await axios.post(`http://localhost:3001/vacations/follow_vacation/${clickedVacationID}`);

            // Updating The Global Store
            // store.dispatch({type: ActionType.SetFollowedVacation, payload: clickedVacation});

            // Emitting a socket message to the server, in order to inform all clients about the new followed vacation in the UI
            const socketInfo = {
                clickedVacationID,
                userName: this.userNameFromServerCache
            };

            this.socket.emit('increase-vacation-followers-count', socketInfo);
        }

        catch (error) {

            try {
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }

            catch {
                this.vacationsErrorHandler(error);
            }

        }

        finally {
            this.enableButtonsGroup(likeButtonsArr);
        }
    }

    private unfollowVacation = async (clickedVacation : Vacation) => {

        // This function is designated to make the user 'unfollow' a vacation
        interceptorHandler();

        // Defining all 'like' buttons in order to disable them until the request is done
        const likeButtonsNodeList = document.getElementsByClassName("likeBtn");
        const likeButtonsArr = Array.from(likeButtonsNodeList) as HTMLButtonElement[];

        try {

            this.disableButtonsGroup(likeButtonsArr);
            
            // Attempting to make a POST request to the server with the clicked vacation's ID, to unfollow a vacation
            let clickedVacationID : number = clickedVacation.vacationID;
            await axios.post(`http://localhost:3001/vacations/unfollow_vacation/${clickedVacationID}`);

            // Emitting a socket message to the server, in order to inform all clients about the new unfollowed vacation in the UI
            const socketInfo = {
                clickedVacationID,
                userName: this.userNameFromServerCache
            };
            this.socket.emit('decrease-vacation-followers-count', socketInfo);
        }

        catch (error) {

            try {
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }

            catch {
                this.vacationsErrorHandler(error);
            }
        }
        
        finally {
            this.enableButtonsGroup(likeButtonsArr);
        }
    }

    private addVacation = async (addModalBackground: any) => {

        let allInputsArr = this.getAllInputsArrForAddedVacation();
        
        // Validating that all the fields of the added vacation are valid
        let [isNewVacationDataValid, newVacationData] = this.validateNewVacationData(allInputsArr);

        if (isNewVacationDataValid) {

            interceptorHandler();

            try {
    
                let serverResponse = await axios.post<Vacation[]>(`http://localhost:3001/vacations/add_vacation`, newVacationData);
                let newlyAddedVacation: Vacation = serverResponse.data[0];
                
                // Emitting a socket command to the server, in order to inform all clients about the new vacation
                this.socket.emit('add-vacation', newlyAddedVacation);

                this.hideModal(addModalBackground);
            }
            
            catch (error) {
    
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }
        }
    }

    private updateVacation = async (clickedVacation : Vacation, editModalBackground: any) => {

        const allInputsArr = this.getAllInputsArrForUpdatedVacation();
        
        // Validating all fields of the updated vacation are valid, and getting back the valid data
        let [isNewVacationDataValid, newVacationData] = this.validateNewVacationData(allInputsArr);

        if (isNewVacationDataValid) {

            // Converting the data to for suitable UI display -> preventing retrieving the updated vacation from the DB
            const convertedValidDataForUIDisplay = this.convertVacationDataForUIDisplay(allInputsArr, clickedVacation);

            interceptorHandler();

            try {
    
                let clickedVacationID: number = clickedVacation.vacationID;
                const response = await axios.put(`http://localhost:3001/vacations/update_vacation/${clickedVacationID}`, {newVacationData, imageToDeleteFromServer: this.imageToDeleteFromServer});

                const imageToPreview = response.data;
                convertedValidDataForUIDisplay.imageURL = imageToPreview;

                // Emitting a socket command to the server, in order to inform all clients about the updated vacation
                this.socket.emit('update-vacation-info', convertedValidDataForUIDisplay);

                this.hideModal(editModalBackground);
            }
            
            catch (error) {
    
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }
        }
    }

    private deleteVacation = async (clickedVacationID: number) => {

        interceptorHandler();

        try {

            const imageToDeleteFromServer = this.imageToDeleteFromServer;
            await axios.post(`http://localhost:3001/vacations/delete_vacation/${clickedVacationID}`, {imageToDeleteFromServer});

            // Emitting a socket command to the server, in order to inform all clients about the new deleted vacation
            this.socket.emit('delete-vacation', clickedVacationID);
        }
        
        catch (error) {

            let errorMessage = error.response.data.error;
            this.vacationsErrorHandler(errorMessage);
        }
    }

    private getUserInfoFromServerCache = async () => {

        // This function retrieves the user type from the server, because we don't trust the client to tell us his user type
        
        try {
            let userInfoFromServerCache = await getUserInfoFromServerCache();

            this.userTypeFromServerCache = userInfoFromServerCache.userType;
            this.userNameFromServerCache = userInfoFromServerCache.userName;
        }

        catch (error) {
            try {
                let errorMessage = error.response.data.error;
                this.vacationsErrorHandler(errorMessage);
            }

            catch {
                this.vacationsErrorHandler(error);
            }
        }
    }



    // ------------------------------------------------- Controller ------------------------------------------------- //

    private checkIfGlobalStoraHasAllVacations = () => {

        // Checking if the Gloabl Store has all the vacations to display, and if not, get them from the server
        
        let allVacationsInGlobalStore = store.getState().allVacations;

        if (allVacationsInGlobalStore.length === 0) {
            this.getAllVacationsFromServer();
        }

        else {
            this.setState ({
                allVacations: allVacationsInGlobalStore
            });
        }
    }

    private registerAllSocketListeners = () => {

        // Registering all Socket.io Listeners

        // Registering an 'add vacation' listener, which updates the UI for all the clients
        this.socket.on('add-vacation', (newlyAddedVacation: Vacation) => {
            this.addVacationViaSocketIO(newlyAddedVacation);
        });

        // Registering an 'update vacation' listener, which updates the UI for all the clients
        this.socket.on('update-vacation-info', (convertedValidDataForUIDisplay: Vacation) => {
            this.updateVacationInfoViaSocketIO(convertedValidDataForUIDisplay);
        });

        // Registering a 'delete vacation' listener, which updates the UI for all the clients
        this.socket.on('delete-vacation', (clickedVacationID: number) => {
            this.deleteVacationViaSocketIO(clickedVacationID);
        });

        // Registering an 'increase vacation followers count' listener, which updates the UI for all the clients
        this.socket.on('increase-vacation-followers-count', (socketInfo: {clickedVacationID: number, userName: string}) => {
            this.increaseVacationFollowersCountViaSocketIO(socketInfo);
        });

        // Registering a 'decrease vacation followers count' listener, which updates the UI for all the clients
        this.socket.on('decrease-vacation-followers-count', (socketInfo: {clickedVacationID: number, userName: string}) => {
            this.decreaseVacationFollowersCountViaSocketIO(socketInfo);
        });
    }

    private convertVacationDataForUIDisplay = (inputsArr : HTMLInputElement[], clickedVacation: Vacation) => {

        // This function gets a vacation data that the admin has changed locally, and converts it to display it locally (without reaching for the DB)

        const clickedVacationID: number = clickedVacation.vacationID;
        const clickedVacationFollowersCount: number = clickedVacation.followersCount;

        const newNameTrimmedValue = inputsArr[0].value.trim();
        const vacationStartDateValue = inputsArr[1].value;
        const vacationEndDateValue = inputsArr[2].value;
        const newPriceValue = inputsArr[3].valueAsNumber;
        const newDescriptionTrimmedValue = inputsArr[4].value.trim();
        const newVacationURL = inputsArr[5].value.trim();

        const convertedStartDate = this.convertStartDateForUIDisplay(vacationStartDateValue);
        const convertedEndDate = this.convertEndDateForUIDisplay(vacationEndDateValue);

        // Creating the converted vacation UI display object
        const convertedValidDataForUIDisplay = {
            vacationID: clickedVacationID,
            vacationName: newNameTrimmedValue,
            startDate: convertedStartDate,
            endDate: convertedEndDate,
            vacationPrice: newPriceValue,
            vacationDescription: newDescriptionTrimmedValue,
            imageURL: newVacationURL,
            followersCount: clickedVacationFollowersCount
        }

        return convertedValidDataForUIDisplay;
    }

    private convertStartDateForUIDisplay = (vacationStartDateValue: string) => {

        // This function converts the start date of a given vacation, to be suitable for the UI

        let startDateYear = +vacationStartDateValue.split('-')[2];
        let startDateMonth = +vacationStartDateValue.split('-')[1];
        let startDateDay = +vacationStartDateValue.split('-')[0];
        let fullStartDate = startDateYear+"/"+startDateMonth+"/"+startDateDay;

        return fullStartDate;
    }

    private convertEndDateForUIDisplay = (vacationEndDateValue: string) => {

        // This function converts the end date of a given vacation, to be suitable for the UI

        let endDateYear = +vacationEndDateValue.split('-')[2];
        let endDateMonth = +vacationEndDateValue.split('-')[1];
        let endDateDay = +vacationEndDateValue.split('-')[0];
        let fullEndDate = endDateYear+"/"+endDateMonth+"/"+endDateDay;

        return fullEndDate;
    }

    private getAllInputsArrForAddedVacation = () => {

        // Defining, and returning an array of all the inputs inside the 'Add Vacation' modal

        const vacationName: HTMLInputElement = document.querySelector("#addedVacationName") as HTMLInputElement;
        const vacationStartDate: HTMLInputElement = document.querySelector("#addStartDate") as HTMLInputElement;
        const vacationEndDate: HTMLInputElement = document.querySelector("#addEndDate") as HTMLInputElement;
        const vacationPrice: HTMLInputElement = document.querySelector("#addedVacationPrice") as HTMLInputElement;
        const vacationDescription: HTMLInputElement = document.querySelector("#addedVacationDescription") as HTMLInputElement;
        const vacationImageURL: HTMLInputElement = document.querySelector("#addedVacationImageURL") as HTMLInputElement;

        const allInputsArr = [vacationName, vacationStartDate, vacationEndDate, vacationPrice, vacationDescription, vacationImageURL];

        return allInputsArr;
    }

    private getAllInputsArrForUpdatedVacation = () => {

        // Defining, and returning an array of all the inputs inside the 'Update Vacation' modal

        const vacationName: HTMLInputElement = document.querySelector("#editedVacationName") as HTMLInputElement;
        const vacationStartDate: HTMLInputElement = document.querySelector("#editStartDate") as HTMLInputElement;
        const vacationEndDate: HTMLInputElement = document.querySelector("#editEndDate") as HTMLInputElement;
        const vacationPrice: HTMLInputElement = document.querySelector("#editedVacationPrice") as HTMLInputElement;
        const vacationDescription: HTMLInputElement = document.querySelector("#editedVacationDescription") as HTMLInputElement;
        const vacationImageURL: HTMLInputElement = document.querySelector("#editedVacationImageURL") as HTMLInputElement;

        const allInputsArr = [vacationName, vacationStartDate, vacationEndDate, vacationPrice, vacationDescription, vacationImageURL];

        return allInputsArr;
    }

    private onVacationFollowAttempt = (clickedVacation : Vacation) => {

        /*
            Before the 'follow' action, checking if the user is currently logged in.
            This validation is made because a user might delete his token before trying
            to like a vacation. In that case, throw him out to login again.
        */

        // Using a Model I made to check if the user is still logged (Preventing duplication of code from all components that needs to make this validation).
        const isUserLogged = isUserLoggedValidator();
        
        // If the user is currently logged in
        if (isUserLogged) {
            
            // checking if the user hasn't liked this vacation already
            const vacationIsNotAlreadyLikedByTheUser = this.validateVacationIsNotLikedByTheUser(clickedVacation);

            // If the vacation selected is not already liked by the user, follow that vacation
            if (vacationIsNotAlreadyLikedByTheUser) {
                this.followVacation(clickedVacation);
            }

            // If the vacation selected is already liked by the user, unfollow that vacation.
            else {
                this.unfollowVacation(clickedVacation);
            }
        }

        // In case a guest tried to follow a vacation, send him to the login page in order for him to login
        else {
            this.props.history.push('/login');
        }
    }

    private validateVacationIsNotLikedByTheUser = (clickedVacation : Vacation) => {

        // Validating the vacation chosen is not already liked by the user

        let favoriteVacationsFromGlobalState: Vacation[] = store.getState().favoriteVacations;
        let clickedVacationID: number = clickedVacation.vacationID;

        // Searching the clicked vacation's ID inside our global store
        let clickedVacationInGlobalStore: Vacation = favoriteVacationsFromGlobalState.find(
            favoriteVacation => favoriteVacation.vacationID === clickedVacationID);

        // If no result came back (if the user hasn't liked this vacation already)
        if (clickedVacationInGlobalStore === undefined) {
            return true;
        }

        return false;
    }

    private getIndexOfVacationByID = (vacationID: number) => {

        // Finding and returning an index of a vacation from the Global Store's 'all vacations' array

        let allVacations: Vacation[] = store.getState().allVacations as Vacation[];

        let clickedVacationInGlobalStore: Vacation = allVacations.find( allVacations =>  allVacations.vacationID === vacationID);
        let indexOfClickedVacationInGlobalStore: number = allVacations.indexOf(clickedVacationInGlobalStore);

        return indexOfClickedVacationInGlobalStore;
    }

    private getIndexOfFavoriteVacationByID = (vacationID: number) => {

        // Finding and returning an index of a vacation from the Global Store's 'favorites' array

        let favoriteVacations: Vacation[] = store.getState().favoriteVacations as Vacation[];

        let clickedVacationInGlobalStore: Vacation = favoriteVacations.find( favoriteVacation =>  favoriteVacation.vacationID === vacationID);
        let indexOfClickedVacationInGlobalStore: number = favoriteVacations.indexOf(clickedVacationInGlobalStore);

        return indexOfClickedVacationInGlobalStore;
    }

    private onVacationAdditionAttempt = () => {

        /*
            Before the 'add' action, checking if the user is currently logged in.
            This validation is made because a user might delete his token before trying
            to delete a vacation. In that case, throw him out to login again.
        */

        // Using a Model I made to check if the user is still logged (Preventing duplication of code from all components that needs to make this validation).

        const isUserLogged = isUserLoggedValidator();

        if (isUserLogged) {
            this.displayAdditionModal();
        }

        // If the Admin has decided to delete his Token from the sessionStorage, throw him out to login again
        else {
            this.props.history.push('/login');
        }
    }

    private onVacationEditAttempt = (clickedVacation: Vacation, event : MouseEvent) => {

        /*
            Before the 'edit' action, checking if the user is currently logged in.
            This validation is made because a user might delete his token before trying
            to edit a vacation. In that case, throw him out to login again.
        */

        // Using a Model I made to check if the user is still logged (Preventing duplication of code from all components that needs to make this validation).

        const isUserLogged = isUserLoggedValidator();

        if (isUserLogged) {
            const button = event.target as HTMLButtonElement;
            this.disableButton(button);
            this.displayEditModal(clickedVacation);
            this.enableButton(button);
        }

        // If the Admin has decided to delete his Token from the sessionStorage, throw him out to login again
        else {
            this.props.history.push('/login');
        }
    }

    private onVacationDeleteAttempt = (clickedVacation: Vacation, event : MouseEvent) => {

        /*
            Before the 'delete' action, checking if the user is currently logged in.
            This validation is made because a user might delete his token before trying
            to delete a vacation. In that case, throw him out to login again.
        */

        // Using a Model I made to check if the user is still logged (Preventing duplication of code from all components that needs to make this validation).

        const isUserLogged = isUserLoggedValidator();
        
        if (isUserLogged) {
            const button = event.target as HTMLButtonElement;
            this.disableButton(button);
            this.displayDeletionModal(clickedVacation);
            this.enableButton(button);
        }

        // If the Admin has decided to delete his Token from the sessionStorage, throw him out to login again
        else {
            this.props.history.push('/login');
        }
    }

    private validateNewVacationData = (inputsArr: HTMLInputElement[]) => {

        // This function validates all the Modal's fields are valid

        const newNameTrimmedValue = inputsArr[0].value.trim();
        const vacationStartDateValue = inputsArr[1].value;
        const vacationEndDateValue = inputsArr[2].value;
        const newPriceValue = inputsArr[3].valueAsNumber;
        const newDescriptionTrimmedValue = inputsArr[4].value.trim();
        const newVacationURL = inputsArr[5].value.trim();
 

        // Validating all Modal fields are valid

        let isNewVacationURLValid = this.validateNewVacationURL(newVacationURL);
        let isNewDescriptionValid = this.validateNewDescription(newDescriptionTrimmedValue);
        let isNewPriceValid = this.validateNewPrice(newPriceValue);
        let areDatesValid = this.validateNewDates(vacationStartDateValue, vacationEndDateValue);
        let isNewNameValid = this.validateNewName(newNameTrimmedValue);

        if (isNewNameValid) {
            if (isNewPriceValid) {
                if (isNewDescriptionValid) {
                    if (areDatesValid) {
                        if (isNewVacationURLValid) {

                            // Creating an object that has all the necessary data for adding / updating a vacation locally
                            let newVacationData = {
                                vacationName: newNameTrimmedValue,
                                vacationPrice: newPriceValue,
                                vacationDescription: newDescriptionTrimmedValue,
                                startDate: vacationStartDateValue,
                                endDate: vacationEndDateValue,
                                imageURL: newVacationURL,
                            };
    
                            // retrning the data + a 'true', in order to inform the caller that the data is valid
                            return [true, newVacationData];
                        }
                    }

                }
            }
        }

        // In case one of the parameters of the updated vacation is not valid
        return [false, {}];
    }

    private validateNewName = (newTrimmedName: string) => {

        // Validating the vacation's name inside the Modal

        if (newTrimmedName !== "") {
            if (newTrimmedName.length >= 3) {
                if (newTrimmedName.length <= 44) {
                    return true;
                }
            }
        }

        this.vacationsErrorHandler("The new name must be between 3 - 44 characters long");
        return false;
    }

    private validateNewPrice = (newPrice: number) => {

        // Validating the vacation's price inside the Modal

        if (newPrice > 0) {
            if (newPrice < 100000) {
                return true;
            }
        }

        this.vacationsErrorHandler("The new price must be larger than 0 and Lower than 100,000");
        return false;
    }

    private validateNewDescription = (newTrimmedDescription: string) => {

        // Validating the vacation's description inside the Modal

        if (newTrimmedDescription !== "") {
            if (newTrimmedDescription.length >= 5) {
                if (newTrimmedDescription.length <= 249) {
                    return true;
                }
            }
        }

        this.vacationsErrorHandler("The new description must be between 5 - 249 characters long");
        return false;
    }

    private validateNewDates = (newVacationStartDate: string, newVacationEndDate: string) => {

        // Validating the logic of the dates inputs in the 'add Modal'

        if (newVacationStartDate !== "") {
            if (newVacationStartDate !== undefined) {

                if (newVacationEndDate !== "") {
                    if (newVacationEndDate !== undefined) {

                        let currentDate = new Date().setHours(0, 0, 0, 0);
                        let startDate = new Date(newVacationStartDate).setHours(0, 0, 0, 0);
                        let endDate = new Date(newVacationEndDate).setHours(0, 0, 0, 0);

                        // Checking if the starting date is not in the past
                        if (startDate >= currentDate) {

                            // Checking if the ending date is greater than the starting date
                            if (endDate > startDate) {
                                return true;
                            }

                            else {
                                this.vacationsErrorHandler("The return date must be later than the starting date");
                                return false;
                            }
                        }

                        else {
                            this.vacationsErrorHandler("The starting date must be later than today");
                            return false;
                        }
                    }
                }
            }
        }

        this.vacationsErrorHandler("Vacation Dates Not Valid, Try Again");
        return false;
    }

    private validateNewVacationURL = (newTrimmedImageURL: string) => {

        // Validating the vacation's URL inside the Modal

        if (newTrimmedImageURL !== "") {
            if (newTrimmedImageURL.length >= 10) {
                if (newTrimmedImageURL.length <= 998) {
                    return true;
                }
            }
        }

        this.vacationsErrorHandler("Image URL must be between 10 - 998 characters long");
        return false;
    }

    private addVacationViaSocketIO = (newlyAddedVacation: Vacation) => {

        // This function occurs whenever an admin adds a new vacation (the listener triggers this function using a Socket.io message).
        // Updating the Global Store with the new vacation, in order to update the UI

        store.dispatch({type: ActionType.AddVacation, payload: newlyAddedVacation});
    }

    private updateVacationInfoViaSocketIO = (convertedValidDataForUIDisplay: Vacation) => {

        // Updating the user's UI with the vacation that was updated (edited) by the admin, via Socket.io

        // Finding the indexes of the changed vacation in the Global Store, and updating them locally
        let updatedVacationID = convertedValidDataForUIDisplay.vacationID;
        let indexOfClickedFavoriteVacationInGlobalStore: number = this.getIndexOfFavoriteVacationByID(updatedVacationID);
        let indexOfClickedVacationInGlobalStore: number = this.getIndexOfVacationByID(updatedVacationID);

        // Updating the vacations in the 'all vacations' component
        store.dispatch({type: ActionType.UpdateVacation, payload: {indexOfClickedVacationInGlobalStore, convertedValidDataForUIDisplay} });

        // Updating the vacations in the user's 'favorite vacations' component
        if (indexOfClickedFavoriteVacationInGlobalStore !== -1) {
            store.dispatch({type: ActionType.UpdateFavoriteVacation, payload: {indexOfClickedFavoriteVacationInGlobalStore, convertedValidDataForUIDisplay} });
        }
    }

    private deleteVacationViaSocketIO = (clickedVacationID: number) => {
        
        // Updating the user's UI with the vacation that was deleted by the admin, via Socket.io

        // Finding the indexes of the changed vacation in the Global Store, and updating them locally
        let indexOfClickedFavoriteVacationInGlobalStore: number = this.getIndexOfFavoriteVacationByID(clickedVacationID);
        let indexOfClickedVacationInGlobalStore: number = this.getIndexOfVacationByID(clickedVacationID);

        // Updating the vacations in the 'all vacations' component
        store.dispatch({type: ActionType.DeleteVacationViaSocketIO, payload: indexOfClickedVacationInGlobalStore });

        // Checking if the user has liked this vacation
        // Updating the vacations in the user's 'favorite vacations' component
        if (indexOfClickedFavoriteVacationInGlobalStore !== -1) {
            store.dispatch({type: ActionType.DeleteFavoriteVacationViaSocketIO, payload: indexOfClickedFavoriteVacationInGlobalStore });
        }
    }

    private increaseVacationFollowersCountViaSocketIO = (socketInfo: {clickedVacationID: number, userName: string}) => {

        // Updating the user's UI with the followers count of the vacation that was liked by other users, via Socket.io

        // Finding the indexes of the changed vacation in the Global Store, and updating them locally
        let indexOfClickedVacationInGlobalStore: number = this.getIndexOfVacationByID(socketInfo.clickedVacationID);
        let indexOfFavoriteClickedVacationInGlobalStore: number = this.getIndexOfFavoriteVacationByID(socketInfo.clickedVacationID);

        let newFollowersCount = store.getState().allVacations[indexOfClickedVacationInGlobalStore].followersCount + 1;

        // Checking if the user has liked this vacation
        if (indexOfFavoriteClickedVacationInGlobalStore !== -1) {
            // Updating the vacation's followers count in the UI
            store.dispatch({type: ActionType.IncreaseFavoriteVacationFollowersCount, payload: {indexOfFavoriteClickedVacationInGlobalStore, newFollowersCount}});
        }

        // Updating the vacation's followers count in the UI
        store.dispatch({type: ActionType.IncreaseVacationFollowersCount, payload: {indexOfClickedVacationInGlobalStore, newFollowersCount}});

        this.checkIfUserShouldIncreaseFollowersCountInUI(socketInfo);
    }

    private decreaseVacationFollowersCountViaSocketIO = (socketInfo: {clickedVacationID: number, userName: string}) => {

        // Updating the user's UI with the followers count of the vacation that was unliked by other users, via Socket.io

        // Finding the indexes of the changed vacation in the Global Store, and updating them locally
        let indexOfClickedVacationInGlobalStore: number = this.getIndexOfVacationByID(socketInfo.clickedVacationID);
        let indexOfFavoriteClickedVacationInGlobalStore: number = this.getIndexOfFavoriteVacationByID(socketInfo.clickedVacationID);
        
        let newFollowersCount = store.getState().allVacations[indexOfClickedVacationInGlobalStore].followersCount - 1;

        // Checking if the user has liked this vacation
        if (indexOfFavoriteClickedVacationInGlobalStore !== -1) {
            
            // Updating the vacation's followers count in the UI
            store.dispatch({type: ActionType.DecreaseFavoriteVacationFollowersCount, payload: {indexOfFavoriteClickedVacationInGlobalStore, newFollowersCount}});
        }

        // Updating the vacation's followers count in the UI
        store.dispatch({type: ActionType.DecreaseVacationFollowersCount, payload: {indexOfClickedVacationInGlobalStore, newFollowersCount}});

        this.checkIfUserShouldDecreaseFollowersCountInUI(socketInfo);
    }

    private checkIfUserShouldIncreaseFollowersCountInUI = (socketInfo: {clickedVacationID: number, userName: string}) => {

        const clickedVacationID = socketInfo.clickedVacationID;
        const clickedVacationIndex = this.getIndexOfVacationByID(clickedVacationID);
        const clickedVacation = store.getState().allVacations[clickedVacationIndex];

        if (this.userNameFromServerCache === socketInfo.userName) {
            store.dispatch({type: ActionType.SetFollowedVacation, payload: clickedVacation});
        };
    }

    private checkIfUserShouldDecreaseFollowersCountInUI = (socketInfo: {clickedVacationID: number, userName: string}) => {

        const clickedVacationID = socketInfo.clickedVacationID;
        const clickedVacationIndex = this.getIndexOfFavoriteVacationByID(clickedVacationID);

        if (this.userNameFromServerCache === socketInfo.userName) {
            store.dispatch({type: ActionType.UnfollowVacation, payload: clickedVacationIndex});
        };
    }

    private initiateSocket = () => {

        // Connecting to the server's socket
        const userTokenForSocketIdentification = JSON.parse(sessionStorage.getItem('userInfo')).token;
        
        this.socket = socketIOClient('http://localhost:3002', { query: "userToken=" + userTokenForSocketIdentification});
        this.registerAllSocketListeners();
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

    private vacationsErrorHandler = (errorMessage: string) => {

        // Letting the user know he received an error, by displaying a Pop-Up Message at the bottom of the screen

        let snackbar: HTMLDivElement = document.querySelector("#snackbar") as HTMLDivElement;
        snackbar.className = "show";
        snackbar.textContent = errorMessage;

        setTimeout(function() {
            snackbar.className = snackbar.className.replace("show", "");
        }, 6000);
    }

    private displayVacationNameInEditModal = (clickedVacationName: string) => {

        // Displaying 'Edit' Modal Name

        const editedVacationNameField = document.querySelector("#editedVacationName") as HTMLInputElement;
        editedVacationNameField.value = clickedVacationName;
    }

    private displayVacationPriceInEditModal = (clickedVacationPrice: number) => {

        // Dusplaying 'Edit' Modal Price

        const editedVacationPriceField = document.querySelector("#editedVacationPrice") as HTMLInputElement;
        editedVacationPriceField.valueAsNumber = clickedVacationPrice;
    }

    private displayVacationDatesInEditModal = (clickedVacationStartDate: string, clickedVacationEndDate: string) => {

        // Displaying 'Edit' Modal Dates

        const editStartDateField = document.querySelector("#editStartDate") as HTMLInputElement;
        const editEndDateField = document.querySelector("#editEndDate") as HTMLInputElement;

        // Start Date
        let startDateYear = +clickedVacationStartDate.split('/')[2];
        let startDateMonth = +clickedVacationStartDate.split('/')[1];
        let startDateDay = +clickedVacationStartDate.split('/')[0];
        let fullStartDate = startDateYear+"-"+startDateMonth+"-"+startDateDay;

        // End Date
        let endDateYear = +clickedVacationEndDate.split('/')[2];
        let endDateMonth = +clickedVacationEndDate.split('/')[1];
        let endDateDay = +clickedVacationEndDate.split('/')[0];
        let fullEndDate = endDateYear+"-"+endDateMonth+"-"+endDateDay;
        
        editStartDateField.valueAsDate = new Date(fullStartDate);
        editEndDateField.valueAsDate = new Date(fullEndDate);
    }

    private displayVacationDescriptionInEditModal = (clickedVacationDescription: string) => {

        // Displaying 'Edit' Modal Description

        const editVacationDescriptionField = document.querySelector("#editedVacationDescription") as HTMLInputElement;
        editVacationDescriptionField.value = clickedVacationDescription;
    }

    private displayVacationImageInEditModal = (clickedVacationImageURL: string) => {
        
        const editedVacationImageURL = document.querySelector("#editedVacationImageURL") as HTMLInputElement;
        editedVacationImageURL.value = clickedVacationImageURL;
    }

    private displayAdditionModal = () => {

        // Defining the 'Add' Modal in the UI

        const addModalBackground = document.querySelector("#addModalContainer") as HTMLElement;
        const addModalDoneBtn = document.querySelector("#addModalDoneBtn") as HTMLButtonElement;
        const addModalCancelBtn = document.querySelector("#addModalCancelBtn") as HTMLButtonElement;

        addModalBackground.style.display = "block";


        // Defining the event listeners for the modal

        addModalCancelBtn.onclick = () => {this.hideModal(addModalBackground)};

        addModalDoneBtn.onclick = () => {

            this.addVacation(addModalBackground);
        };

        window.addEventListener("click", (event: MouseEvent) => {
            if (event.target === addModalBackground) {
                this.hideModal(addModalBackground);
            }
        })
    }

    private displayEditModal = (clickedVacation: Vacation) => {

        // Defining the 'Edit' Modal in the UI

        const editModalBackground = document.querySelector("#editModalContainer") as HTMLElement;
        const editModalIcon = document.querySelector("#editModalIcon") as HTMLImageElement;
        const editModalHeader = document.querySelector("#editModalHeader");
        const editModalDoneBtn = document.querySelector("#editModalDoneBtn") as HTMLButtonElement;
        const editModalCancelBtn = document.querySelector("#editModalCancelBtn") as HTMLButtonElement;

        // Displaying the values inside the 'Edit' Modal
        this.displayVacationNameInEditModal(clickedVacation.vacationName);
        this.displayVacationPriceInEditModal(clickedVacation.vacationPrice);
        this.displayVacationDescriptionInEditModal(clickedVacation.vacationDescription);
        this.displayVacationDatesInEditModal(clickedVacation.startDate, clickedVacation.endDate);
        this.displayVacationImageInEditModal(clickedVacation.imageURL);
        this.imageToDeleteFromServer = clickedVacation.imageURL;
        
        editModalBackground.style.display = "block";
        editModalHeader.textContent = `Update ${clickedVacation.vacationName}`;
        editModalIcon.src = clickedVacation.imageURL;

        // Defining the event listeners for the modal

        editModalCancelBtn.onclick = () => {this.hideModal(editModalBackground)};

        editModalDoneBtn.onclick = () => {

            this.updateVacation(clickedVacation, editModalBackground);
        };

        window.onclick = function(event : MouseEvent) {
            
            if (event.target === editModalBackground) {
                editModalBackground.style.display = "none";
            }
        }
    }

    private displayDeletionModal = (clickedVacation: Vacation) => {

        let clickedVacationID: number = clickedVacation.vacationID;

        const deletionModalBackground = document.querySelector("#deletionModalContainer") as HTMLElement;
        const deletionModalHeader = document.querySelector("#deletionModalHeader");
        const deletionModalTextParagraph = document.querySelector("#deletionModalText");
        const deleteBtn = document.querySelector("#deleteBtn") as HTMLButtonElement;
        const dontDeleteBtn = document.querySelector("#dontDeleteBtn") as HTMLButtonElement;
        const deletionModalVacationName = document.querySelector("#deletionModalVacationName");

        deletionModalBackground.style.display = "block";
        deletionModalHeader.textContent = "Confirm Your Deletion";
        deletionModalTextParagraph.textContent = `Are You Sure You Would Like To Delete`;
        deletionModalVacationName.textContent = `${clickedVacation.vacationName} ?`;
        this.imageToDeleteFromServer = clickedVacation.imageURL;


        // Defining the event listeners for the modal

        dontDeleteBtn.onclick = () => {this.hideModal(deletionModalBackground)};

        deleteBtn.onclick = () => {
            this.deleteVacation(clickedVacationID);
            this.hideModal(deletionModalBackground);
        };

        window.onclick = function(event : MouseEvent) {
            
            if (event.target === deletionModalBackground) {
                deletionModalBackground.style.display = "none";
            }
        }
    }

    private clearModalInputs = () => {

        // Clearing the inputs of the 'Add' Modal

        let additionModalNameInput = document.querySelector("#addedVacationName") as HTMLInputElement;
        let additionModalStartDateInput = document.querySelector("#addStartDate") as HTMLInputElement;
        let additionModalEndDateInput = document.querySelector("#addEndDate") as HTMLInputElement;
        let additionModalPriceInput = document.querySelector("#addedVacationPrice") as HTMLInputElement;
        let additionModalDescriptionInput = document.querySelector("#addedVacationDescription") as HTMLInputElement;
        let additionModalImageURLInput = document.querySelector("#addedVacationImageURL") as HTMLInputElement;

        additionModalNameInput.value = "";
        additionModalStartDateInput.value = "";
        additionModalEndDateInput.value = "";
        additionModalPriceInput.valueAsNumber = 0;
        additionModalDescriptionInput.value = "";
        additionModalImageURLInput.value = "";
    }

    private hideModal = (modal: any) => {

        modal.style.display = "none";
        this.clearModalInputs();
    }


    render() {
        return (
            <div>
                <div className="allVacationsSection" id="allVacationsSection">

                    {this.userTypeFromServerCache === "ADMIN"
                    && 
                        <div className="topNavbarSection">
                            <span id="adminText">Logged as an Admin</span>

                            <span id="reportsNavItem" className="topNavItem reportsNavItem">
                                <NavLink to="/reports">View Reports Page</NavLink>
                            </span>
                        </div>
                    }

                    {/* ---------- All Vacations Section Header ---------- */}

                    <div className="headerContainer">
                        {this.userTypeFromServerCache === "ADMIN" ?
                            <h2 className="allVacationsHeader sharp-text">All {this.state.allVacations.length} Vacations You Can Edit</h2>
                            :
                            <h2 className="allVacationsHeader sharp-text">All {this.state.allVacations.length} Vacations We've Got For You</h2>
                        }
                    </div>
                
                    <div className="allVacations">

                        {/* If The Current User Is An Admin, Show Him The 'Add Vacation' Button */}

                        {this.userTypeFromServerCache === "ADMIN"
                            &&

                            <div className="addVacationSquare" onClick={this.onVacationAdditionAttempt}>
                                <div className="newVacationText">
                                    <h2 className="sharp-text">New Vacation</h2>
                                </div>
                            </div>
                        }

                        {
                            this.state.allVacations.length > 0 ?

                            // ---------- In case the user type in the server's cache is type 'USER' ---------- //

                            this.state.allVacations.map( (vacation : Vacation, index : number) => 
                                <VacationComponent key={index} vacation= {vacation} onVacationFollowAttempt= {this.onVacationFollowAttempt}
                                                    validateVacationIsNotLikedByTheUser= {this.validateVacationIsNotLikedByTheUser} onVacationDeleteAttempt= {this.onVacationDeleteAttempt}
                                                    onVacationEditAttempt= {this.onVacationEditAttempt} userTypeFromServerCache= {this.userTypeFromServerCache}
                                                    disableBtn= {this.disableButton} enableBtn= {this.enableButton} />
                            )
                            
                            // ---------- else, if the vacations were not retrieved from the server for some reason ---------- //
                            :
                            <div className="noVcationsSection">
                                <img className="settingsImage" src={settingsImage} alt=""/>
                                <h1 className="sharp-text">Oops, We Could Not Find Any Vacations</h1>
                            </div>
                        }
                        
                    </div>
                </div>

                {/* ---------------------------------------------- Modals and Snackbar ---------------------------------------------- */}

                {/* --------------- The 'Deletion' Modal --------------- */}
                <div id="deletionModalContainer">
                    <div id="deletionModal">
                        <h1 id="deletionModalHeader">.</h1>
                        <p id="deletionModalText"></p>
                        <h2 id="deletionModalVacationName">.</h2>

                        <img id="deleteModalIcon" src={deleteSVG} alt="Delete Vacation Modal" />

                        <div className="buttonsSection">
                            <button id="dontDeleteBtn">Don't Delete</button>
                            <button id="deleteBtn">Delete</button>
                        </div>
                    </div>
                </div>


                {/* --------------- The 'Edit' Modal --------------- */}
                <div id="editModalContainer">
                    <div id="editModal">
                        <h1 id="editModalHeader">.</h1>

                        <img id="editModalIcon" alt="Add New Vacation Modal" />

                        <div id="editInputs">
                            <TextField id="editedVacationName" label="Name" variant="standard" />

                            <div id="editDatesSection">
                                <input type="date" min={new Date().toISOString().slice(0,10)} max={"2999-01-01"} id="editStartDate"/>
                                <span>-</span>
                                <input type="date" min={new Date().toISOString().slice(0,10)} max={"2999-01-01"} id="editEndDate"/>
                            </div>

                            <TextField id="editedVacationPrice" type="number" label="Price"variant="standard" />

                            <TextField id="editedVacationDescription" label="Description" />

                            <TextField id="editedVacationImageURL" label="Image URL" />
                            <p>The Image You Upload Will Be Saved!</p>
                        </div>

                        <div className="buttonsSection">
                            <button id="editModalCancelBtn">Cancel</button>
                            <button id="editModalDoneBtn">Update</button>
                        </div>
                    </div>
                </div>


                {/* --------------- The 'Edit' Modal --------------- */}
                <div id="addModalContainer">
                    <div id="addModal">
                        <h1 id="addModalHeader">Add a New Vacation !</h1>

                        <img id="addModalIcon" src={spinningEarthSVG} alt="Vacation URL Is Broken" />

                        <div id="addInputs">
                            <TextField id="addedVacationName" label="Name" variant="standard" />

                            <div id="addDatesSection">
                                <input type="date" min={new Date().toISOString().slice(0,10)} max={"2999-01-01"} id="addStartDate"/>
                                <span>-</span>
                                <input type="date" min={new Date().toISOString().slice(0,10)} max={"2999-01-01"} id="addEndDate"/>
                            </div>

                            <TextField id="addedVacationPrice" type="number" label="Price" variant="standard" />

                            <TextField id="addedVacationDescription"label="Description" />

                            <TextField id="addedVacationImageURL" label="Image URL" />
                            <p>The Image You Upload Will Be Saved!</p>
                        </div>

                        <div className="buttonsSection">
                            <button id="addModalCancelBtn">Cancel</button>
                            <button id="addModalDoneBtn">Add</button>
                        </div>
                    </div>
                </div>


                {/* The User's Snackbar Error Indication */}
                <div id="snackbar"></div>
            </div>
        )
    }
}

export default withRouter(AllVacations);