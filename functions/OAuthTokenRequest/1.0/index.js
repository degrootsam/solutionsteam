const parseMapVariables = (headers) =>
  headers.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const OAuthTokenRequest = async ({
  secret,
  clienID,
  url,
  body,
  method,
  headers = [],
}) => {
  var requestData = parseMapVariables(body);
  var requestHeaders = parseMapVariables(headers);

  if (!requestHeaders.hasOwnProperty("Content-Type")) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (!requestHeaders.hasOwnProperty("Accept")) {
    requestHeaders["Accept"] = "application/json";
  }
  var requestUrl = url.startsWith("http") ? url : `https://${url}`;
  if (requestHeaders["Content-Type"] === "application/x-www-form-urlencoded") {
    requestData = Object.keys(requestData)
      .map((key) => `${key}=${requestData[key]}`)
      .join("&");
  } else requestData = JSON.stringify(requestData);

  const options = {
    method,
    headers: requestHeaders,
    body: requestData,
  };

  const response = await fetch(requestUrl, options);
  const data = await response.json();
  if (!data.hasOwnProperty("access_token")) {
    console.error(
      `Couldn't fetch access token, expected access_token but received: ${JSON.stringify(
        data
      )}`
    );
    throw new Error(
      `Couldn't fetch access token, expected access_token but received: ${JSON.stringify(
        data
      )}`
    );
  }
  return data;
};

export default OAuthTokenRequest;
