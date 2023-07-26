import Base64 from "./base64";
const parseMapVariables = (headers) =>
  headers.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const DocuSignGetAccessToken = async ({
  integrationSecret,
  integrationKey,
  url,
  body,
  headers = [],
}) => {
  var BasicAuthHeader = "";
  if (integrationKey && integrationSecret) {
    BasicAuthHeader =
      "Basic " + Base64.encode(integrationKey + ":" + integrationSecret);
  }
  const requestData = parseMapVariables(body);
  var requestHeaders = parseMapVariables(headers);
  if (!requestHeaders.hasOwnProperty("Content-Type")) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (BasicAuthHeader != "") {
    requestHeaders["Authorization"] = BasicAuthHeader;
  }
  const options = {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(requestData),
  };

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.hasOwnProperty("access_token")) {
    console.error(
      `Couldn't fetch access token, expected access_token but received: ${data}`
    );
    throw new Error(
      `Couldn't fetch access token, expected access_token but received: ${data}`
    );
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
};

export default DocuSignGetAccessToken;
