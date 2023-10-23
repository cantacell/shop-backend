export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: response.statusCode as number || 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response.body),
  }
}
