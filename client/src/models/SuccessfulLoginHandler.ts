import SuccessfulLoginServerResponse from './SuccessfulLoginServerResponse';
import axios from 'axios';
import { store } from '../Redux/Store';
import { ActionType } from '../Redux/ActionType';

/*
    Explanation -> This Model is called whenever a successful login has happaned
    (Automatically after a successful registration / after a regular login).

    This Model is designated to prevent duplication of code from all components that needs to make this proccess.
*/

// ---------- Attaching the user's token to the interceptor ---------- //

const attachTokenToInterceptor = (token: string) => {

    // Attaching the Token and the Bearer string to the Interceptor

    let brearerToken = "Bearer " + token;
    axios.defaults.headers.common['Authorization'] = brearerToken;
}

export const successfulLoginHandler = (loginServerResponse : SuccessfulLoginServerResponse) => {

    // Getting the Token we received from the server
    attachTokenToInterceptor(loginServerResponse.token);
    
    // Inserting the user's info to the sessionStorage
    let strUserInfo = JSON.stringify(loginServerResponse);
    sessionStorage.setItem('userInfo', strUserInfo);

    store.dispatch({type: ActionType.updateUserName, payload: loginServerResponse.userName});
}