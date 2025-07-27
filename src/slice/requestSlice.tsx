import { RootState } from "@/store/store";
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { createCookie, clearCookie } from "@/utils/cookies";
import { baseUrl } from "@/utils/baseUrl"
import { loginSuccess, logout } from "./newAuthSlice";
import { buildQueryParams } from "@/utils/buildQueryParams";


const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const newToken = state.newAuth.accessToken; // Token after login

        // Use newAuth token if available; otherwise, fall back to tempAuth token
        const token = newToken;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        return headers;
    },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    // Check if the response indicates an authentication error
    // if (result.error && result.error.status === 401) {
    //     console.log("Access token expired, attempting refresh...");

    // // Attempt to refresh the access token
    //     const refreshResult = await baseQuery(
    //         {
    //             url: "/auth/refresh", // Endpoint to refresh tokens
    //             method: "POST",
    //             body: {
    //                 refresh_token: (api.getState() as RootState).auth.refreshToken, // Send the refresh token
    //             },
    //         },
    //         api,
    //         extraOptions
    //     );

    //     if (refreshResult.data) {
    //         const { accessToken, user } = refreshResult.data as {
    //             accessToken: string;
    //             user: {};
    //         };

    //         // Update the store with the new tokens
    //         const institution = (api.getState() as RootState).newAuth.user;
    //         if (institution) {
    //             api.dispatch(loginSuccess({ accessToken, user }));
    //         } else {
    //             console.error("Institution is null, cannot dispatch loginSuccess");
    //         }

    // //         // Update cookies if you're using them
    //         createCookie("accessToken", accessToken);
    //         // createCookie("refresh_token", refresh_token);

    // //         // Retry the original query with the new token
    //         result = await baseQuery(args, api, extraOptions);
    //     } else {
    //         // Refresh token failed, clear cookies and log out
    //         console.log("Refresh token expired or invalid, logging out...");
    //         clearCookie("access_token");
    //         clearCookie("refresh_token");
    //         api.dispatch(logout()); // Ensure you import the `logout` action from your authSlice
    //     }
    // }

    return result;
};



/**
 * Represents an RTK Query API slice created using `createApi`.
 * It provides a generic mutation endpoint that can be used to perform various HTTP requests.
 *
 * @constant
 * @property {string} reducerPath - The path to the reducer in the Redux store.
 * @property {BaseQueryFn} baseQuery - The base query function with reauthentication.
 * @property {string[]} tagTypes - The types of tags used for cache invalidation.
 * @property {Object} endpoints - The defined endpoints for this API slice.
 *
 * ## Example Usage
 *
 * You can check the OTP and Signup page for better examples.
 *
 * ```ts
 * const [genericMutation] = apiSlice.useGenericMutation();
 *
 * const handleRequest = async () => {
 *   try {
 *     const response = await genericMutation({
 *       url: '/api/example',
 *       method: 'POST',
 *       body: { key: 'value' },
 *       invalidatesTags: [{ type: 'users', id: 1 }]
 *     }).unwrap();
 *     console.log('Response:', response);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 * ```
 *
 * **OR**
 *
 * ```ts
 * const [genericMutation] = apiSlice.useGenericMutation();
 *
 * const handleRequest = async () => {
 *   try {
 *     const response = await genericMutation({
 *       url: '/api/example',
 *       method: 'POST',
 *       body: { key: 'value' },
 *       invalidatesTags: [{ type: 'users' }]
 *     }).unwrap();
 *     console.log('Response:', response);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 * ```
 */

// Define the valid tags that can be used for cache invalidation

type ValidTags = "notices" | "exam" | "schoolfee" | "students" | "teachers" | "classfee" | "users" | "user" | "sessions" | "classes" | "banks" | "subjects" | "staff" | "classTeachers" | "classTutors" | "classSubjects" | "staffs" | "classSchedule" | "parents" | "staffAttendance" | "geofencing" | "classAttendance";



type MutationArg = {
    /** The URL for the request */
    url: string;
    /** The HTTP method for the request (defaults to "POST") */
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** The body of the request */
    body?: any;
    /** Tags to invalidate cached data upon request completion */
    invalidatesTags?: { type: ValidTags; id?: string | number }[];
};



export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,

    tagTypes: ["exam", "notices", "students", "teachers", "users", "user", "sessions", "banks", "schoolfee", "classes", "subjects", "classfee", "staff", "staffs", "classTeachers", "classTutors", "classSubjects", "classSchedule", "parents", "staffAttendance", "classAttendance", "geofencing"], // Ensure tagTypes match what's used in invalidatesTags


    endpoints: (builder) => ({
        genericMutation: builder.mutation<
            any,
            MutationArg
        >({
            query: ({ url, method = "POST", body }) => ({
                url,
                method,
                body,
            }),
            invalidatesTags: (_, __, arg) => arg?.invalidatesTags || [],
        }),
       
    }),
});

export const {
    usePrefetch,
    useGenericMutationMutation,
    
} = apiSlice;