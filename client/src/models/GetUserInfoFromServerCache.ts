
// -------------------- This Model Retrieves The User's Type From The Server's Cache And Returns It -------------------- //

import axios from 'axios';

export const getUserInfoFromServerCache: any = async () => {

    try {
        
        // Attempting to get The user's type From The Server's Cache
        const response = await axios.post('http://localhost:3001/users/info');
        const userInfoFromServerCache = response.data;

        return userInfoFromServerCache;
    }

    catch (error) {

        return "";
    }
}