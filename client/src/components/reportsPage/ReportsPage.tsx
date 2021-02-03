import React, { Component } from 'react';
import { Doughnut  } from 'react-chartjs-2';
import axios from 'axios';
import Vacation from '../../models/Vacation';
import { interceptorHandler } from '../../models/InterceptorHandler';
import { getUserInfoFromServerCache } from '../../models/GetUserInfoFromServerCache';
import noAuthorizationSVG from '../../assets/noAuthorizationSVG.svg';
import './reportsPage.css';
import TopNavbar from '../topNavbar/TopNavbar';
import { NavLink } from 'react-router-dom';
import socketIOClient from "socket.io-client";


// --------------------------------------- This Component Displays The User's Liked Vacations Reports Screen --------------------------------------- //

interface FollowedVacationsState {
    followedVacationsNames: string[];
    followedVacationsFollowersCount: number[];
}

export default class ReportsPage extends Component <any, FollowedVacationsState> {

    private userTypeFromServerCache: string;
    private socket: any;

    constructor(props: any) {
        super(props);
    
        this.state = {
            followedVacationsNames: new Array <string> (),
            followedVacationsFollowersCount: new Array <number> ()
        };
    }
    

    // ------------------------------------------------- Component Settings ------------------------------------------------- //

    componentDidMount = async () => {
        console.log("userisadmin");

        interceptorHandler();

        // Getting the user type from the server's cache
        let userInfoFromServerCache = await getUserInfoFromServerCache();
        this.userTypeFromServerCache = userInfoFromServerCache.userType;

        if (this.userTypeFromServerCache === "ADMIN") {
    
            this.getAllFollowedVacationsFromServer();
            this.initiateSocket();
        }
    }

    componentWillUnmount = () => {
        try {
            // Disconnecting from the socket connection
            this.socket.disconnect();
        }
        catch {
            this.vacationsErrorHandler('Something went wrong while trying to disconnect from Socket');
        }
    }



    // ------------------------------------------------- Model ------------------------------------------------- //
    
    private getAllFollowedVacationsFromServer = async () => {
        
        interceptorHandler();
        
        // Attempting to get all the followed vacations from the server, and assigning them to the state
        
        try {
            
            // Attempting to get all of the followed vacations from the server
            const response = await axios.get<Vacation[]>('http://localhost:3001/vacations/all_followed_vacations');
            const followedVacationsData = response.data;
            
            
            // Creating 2 arrays, one for each vacation's parameter (name and followers count)
            let followedVacationsNames: string[] = this.extractFollowedVacationsNames(followedVacationsData);
            let followedVacationsFollowersCount: number[] = this.extractFollowedVacationsFollowersCount(followedVacationsData);
            
            // Updating the state with the new arrays
            this.setState({
                followedVacationsNames: followedVacationsNames,
                followedVacationsFollowersCount: followedVacationsFollowersCount
            });
        }

        catch (error) {

            try {
                let errorMessage = error.response.data.error;
                this.reportsPageErrorHandler(errorMessage);
            }
            
            catch {
                this.reportsPageErrorHandler(error);
            }
        }
    }



    // ------------------------------------------------- Controller ------------------------------------------------- //

    private extractFollowedVacationsNames = (followedVacationsFromGlobalStore: Vacation[]) => {

        let followedVacationsNames: string[] = new Array <string> ();
        
        followedVacationsFromGlobalStore.map( (vacation) => followedVacationsNames.push(vacation.vacationName));

        return followedVacationsNames;
    }

    private initiateSocket = () => {

        // Connecting to the server's socket
        const userTokenForSocketIdentification = JSON.parse(sessionStorage.getItem('userInfo')).token;
        
        this.socket = socketIOClient('http://localhost:3002', { query: "userToken=" + userTokenForSocketIdentification});

        this.socket.on('vacation-likes-update', async () => {
                        // Attempting to get all of the followed vacations from the server
            const response = await axios.get<Vacation[]>('http://localhost:3001/vacations/all_followed_vacations');
            const followedVacationsData = response.data;
            
            
            // Creating 2 arrays, one for each vacation's parameter (name and followers count)
            let followedVacationsNames: string[] = this.extractFollowedVacationsNames(followedVacationsData);
            let followedVacationsFollowersCount: number[] = this.extractFollowedVacationsFollowersCount(followedVacationsData);
            
            // Updating the state with the new arrays
            this.setState({
                followedVacationsNames: followedVacationsNames,
                followedVacationsFollowersCount: followedVacationsFollowersCount
            });
        });
    }

    private extractFollowedVacationsFollowersCount = (followedVacationsFromGlobalStore: Vacation[]) => {

        let followedVacationsFollowersCount: number[] = new Array <number> ();
        
        followedVacationsFromGlobalStore.map( (vacation) => followedVacationsFollowersCount.push(vacation.followersCount));

        return followedVacationsFollowersCount;
    }



    // ------------------------------------------------- View ------------------------------------------------- //

    private reportsPageErrorHandler = (errorMessage: string) => {

        // Letting the user know he received an error, by displaying a Pop-Up Message at the bottom of the screen

        let snackbar: HTMLDivElement = document.querySelector("#snackbar") as HTMLDivElement;
        snackbar.className = "show";
        snackbar.textContent = errorMessage;

        setTimeout(function() {
            snackbar.className = snackbar.className.replace("show", "");
        }, 6000);
    }

    private getRandomChartColor = () => {

        // Generating a random number for the 'user liked vacations' report chart

        let letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    private vacationsErrorHandler = (errorMessage: string) => {

        // Letting the user know he received an error, by displaying a Pop-Up Message at the bottom of the screen

        let snackbar: HTMLDivElement = document.querySelector("#snackbar") as HTMLDivElement;
        snackbar.className = "show";
        snackbar.textContent = errorMessage;

        setTimeout(function() {
            snackbar.className = snackbar.className.replace("show", "");
        }, 6000);
    }


    render() {
        return (
            <div className="reportsPageContainer">

                <TopNavbar />

                <div className="reportsPage">
                    <NavLink to="/vacations" className="backHomeBtn">Back Home</NavLink>
                    {
                        this.userTypeFromServerCache === "ADMIN" ?

                        this.state.followedVacationsNames.length > 0 ?

                            <div className="graphSection">
                                <h1 className="sharp-text likedUsersVacationsHeader">Liked Users Vacations</h1>

                                <div className="doughnut">
                                    <Doughnut
                                        data={
                                            {
                                                labels: this.state.followedVacationsNames,
                                                datasets: [
                                                        {
                                                            label: 'Likes',
                                                            backgroundColor: this.state.followedVacationsNames.map( () => this.getRandomChartColor()),
                                                            borderColor: 'white',
                                                            borderWidth: 2,
                                                            data: this.state.followedVacationsFollowersCount
                                                        }
                                                    ]
                                            }
                                        }
                                        options={{
                                            legend:{
                                                display:true,
                                                position:'right'
                                            },
                                            maintainAspectRatio: true
                                        }}
                                    />

                                </div>
                            </div>
                            :
                            <div>
                                <h1 className="sharp-text">Oops... There are no liked vacations yet</h1>
                                <img className="noAuthImg" src={noAuthorizationSVG} alt="No Authorization"/>
                            </div>
                        :
                        <div className="noAuthSection">
                            <h1 className="sharp-text">Oops... You are not authorized to view that page</h1>
                            <img className="noAuthImg" src={noAuthorizationSVG} alt="No Authorization"/>
                        </div>
                    }

                    {/* The User's Snackbar Error Indication */}
                    <div id="snackbar"></div>
                </div>
            </div>
        )
    }
}