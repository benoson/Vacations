import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from '../loginPage/LoginPage';
import RegisterPage from '../registerPage/RegisterPage';
import RerportsPage from '../reportsPage/ReportsPage';
import VacationsPage from '../vacationsPage/VacationsPage';
import './layout.css';


export default function Layout() {

    return (
        <div className="layout" id="topPage">
            <BrowserRouter>

                <Switch>
                    <Route path="/login" component={LoginPage} exact />
                    <Route path="/register" component={RegisterPage} exact />
                    <Route path="/vacations" component={VacationsPage} exact />
                    <Route path="/reports" component={RerportsPage} exact />
                    
                    <Redirect from="/" to="/login" exact />
                </Switch>

            </BrowserRouter>
        </div>
    )
}