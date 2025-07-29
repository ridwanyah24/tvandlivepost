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
import { logInAdmin, logOutAdmin } from "./authAdmin";
import { buildQueryParams } from "@/utils/buildQueryParams";
import { AuthState, User } from "@/types/newTypes";


const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;

        // Get the access token from Redux state
        const token = state.authAdmin?.accessToken;

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
            console.log("✅ Setting Authorization header:", `Bearer ${token}`);
        } else {
            console.warn("⚠️ No token found in authAdmin state");
        }

        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    // If unauthorized, try to refresh the token
    if (result.error && result.error.status === 401) {
        console.log("Access token expired, attempting refresh...");

        const refresh_token = (api.getState() as RootState).authAdmin.refresh_token;

        const refreshResult = await baseQuery(
            {
                url: `/auth/refresh?refresh_token=${refresh_token}`, // ✅ pass as query param
                method: "POST",
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const { accessToken, user, refresh_token } = refreshResult.data as {
                accessToken: string;
                refresh_token: string;
                user: User;
            };

            const admin = (api.getState() as RootState).authAdmin.user;
            if (admin) {
                api.dispatch(logInAdmin({ accessToken, user, refresh_token }));
            } else {
                console.error("Admin is null, cannot dispatch logInAdmin");
            }

            // ✅ Optionally update cookies
            createCookie("accessToken", accessToken);

            // ✅ Retry the original request with the new access token
            result = await baseQuery(args, api, extraOptions);
        } else {
            // Refresh failed — logout
            console.log("Refresh token expired or invalid, logging out...");
            clearCookie("accessToken");
            clearCookie("refresh_token");
            api.dispatch(logOutAdmin());
        }
    }

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

type ValidTags = "loggedIn" | "events" |"analytics"

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
    tagTypes: ["loggedIn", "events", "analytics"],
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
        getAllEvents: builder.query<any, Partial<void>>({
            query() {
                return {
                    url: `/events`,
                    method: "GET"
                };
            },
            providesTags: ['events']
        }),
        getAnalytics: builder.query<any, Partial<void>>({
            query() {
                return {
                    url: `/admin/analytics`,
                    method: "GET"
                };
            },
            providesTags: ['analytics']
        }),
    }),
});

export const {
    usePrefetch,
    useGenericMutationMutation,
    useGetAllEventsQuery,
    useGetAnalyticsQuery,
} = apiSlice;