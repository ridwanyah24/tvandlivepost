import { RootState } from "@/store/store";
import { AuthState, User } from "@/types/newTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState : AuthState = {
    accessToken: null,
    user: null,
    // role: null,
    isLoggedIn: false
}

const adminAuthSlice = createSlice({
    name: "logAdmin",
    initialState,
    reducers: {
        logInAdmin: (state, action: PayloadAction<{accessToken: string; user: User}>)=> {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.isLoggedIn = true;
        },
        logOutAdmin: (state)=> {
            state.accessToken = null;
            state.user = null;
            state.isLoggedIn = false;
        }
    }
})

export const {logInAdmin, logOutAdmin} = adminAuthSlice.actions;
export default  adminAuthSlice.reducer;


export const selectCurrentAdmin = (state:RootState) => state.authAdmin.user