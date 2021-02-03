import axios from 'axios';

// Explanation -> The interceptor is a just JS variable (from 'axios' library). On refresh => it resets.
// So, this Model takes the token the user got from the server (which is now inside the sessionStorage),
// and assigns it to the interceptor

export const interceptorHandler = () => {

    let userData = JSON.parse(sessionStorage.getItem("userInfo"));

    // Checking if the user has a correct sessionStorage JSON
    if (userData !== null) {

        // Checking if the user has a token
        if (userData.token !== undefined) {

            // Assigning the Token + Bearer string to the Interceptor
            let brearerToken = "Bearer " + userData.token;
            axios.defaults.headers.common['Authorization'] = brearerToken;
        }
    }
}