import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';


// ---------------------------------- This Is The 'Vacation' Component ---------------------------------- //

export default function VacationComponent (props: any) {

    return (
        <div className="vacationCardContainer">

            <div className="topSection">
                <div className="imgSection">
                    <img className="vacationCardImg" src={props.vacation.imageURL} alt={props.vacation.vacationName}/>
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

                {/* If The Current User Is An Admin, Show Him The Control Buttons */}
                {props.userTypeFromServerCache === "ADMIN" ?
                
                    <div className="adminControlPanel">
                        <IconButton onClick={(btn) => {
                            props.onVacationDeleteAttempt(props.vacation, btn);
                        }}>
                            <DeleteIcon/>
                        </IconButton>

                        <IconButton onClick={(btn) => {
                            props.onVacationEditAttempt(props.vacation, btn);
                        }}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    :
                    <div>
                        <div className="vacationLikeCardSection">
                            {props.validateVacationIsNotLikedByTheUser(props.vacation) ?
                                <button className="emptyHeart likeBtn" onClick={() => props.onVacationFollowAttempt(props.vacation)}></button>
                            :
                                <button className="fullHeart likeBtn" onClick={() => props.onVacationFollowAttempt(props.vacation)}></button>
                            }
                        </div>
                        
                        <p className="followersText">{props.vacation.followersCount}</p>
                    </div>
                }

            </div>

        </div>
    )
}
