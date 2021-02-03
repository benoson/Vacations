import AppState from "./AppState";
import Action from "./Action";
import { ActionType } from "./ActionType";
import Vacation from "../models/Vacation";


// --------------- This is the reducer (acts like a state machine) --------------- //

export default function reduce (oldAppState : AppState, action : Action): AppState {

    // Copying the old app state, in order to modify it, based on the action
    const newAppState = {...oldAppState};

    switch (action.type) {
        case ActionType.GetAllVacations:
            newAppState.allVacations = [...action.payload];
            break;

        case ActionType.SetFollowedVacation:
            newAppState.favoriteVacations.push(action.payload);
            break;

        case ActionType.GetFavoriteVacations:
            newAppState.favoriteVacations = [...action.payload];
            break;

        case ActionType.UnfollowVacation:
            newAppState.favoriteVacations.splice(action.payload, 1);
            break;

        case ActionType.AddVacation:
            newAppState.allVacations.push(action.payload);
            break;

        case ActionType.UpdateVacation:
            newAppState.allVacations[action.payload.indexOfClickedVacationInGlobalStore] = action.payload.convertedValidDataForUIDisplay;
            break;
        
        case ActionType.UpdateFavoriteVacation:
            newAppState.favoriteVacations[action.payload.indexOfClickedFavoriteVacationInGlobalStore] = action.payload.convertedValidDataForUIDisplay;
            break;

        case ActionType.DeleteVacationViaSocketIO:
            newAppState.allVacations.splice(action.payload, 1);
            break;

        case ActionType.DeleteFavoriteVacationViaSocketIO:
            newAppState.favoriteVacations.splice(action.payload, 1);
            break;

        case ActionType.IncreaseVacationFollowersCount:
            newAppState.allVacations[action.payload.indexOfClickedVacationInGlobalStore].followersCount = action.payload.newFollowersCount;
            break;

        case ActionType.IncreaseFavoriteVacationFollowersCount:
            newAppState.favoriteVacations[action.payload.indexOfFavoriteClickedVacationInGlobalStore].followersCount = action.payload.newFollowersCount;
            break;

        case ActionType.DecreaseVacationFollowersCount:
            newAppState.allVacations[action.payload.indexOfClickedVacationInGlobalStore].followersCount = action.payload.newFollowersCount;
            break;

        case ActionType.DecreaseFavoriteVacationFollowersCount:
            newAppState.favoriteVacations[action.payload.indexOfFavoriteClickedVacationInGlobalStore].followersCount = action.payload.newFollowersCount;
            break;

        case ActionType.DeleteVacation:
            newAppState.allVacations.splice(action.payload, 1);
            break;            

        case ActionType.OnUserLogout:
            // Clearing the user's favorite vacations on logout
            newAppState.favoriteVacations = new Array <Vacation> ();
            break;
    }

    return newAppState;
}