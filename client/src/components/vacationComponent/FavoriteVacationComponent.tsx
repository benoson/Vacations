import React from 'react';


// ---------------------------------- This Is The 'Favorite Vacation' Component ---------------------------------- //

export default function FavoriteVacationComponent (props: any) {

    return (
        <div className="vacationCardContainer">

            <div className="topSection">
                <div className="imgSection">
                    <img className="vacationCardImg" src={props.vacation.imageURL} alt={props.vacation.vacationDescription}/>
                </div>

                <div className="vacationInfoCard">
                    <h4 className="resortName">{props.vacation.vacationName}</h4>

                    <div className="vacationDates">
                        <h4 className="vacationDate">{props.vacation.startDate}</h4>
                        <span> - </span>
                        <h4 className="vacationDate">{props.vacation.endDate}</h4>
                    </div>

                    <h4 className="vacationPrice">{props.vacation.vacationPrice} $</h4>
                </div>

                <div className="vacationDesc">
                    {props.vacation.vacationDescription}
                </div>
            </div>

            <div className="bottomSection">
                <div className="vacationLikeCardSection">
                    <button className="fullHeart likeBtn" onClick={ () => {props.OnUserDislikeClick(props.vacation)}}></button>
                </div>

                <p className="followersText">{props.vacation.followersCount}</p>
            </div>

        </div>
    )
}