import Vacation from "../models/Vacation";

export default class AppState {
    
    public allVacations : Vacation[] = new Array <Vacation> ();
    public favoriteVacations : Vacation[] = new Array <Vacation> ();
    public userName: string = "";
}