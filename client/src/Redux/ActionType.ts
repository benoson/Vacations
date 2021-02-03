export enum ActionType {
    GetAllVacations,
    GetFavoriteVacations,
    SetFollowedVacation,
    UnfollowVacation,
    AddVacation,
    UpdateVacation,
    UpdateFavoriteVacation,
    DeleteVacationViaSocketIO,
    DeleteFavoriteVacationViaSocketIO,
    IncreaseVacationFollowersCount,
    IncreaseFavoriteVacationFollowersCount,
    DecreaseVacationFollowersCount,
    DecreaseFavoriteVacationFollowersCount,
    DeleteVacation,
    updateUserName,
    OnUserLogout
}