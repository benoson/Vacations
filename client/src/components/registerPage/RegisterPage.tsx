import React, { ChangeEvent, Component } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/astronautSVG.svg';
import UserRegisterDetails from '../../models/UserRegisterDetails';
import SuccessfulLoginServerResponse from '../../models/SuccessfulLoginServerResponse';
import { successfulLoginHandler } from '../../models/SuccessfulLoginHandler';
import TopBanner from '../topBanner/TopBanner';
import axios from 'axios';
import './registerPage.css';


// ------------------------------------------------- This Component Displays The Registration Screen ------------------------------------------------- //

interface UserRegisterState {
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
}

export default class RegisterPage extends Component <any, UserRegisterState> {

    // Defining the global DOM elemends
    private firstNameInputFieldset: HTMLFieldSetElement;
    private lastNameInputFieldset: HTMLFieldSetElement;
    private usernameInputFieldset: HTMLFieldSetElement;
    private passwordInputFieldset: HTMLFieldSetElement;

    private userMessagesParagraph: HTMLParagraphElement;

    constructor(props: any) {
        super(props);
    
        this.state = {
            firstName: "",
            lastName: "",
            userName: "",
            password: ""
        };
    }


    // ------------------------------------------------- Component Settings ------------------------------------------------- //

    componentDidMount = () => {

        // Defining global DOM elements
        
        this.firstNameInputFieldset = document.querySelector("#firstNameFieldset") as HTMLFieldSetElement;
        this.lastNameInputFieldset = document.querySelector("#lastNameFieldset") as HTMLFieldSetElement;
        this.usernameInputFieldset = document.querySelector("#usernameFieldset") as HTMLFieldSetElement;
        this.passwordInputFieldset = document.querySelector("#passwordFieldset") as HTMLFieldSetElement;

        this.userMessagesParagraph = document.querySelector("#userMessagesParagraph") as HTMLParagraphElement;
    }
    


    // ------------------------------------------------- Model ------------------------------------------------- //
    
    private onUserRegisterClick = async () => {

        this.resetInputFields();
        
        const isRegistrationDataValid = this.checkIfRegistrationDataIsValid();

        if (isRegistrationDataValid) {
            
            try {
                this.disableRegisterButton();

                let userRegisterDetails = new UserRegisterDetails(this.state.firstName, this.state.lastName, this.state.userName, this.state.password);
                
                // Explanation ->
                // I chose to make the user login automatically after a successful registration.
                // So, in the server, after a successful insertion of user's info to the DB, it automatically sends the user
                // to the 'login' function, which returns a Token & User Type, and saves his data in the server's cache.
    
                const serverResponse = await axios.post<SuccessfulLoginServerResponse>('http://localhost:3001/users/register', userRegisterDetails);
    
                // Getting the server response (after the 'login' function occurred on the server)
                const serverResponseData = serverResponse.data;


                // A Model that handles a successful login response from the server
                successfulLoginHandler(serverResponseData);
    
                this.enableRegisterBtn();

                this.routingHandler();
            }
    
            catch (error) {
    
                try {
                    let errorMessage = error.response.data.error;
                    this.registerErrorHandler(errorMessage)
                }

                catch {
                    this.registerErrorHandler(error);
                }

                finally {
                    this.enableRegisterBtn();
                }
            }
        }
    }



    // ------------------------------------------------- Controller ------------------------------------------------- //

    private checkIfRegistrationDataIsValid = () => {
        
        let isFirstNameValid = this.checkIfFirstNameIsValid();
        let isLastNameValid = this.checkIfLastNameIsValid();
        let isPasswordValid = this.checkIfPasswordIsValid();
        let isUserNameValid = this.checkIfUserNameIsValid();

        // If one of the input fields is not valid, return false

        if (!isFirstNameValid || !isLastNameValid || !isUserNameValid || !isPasswordValid) {
            return false;
        }

        return true;
    }

    private updateFirstNameValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the first name value entered in the first name's input field

        const firstNameInputField : HTMLInputElement = event.target;

        const firstNameInputFieldValue : string =  firstNameInputField.value;
        const trimmedFirstNameInputField : string = firstNameInputFieldValue.trim();

        this.setState({
            firstName: trimmedFirstNameInputField
        });
    }

    private updateLastNameValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the last name value entered in the last name's input field

        const lastNameInputField : HTMLInputElement = event.target;

        const lastNameInputFieldValue : string =  lastNameInputField.value;
        const trimmedLastNameInputField : string = lastNameInputFieldValue.trim();

        this.setState({
            lastName: trimmedLastNameInputField
        });
    }

    private updateUserNameValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the username value entered in the username's input field

        const userNameInputField : HTMLInputElement = event.target;

        const userNameInputFieldValue : string =  userNameInputField.value;
        const trimmedUserNameInputField : string = userNameInputFieldValue.trim();

        this.setState({
            userName: trimmedUserNameInputField
        });
    }

    private updatePasswordValue = (event : ChangeEvent <HTMLInputElement>) => {

        // getting the password value entered in the password's input field

        const passwordInputField : HTMLInputElement = event.target;

        const passwordInputFieldValue : string =  passwordInputField.value;
        const trimmedPasswordInputField : string = passwordInputFieldValue.trim();

        this.setState({
            password: trimmedPasswordInputField
        });
    }

    private checkIfFirstNameIsValid = () => {

        let trimmedFirstName = this.state.firstName.trim();
        const firstNameInputField = this.firstNameInputFieldset;
        
        if (trimmedFirstName !== "") {

            // If the first name entered is less than 26 characters
            if (trimmedFirstName.length <= 25) {
                return true;
            }

            // If the last name entered is more than 25 characters
            else {
                this.registerErrorHandler("First Name Must Not Be More Than 25 characters");
            }
        }

        this.notifyUserInputFieldIsNotValid(firstNameInputField);
        return false;
    }

    private checkIfLastNameIsValid = () => {

        let trimmedLastName = this.state.lastName.trim();
        const lastNameInputField = this.lastNameInputFieldset;

        if (trimmedLastName !== "") {

            // If the last name entered is less than 26 characters
            if (trimmedLastName.length <= 25) {
                return true;
            }

            // If the last name entered is more than 25 characters
            else {
                this.registerErrorHandler("Last Name Must Not Be More Than 25 characters");
            }
        }

        this.notifyUserInputFieldIsNotValid(lastNameInputField);
        return false;
    }

    private checkIfPasswordIsValid = () => {
        
        let trimmedPassword = this.state.password.trim();
        let passwordInputField = this.passwordInputFieldset;

        if (trimmedPassword!== "") {

            // If the password is at least 6 characters long
            if (trimmedPassword.length >= 6) {

                // If the password is a maximum of 15 characters
                if (trimmedPassword.length <= 15) {
                    return true;
                }

                else {
                    this.registerErrorHandler("The Password Must Be a Maximum of 15 Characters");
                }
            }

            // If the password is not empty, but smaller than 6 characters
            else {
                this.registerErrorHandler("Password Must Be At Least 6 Characters Long");
            }
            
            // Either way one of the valdiations failed, notify the user
            this.notifyUserInputFieldIsNotValid(passwordInputField);
            return false;
        }

        // If the password is empty
        this.notifyUserInputFieldIsNotValid(passwordInputField);
        return false;
    }

    private checkIfUserNameIsValid = () => {
        
        let trimmedUserName = this.state.userName.trim();
        let usernameInputField = this.usernameInputFieldset;

        if (trimmedUserName !== "") {

            // if the username entered is at least 3 characters long
            if (trimmedUserName.length >= 3) {

                // if the username entered is a maximum of 15 characters
                if (trimmedUserName.length <= 15) {
                    return true;
                }

                else {
                    this.registerErrorHandler("Username Must Be a Maximum of 15 Characters");
                }
            }

            else {
                this.registerErrorHandler("Username Must Be At Least 3 Characters Long");
            }
        }

        // Either way one of the valdiations failed, notify the user
        this.notifyUserInputFieldIsNotValid(usernameInputField);
        return false;
    }

    private routingHandler = () => {

        // ---------- Navigating To The Correct URL, Based On The User's Type ---------- //

        this.props.history.push('/vacations');
    }



    // ------------------------------------------------- View ------------------------------------------------- //

    private disableRegisterButton = () : void => {
        const registerBtn = document.querySelector("#registerBtn") as HTMLButtonElement;
        registerBtn.disabled = true;
        registerBtn.style.cursor = "not-allowed";
    }

    private enableRegisterBtn = () : void => {
        const registerBtn = document.querySelector("#registerBtn") as HTMLButtonElement;
        registerBtn.disabled = false;
        registerBtn.style.cursor = "pointer";
    }

    private notifyUserInputFieldIsNotValid = (inputField : HTMLFieldSetElement) => {

        inputField.style.border = "2px solid red";
    }

    private registerErrorHandler = (errorMessage : string) => {
        
        // Letting the user know he received an error, by displaying the error message
        this.userMessagesParagraph.textContent = errorMessage;
    }

    private resetInputFields = () => {

        this.usernameInputFieldset.style.border = "1px solid #00d1ff";
        this.passwordInputFieldset.style.border = "1px solid #00d1ff";
        this.firstNameInputFieldset.style.border = "1px solid #00d1ff";
        this.lastNameInputFieldset.style.border = "1px solid #00d1ff";

        this.userMessagesParagraph.textContent = "";
    }


    render() {

        return (
            <div className="registerSectionContainer">
                <TopBanner />

                <div className="registerSection">

                    <div className="registerSquare">
                        <img className="register-logo" src={logo} alt="Explorer"/>

                        <h2 className="sharp-text">Register</h2>
                        <h3 className="sharp-text margin-bottom-2">To Explorer</h3>


                        <div className="inputFieldSection">
                            <fieldset id="firstNameFieldset" className="cerdinals-fieldset firstNameFieldset">
                                <legend>First Name</legend>
                                <input onChange={this.updateFirstNameValue} type="text" name="firstName" id="firstNameField"/>
                            </fieldset>

                            <fieldset id="lastNameFieldset" className="cerdinals-fieldset lastNameFieldset">
                                <legend>Last Name</legend>
                                <input onChange={this.updateLastNameValue} type="text" name="lastName" id="lastNameField"/>
                            </fieldset>

                            <fieldset id="usernameFieldset" className="cerdinals-fieldset usernameFieldset">
                                <legend>Username</legend>
                                <input onChange={this.updateUserNameValue} type="text" name="username" id="usernameField"/>
                            </fieldset>

                            <fieldset id="passwordFieldset" className="cerdinals-fieldset passwordFieldset">
                                <legend>Password</legend>
                                <input onChange={this.updatePasswordValue} type="password" name="password" id="passwordField"/>
                            </fieldset>

                            <button id="registerBtn" className="registerBtn" onClick={this.onUserRegisterClick}>Register</button>
                        </div>

                        <NavLink className="alreadyRegisteredLink sharp-text" to="/login">I Already Have An Account</NavLink>
                    </div>

                    <p id="userMessagesParagraph" className="userMessagesParagraph sharp-text"></p>
                </div>
            </div>
        )
    }
}