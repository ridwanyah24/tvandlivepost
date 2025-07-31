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
export type ValidTags =
    | "loggedIn"
    | "events"
    | "analytics"
    | "updates"
    | "videos"
    | "event-updates"
    | "update-comments"
    | "all-videos";
type MutationArg = {
    /** The URL for the request */
    url: string;

    /** The HTTP method for the request (defaults to "POST") */
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';

    /** The body of the request */
    body?: any;

    /** Tags to invalidate cached data upon request completion */
    invalidatesTags?: Array<{
        type: ValidTags;
        id?: string | number;
    }>;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["all-videos", "loggedIn", "events", "analytics", "updates", "videos", "event-updates", "update-comments"] as readonly ValidTags[],
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
        getRecentUpdates: builder.query<any, Partial<void>>({
            query() {
                return {
                    url: `/updates/recent`,
                    method: "GET"
                };
            },
            providesTags: ['updates']
        }),
        getRecentVideos: builder.query<any, Partial<void>>({
            query() {
                return {
                    url: `/tvs/recent`,
                    method: "GET"
                };
            },
            providesTags: ['videos']
        }),
        getEventUpdates: builder.query<any, { id: string; limit?: number; offset?: number }>({
            query: ({ id, limit = 2, offset = 0 }) => ({
                url: `/events/${id}/updates?limit=${limit}&offset=${offset}`,
                method: "GET",
            }),
            providesTags: ["event-updates"],
        }),
        getUpdateComments: builder.query<any, { id: string }>({
            query: ({ id }: { id: string }) => ({
                url: `/updates/${id}/comments`,
                method: "GET"
            }),
            providesTags: [{ type: "update-comments" }]
        }),
        getVideoComments: builder.query<any, { id: string }>({
            query: ({ id }: { id: string }) => ({
                url: `/tvs/${id}/comments`,
                method: "GET"
            }),
            providesTags: [{ type: "update-comments" }]
        }),
        getVideoViews: builder.query<any, { id: number | string }>({
            query: ({ id }: { id: number | string }) => ({
                url: `/tvs/${id}/views`,
                method: "GET"
            }),
            providesTags: [{ type: "all-videos" }]
        }),
        getSingleVideo: builder.query<any, { id: number | string }>({
            query: ({ id }: { id: number | string }) => ({
                url: `/tvs/${id}`,
                method: "GET"
            }),
            providesTags: [{ type: "all-videos" }]
        }),
        getAllVideos: builder.query<any, Partial<{ category_ids?: number[] }>>({
            query: ({ category_ids } = {}) => {
                const searchParams = new URLSearchParams();
                if (category_ids && category_ids.length > 0) {
                    category_ids.forEach(id => searchParams.append('category_ids', id.toString()));
                }

                return {
                    url: `/tvs/ungrouped?${searchParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ['all-videos'],
        }),
        getAllCategories: builder.query<any, Partial<void>>({
            query() {
                return {
                    url: `/categories`,
                    method: "GET",
                }
            }
        })
    }),
});

export const {
    usePrefetch,
    useGenericMutationMutation,
    useGetAllEventsQuery,
    useGetAnalyticsQuery,
    useGetRecentUpdatesQuery,
    useGetRecentVideosQuery,
    useGetUpdateCommentsQuery,
    useGetEventUpdatesQuery,
    useGetAllVideosQuery,
    useGetVideoViewsQuery,
    useGetSingleVideoQuery,
    useGetVideoCommentsQuery,
    useGetAllCategoriesQuery,
} = apiSlice;