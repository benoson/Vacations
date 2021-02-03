import React from 'react';
import './logo.css'


// ------------------------------------------------- This Component Displays The Logo Of The Website ------------------------------------------------- //

export default function Logo() {

    return (
        <div className="logoContainer">
            <img className="logo" src={require('../../assets//bannerBackground4.png')} alt="logo"/>
        </div>
    )
}
