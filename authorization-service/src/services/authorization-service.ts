import {Effect} from "../types/statement-effect";

export const authorizationService = {
    getDecodedTokenData: (token: string) => {
        const tokenData = Buffer.from(token, "base64").toString("utf-8").split(":");
        return tokenData;
    },

    getPolicy: (principalId: string, resource: string | string[], effect: Effect) => {
        return {
            principalId,
            policyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "execute-api:Invoke",
                        Effect: effect,
                        Resource: resource,
                    }
                ],
            },
        };
    },
};