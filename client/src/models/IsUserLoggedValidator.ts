
// ------------------ This model checks if the user is still logged in ------------------ //

export const isUserLoggedValidator = () => {

    let userData = JSON.parse(sessionStorage.getItem("userInfo"));

    // Checking if the user has a correct sessionStorage JSON
    if (userData !== null) {

        // Checking if the user has a token
        if (userData.token !== undefined) {
            return true;
        }
    }

    return false;
}