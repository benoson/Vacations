// -------------------- This Model Retrieves The User's Type From The sessionStorage And Returns It -------------------- //


export const getUserTypeFromStorage = () => {
    
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    if (userInfo !== null) {

        if (userInfo.userType !== undefined) {
            
            return userInfo.userType;
        }
    }
}