import { createStore } from "redux";
import AppState from "./AppState";
import reducer from './Reducer';

// Defining the Global Store (the app's global state)
export const store = createStore(reducer, new AppState());