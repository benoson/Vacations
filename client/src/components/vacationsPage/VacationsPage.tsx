import React from 'react';
import AllVacations from '../allVacations/AllVacations';
import FavoriteVacations from '../favoriteVacations/FavoriteVacations';
import TopNavbar from '../topNavbar/TopNavbar';
import Logo from '../logo/Logo';


// --------------- This Component Is The Layout For The Favorite Vacations Component & All Vacations Compoenent --------------- //

export default function VacationsPage() {

    return (
        <div className="vacationsAndNavbar">
            <div className="topNavbarSection">
                <Logo />
                <TopNavbar />
            </div>

            <div className="allVacationsSectionsContainer">
                <FavoriteVacations />
                <AllVacations />
            </div>
        </div>

    )
}