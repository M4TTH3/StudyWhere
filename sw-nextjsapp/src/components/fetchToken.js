import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "@/authConfig/authConfig";
import { useCallback, useState } from "react";
import axios from "axios";

export function useSWAPI() {
    const { instance } = useMsal()
    const isAuth = useIsAuthenticated()

    const [apiCallContent, setApiCallContent] = useState(null)
    const [isLoading, setIsLoading] = useState(0)

    const apiRequest = async (accessToken, method, apiRoute, optional_args) => {
        const args = {
            header_options: {},
            optional_args: {},
            ...optional_args
        };

        const endpoint = apiRoute;

        const callApiInfo = {
            endpoint: endpoint,
            params: {
                method: method,
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    ...args.header_options
                },
                ...args.optional_args
            }
        };

        const response = await axios.post('/api/callswapi', callApiInfo);
        setApiCallContent(response?.data)

        return response;
    }

    const callSWAPI = async (method, apiRoute, optional_args={}, updateLoading=true) => {
        if (updateLoading) setIsLoading(prev => prev + 1);
        if (isAuth) {
            try {
                const tokenRequest = await instance.acquireTokenSilent(loginRequest);
                const response = await apiRequest(tokenRequest.accessToken, method, apiRoute, optional_args);
                if (updateLoading) setIsLoading(prev => prev - 1);
                return response;
            } catch (error) {
                console.log(error);
                if (error instanceof InteractionRequiredAuthError) {
                    try {
                        instance.logoutRedirect({});
                    } catch (logoutError) {
                        console.log(logoutError);
                    }
                }
            }
        }
        
        if (updateLoading) setIsLoading(prev => prev - 1);
        return null;
    }

    return {
        callSWAPI: useCallback(callSWAPI, [isAuth, instance]),
        isLoading,
        apiCallContent
    }
}
