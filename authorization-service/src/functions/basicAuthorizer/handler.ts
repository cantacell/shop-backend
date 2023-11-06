import {APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent} from "aws-lambda";

import {authorizationService} from "src/services/authorization-service";
import {Effect} from "../../types/statement-effect";

export const basicAuthorizer = async (
    event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    const { headers, methodArn } = event;
    if (!headers.Authorization) {
        throw new Error("Unauthorized");
    }

    try {
        const token = headers.Authorization.split(" ")[1];
        const [login, password] = authorizationService.getDecodedTokenData(token);
        const storedPassword = process.env[login];

        const checkResult = storedPassword && storedPassword === password ? Effect.ALLOW : Effect.DENY;
        return authorizationService.getPolicy(token, methodArn, checkResult);
    } catch (error) {
        console.log(error);
    }
};