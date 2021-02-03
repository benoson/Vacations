import React, { ChangeEvent, Component } from 'react';
import logo from '../../assets/astronautSVG.svg';
import UserLoginDetails from '../../models/UserLoginDetails';
import SuccessfulLoginServerResponse from '../../models/SuccessfulLoginServerResponse';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './loginPage.css';
import Vacation from '../../models/Vacation';
import { store } from '../../Redux/Store';
import { ActionType } from '../../Redux/ActionType';
import TopBanner from '../topBanner/TopBanner';
import { successfulLoginHandler } from "../../models/SuccessfulLoginHandler";


// ------------------------------------------------- This Component Displays The Login Screen ------------------------------------------------- //

interface LoginState {
    userName: string;
    password: string;
}

export default class LoginPage extends Component <any, LoginState> {

    // Defining the global DOM elemends
    private usernameInputField: HTMLFieldSetElement;
    private passwordInputField: HTMLFieldSetElement;
    private userMessagesParagraph: HTMLParagraphElement;

    public constructor (props: any) {
        super(props);

        // initializing the state with empty values
        this.state = {
             userName: "",
             password: ""
        };
    }


    // ------------------------------------------------- Component Settings ------------------------------------------------- //

    componentDidMount = () => {

        // Checking if the Global Store has the vacations.
        // If not, retrieve them before the user even logs in, in order to load
        // the vacations behind the scenes, while the user is bussy logging -> Better UX
        this.checkIfGlobalStoreHasAllVacations();

        // Defining global DOM elements
        this.usernameInputField = document.querySelector("#usernameFieldset") as HTMLFieldSetElement;
        this.passwordInputField = document.querySelector("#passwordFieldset") as HTMLFieldSetElement;
        this.userMessagesParagraph = document.querySelector("#userMessagesParagraph") as HTMLParagraphElement;
    }



    // ------------------------------------------------- Model ------------------------------------------------- //

    private getAllVacationsFromServer = async () => {
        
        try {
            // The response we get, should be type of 'Vacation' class
            const response = await axios.get<Vacation[]>('http://localhost:3001/vacations');

            // Here we are receiving all the vacations from the server, as a JSON
            const allVacations : Vacation[] = response.data;

            // Updating the Global Store
            store.dispatch({
                type: ActionType.GetAllVacations,
                payload: allVacations
            });
        }

        catch (error) {

            try {
                let errorMessage = error.response.data.error;
                this.loginErrorHandler(errorMessage);
            }

            catch {
                this.loginErrorHandler(error)
            }
        }
    }

    private login = async () => {

        this.resetInputFields();

        let userNameIsNotEmpty = this.checkIfUsernameEnteredIsEmpty();
        let passwordIsNotEmpty = this.checkIfPasswordEnteredIsEmpty();

        if (userNameIsNotEmpty && passwordIsNotEmpty) {

            try {
                this.disableLoginButton();

                let userLoginDetails = new UserLoginDetails(this.state.userName, this.state.password);
                
                // The response we get, should be type of 'SuccessfulLoginServerResponse' class
                const serverResponse = await axios.post<SuccessfulLoginServerResponse>('http://localhost:3001/users/login', userLoginDetails);
    
                // Here we are receiving the token, username & user type from the data we got back from the server
                const serverResponseData = serverResponse.data;

                // A Model that handles a successful login response from the server
                successfulLoginHandler(serverResponseData);

                this.enableLoginBtn();

                // Handling the URL routing
                this.routingHandler();
            }
    
            catch (error) {
                
                try {
                    let errorMessage = error.response.data.error;
                    this.loginErrorHandler(errorMessage);
                }

                catch {
                    this.loginErrorHandler(error);
                }

                finally {
                    this.enableLoginBtn();
                }
            }
        }
    }



    // ------------------------------------------------- Controller ------------------------------------------------- //

    private checkIfGlobalStoreHasAllVacations = () => {

        let allVacationsInGlobalStore = store.getState().allVacations;

        if (allVacationsInGlobalStore.length === 0) {
            this.getAllVacationsFromServer()
        }
    }

    private updateUserNameValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the username entered in the username's input field

        const userNameInputField : HTMLInputElement = event.target;
        const userNameInputFieldValue : string =  userNameInputField.value;
        const trimmedUserNameInputFieldValue : string = userNameInputFieldValue.trim();

        this.setState({
            userName: trimmedUserNameInputFieldValue
        });
    }

    private updatePasswordValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the password entered in the password's input field

        const passwordInputField : HTMLInputElement = event.target;
        const passwordInputFieldValue : string =  passwordInputField.value;

        this.setState({
            password: passwordInputFieldValue
        });
    }

    private checkIfUsernameEnteredIsEmpty = () => {

        // Checking if the username entered in the 'login' page is empty

        let userNameInputField: HTMLInputElement = document.querySelector("#usernameField") as HTMLInputElement;
        let userNameInputFieldValue = userNameInputField.value;
        let trimmedUserNameInputFieldValue = userNameInputFieldValue.trim();

        if (trimmedUserNameInputFieldValue === "") {
            this.notifyUserAboutInvalidUserName();
            return false;
        }

        return true;
    }

    private checkIfPasswordEnteredIsEmpty = () => {

        // Checking if the password entered in the 'login' page is empty

        let passwordInputField: HTMLInputElement = document.querySelector("#passwordField") as HTMLInputElement;
        let passwordInputFieldValue = passwordInputField.value;
        let trimmedUserNameInputFieldValue = passwordInputFieldValue.trim();

        if (trimmedUserNameInputFieldValue === "") {
            this.notifyUserAboutInvalidPassword();
            return false;
        }

        return true;
    }

    private routingHandler = () => {

        // Navigating To The Vacations Page URL After a Successful Login
        this.props.history.push('/vacations');
    }



    // ------------------------------------------------- View ------------------------------------------------- //

    private disableLoginButton = () : void => {
        const loginBtn = document.querySelector("#loginBtn") as HTMLButtonElement;
        loginBtn.disabled = true;
        loginBtn.style.cursor = "not-allowed";
    }

    private enableLoginBtn = () : void => {
        const loginBtn = document.querySelector("#loginBtn") as HTMLButtonElement;
        loginBtn.disabled = false;
        loginBtn.style.cursor = "pointer";
    }

    private notifyUserAboutInvalidUserName = () => {
        this.usernameInputField.style.border = "2px solid red";
    }

    private notifyUserAboutInvalidPassword = () => {
        this.passwordInputField.style.border = "2px solid red";
    }

    private resetInputFields = () => {

        this.usernameInputField.style.border = "1px solid #00d1ff";
        this.passwordInputField.style.border = "1px solid #00d1ff";

        this.userMessagesParagraph.textContent = "";
    }

    private loginErrorHandler = (errorMessage : string) => {

        // Letting the user know he received an error, by displaying the error message
        this.userMessagesParagraph.textContent = errorMessage;
    }


    render() {
        return (
            <div className="loginSectionContainer">
                <TopBanner />

                <div className="loginSection">
                    <div className="loginSquare">
                        <img className="login-logo" src={logo} alt="Explorer"/>

                        <h2 className="sharp-text">Login</h2>
                        <h3 className="sharp-text margin-bottom-2">To Continue To Explorer</h3>


                        <div className="inputFieldSection">
                            <fieldset id="usernameFieldset" className="cerdinals-fieldset">
                                <legend>Username</legend>
                                <input onChange={this.updateUserNameValue} type="text" name="username" id="usernameField"/>
                            </fieldset>

                            <fieldset id="passwordFieldset" className="cerdinals-fieldset">
                                <legend>Password</legend>
                                <input onChange={this.updatePasswordValue} type="password" name="password" id="passwordField"/>
                            </fieldset>

                            <button className="loginBtn" id="loginBtn" onClick={this.login}>Login</button>
                        </div>

                        <NavLink className="notRegisteredLink sharp-text" to="/register">I Don't Have An Account</NavLink>
                    </div>

                    <p id="userMessagesParagraph" className="userMessagesParagraph sharp-text"></p>
                </div>
            </div>
        )
    }
}