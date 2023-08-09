# Solutions Team

Any steps created by the Solutions team within Betty Blocks, which are not part of another repo.
For questions please contact Betty Blocks via the in-platform chat support or solutions@bettyblocks.com

### Calculate Average Or Sum

<!-- MK -->

This function expects a collection of records and the property you'd like to use to calculate the avg/sum of.
If you have the following collection

```
[
  {
    "clientName": "Betty Blocks",
    "revenue": 200
  },
  {
    "clientName": "iManage",
    "revenue": 100
  }
]
```

You can type `revenue` as the property name to use that value.
The expected output will then be 300 (when sum) or 150 (when avg)
Note that if the collection does not have any records, this function will always return 0 and the property should always be available in the every record in the collection.

# SEND MAIL VIA MS GRAPH API

## OAuthTokenRequest Function

The OAuthTokenRequest function is designed to simplify the process of making OAuth token requests by encapsulating the required logic for constructing and sending requests. This function supports various request configurations and handles common headers and data formats.

### Parameters

The OAuthTokenRequest function accepts the following parameters:

- secret (string, required): The client secret for authentication.
- clienID (string, required): The client ID for authentication.
- url (string, required): The URL to send the token request to. It should support HTTPS.
- body (object, required): The request body containing parameters required for token acquisition.
- method (string, required): The HTTP method for the request (e.g., 'POST').
- headers (array, optional): An array of header objects containing key (string) and value (string) pairs.

### Response

The function returns a Promise that resolves to the parsed JSON response from the token request. If the response does not contain an access_token property, an error will be thrown.

### How it works

1. The parseMapVariables function takes an array of objects (headers) and converts it into a single object where each object's key becomes a property in the new object, with the corresponding value.

2. The OAuthTokenRequest function is defined. It is an asynchronous function that takes a configuration object as an argument. This configuration object includes various properties such as secret, clienID, url, body, method, and headers.

3. Inside the OAuthTokenRequest function:

- The parseMapVariables function is used to convert the body and headers arrays into objects, which will be used later.
- Default headers for the request are set. If the Content-Type header is not provided, it is set to 'application/json'. Similarly, if the Accept header is not provided, it is set to 'application/json'.
- The url is checked and modified to include 'https://' if it doesn't start with 'http'.
- Depending on the Content-Type header, the requestData is converted to a URL-encoded string or JSON string.
- The options object is constructed with the method, headers, and body for the fetch request.
- The fetch function is used to make an HTTP request to the specified url with the provided options.
- The response is parsed as JSON using response.json().
- If the response JSON does not contain an access_token property, an error is logged and thrown.
- The OAuthTokenRequest function is exported as the default export of the module.

In summary, the OAuthTokenRequest function simplifies the process of making OAuth token requests. It constructs the necessary request headers, formats the request data, makes the request using the fetch API, and handles the response by parsing it as JSON. The function also ensures that an access_token property is present in the response and throws an error if it's not found. This code is meant to be used as a utility for making OAuth token requests in JavaScript applications.

## SendEmailViaMSGraph Function

The `SendEmailViaMSGraph` function facilitates sending emails using the Microsoft Graph API. It constructs and sends emails, allowing you to specify various email details, recipients, attachments, and more.

### Parameters

The SendEmailViaMSGraph function accepts the following parameters:

- log (boolean, optional): Enable or disable logging for debugging purposes.
- accessToken (string, required): Access token for authenticating with the Microsoft Graph API.
- sendFromEmail (string, required): Email address of the sender.
- sendFromName (string, required): Display name of the sender.
- subject (string, required): Subject of the email.
- recipients (array of objects, required): Array of recipient objects, where each object contains key (recipient name) and value (recipient email address).
- ccRecipients (array of objects, optional): Array of CC recipient objects, similar to recipients.
- bccRecipients (array of objects, optional): Array of BCC recipient objects, similar to recipients.
- bodyContentType (string, required): Content type of the email body ('text/plain' or 'text/html').
- body (string, required): Content of the email body.
- attachments (array of objects, optional): Array of attachment objects, where each object contains key (attachment filename) and value (base64-encoded attachment content).

### Response

The function returns a Promise that resolves to an object indicating the status of the email sending process. The returned object has a property as containing the HTTP status code of the response from the Microsoft Graph API.

### How it works

1. The repientsJson, ccJson, and bccJson arrays are constructed by invoking the buildRecipients function on the recipients, ccRecipients, and bccRecipients arrays, respectively.
2. The checkBearerToken function is used to ensure that the accessToken starts with "Bearer " and adjust it if necessary.
3. The sender's emailDomain is extracted using a regex pattern and used to create a userPrincipalName for the sender.
   The emailDomain is extracted from the sendFromEmail using a regular expression (emailDomainRegex). This gives you the domain part of the email address (e.g., 'bettyblocks' from 'user@bettyblocks.com').The userPrincipalName is constructed by replacing the extracted emailDomain with the same emailDomain plus .onmicrosoft. This effectively changes the domain part of the email address to the required format for the Microsoft Graph API (e.g., 'user@bettyblocks.onmicrosoft.com').
4. The apiUrl is constructed using the userPrincipalName.
5. An array attachmentsJson is populated by iterating through the attachments array, converting each attachment's data to a specific format if it has a valid MIME type.
6. The requestBody object is constructed with various properties, including the sender, message details, recipients, and attachments.
7. The options object is created with the necessary headers and request body for the fetch request.
8. The fetch function is used to send a POST request to the Microsoft Graph API using the constructed URL and options.
9. The function returns an object with a property as containing the HTTP status code of the response.

In essence, the function constructs the necessary request data, headers, and options, sends the request using the fetch API, and handles the response. The omitted "if log is true" steps involve logging information for debugging purposes and can be removed if logging is not needed. This code is meant to be used as a utility for sending emails through the Microsoft Graph API in JavaScript applications.

# DOCUSIGN

The DocuSign Signature Request API allows developers to integrate DocuSign's electronic signature capabilities into their applications, enabling users to sign documents electronically with legally binding signatures. The API provides a set of endpoints that allow you to create, manage, and track signature requests, as well as access various features provided by the DocuSign platform.

<!-- TO DO: Explain DocuSign flow with a whimsical processflow -->

### The DocuSign steps in this block are:

- CreateSignatureRequest: one step to create a signature request per mail in the most simple form, based on a document from a datamodel, using [anchor tabs](### What are Anchor Tabs) sent out to one or two signers.
- DownloadSignatureFile(s): One step to download all of the files inside of an Envelope, to use once (all) the document(s) is/are signed.
- GetAccessToken: A step to retrieve an access token for a specific user. The access token is always connected to a single user, who's name will be presented in the signature request as the requester. Therefore your app should ideally incorporate access token flows for a logged in user (in Betty Blocks).

### Key Features of the DocuSign Signature Request API:

- Create Envelope: The API allows you to create an envelope, which represents a transaction for sending one or more documents to one or more recipients for signing. You can include details about the recipients, documents, signature tabs, and other settings.
- Add Recipients: You can specify one or more recipients for an envelope, such as signers, carbon copy recipients, and certified delivery recipients. Each recipient can be assigned specific roles, routing order, and signing tabs.
- Signature Tabs: The API supports various types of signature tabs, including sign here tabs, date signed tabs, initial tabs, and custom tabs. These tabs are used to indicate where recipients should provide their signatures, initials, or dates.
- Authentication and Access Control: DocuSign provides different authentication methods to ensure the security and identity of signers. Recipients can sign documents using methods such as email-based authentication, access code authentication, or social authentication.
- Event Notifications: You can set up event notifications to receive updates when recipients complete, decline, or interact with the envelope. These notifications can be sent to a callback URL specified by your application.
- Status Tracking: The API allows you to track the status of envelopes, recipients, and documents. You can check if an envelope has been sent, delivered, completed, or voided.
- Error Handling: The API returns detailed error messages in case of issues with requests. You can handle these errors in your application to provide appropriate feedback to users.
- Integration and Authentication: To use the DocuSign API, you need to obtain an API access token through authentication. DocuSign supports OAuth 2.0 for secure access to the API endpoints.
- Overall, the DocuSign Signature Request API provides a powerful set of tools to integrate electronic signatures into your applications, streamlining workflows, reducing paperwork, and improving the signing experience for users.
- Please note that the specific API endpoints, parameters, and functionalities may be subject to updates and changes, so it's essential to refer to the official DocuSign API documentation for the most up-to-date information.

## DocuSignCreateSignatureRequest function

<!-- todo: explain how a custom https step can also be used if this step is not sufficient -->

Please also take a look at the [DocuSign API documentation](https://developers.docusign.com/docs/esign-rest-api/how-to/request-signature-email-remote/).
The DocuSignCreateSignatureRequest function is a Node.js function that enables you to create and send signature requests using the DocuSign API. This function takes various input parameters, processes the data, and sends a signature request to the specified recipients.

### What are Anchor Tabs

This action step works based on Anchor Tabs inside the document to be signed.
In the DocuSign API, Anchor Tabs are a type of tab used to position fields (such as signature, date, initial, etc.) within a document automatically. Instead of specifying exact X and Y coordinates for each tab, you can define an anchor string that the API uses to find the appropriate location in the document to place the tab.

Anchor Tabs are particularly useful when dealing with dynamic documents where the location of tabs might vary based on the document's content. By using an anchor string, you allow DocuSign to intelligently find the appropriate location for the tab based on the content surrounding the anchor.

Anchor Tabs can be used for various types of tabs, including sign here tabs, initial tabs, date tabs, and more. For example, you might have a document with a sentence like "Sign here:" followed by a blank space for the signer's signature. You can define "Sign here:" as the anchor string, and DocuSign will automatically place the signature tab at that location.

The anchor string can be a simple text string or a combination of text and special syntax to provide more specific instructions to the API. The syntax can include using square brackets to indicate optional text or using special characters like tilde (~) to denote relative positioning from the anchor string.

Using Anchor Tabs simplifies the process of placing tabs accurately in dynamic documents and makes it easier to automate the signing process. It also allows you to create templates with defined anchor strings, making it possible to use the same template with different documents that have varying content while still placing the tabs correctly.

### Function Parameter examples

```
const result = await DocuSignCreateSignatureRequest({
  document: {
    name: "sample_document.pdf",
    url: "https://example.com/sample_document.pdf",
  },
  signer_email: "signer1@example.com",
  signer_name: "Signer 1",
  anchor: "Sign here",
  signer_2_check: true,
  signer_email_2: "signer2@example.com",
  signer_name_2: "Signer 2",
  anchor_2: "Sign here, Initial here",
  carbon_copies: "cc1@example.com, cc2@example.com",
  date_anchor: "Date Signed",
  date_anchor_2: "Date Signed (Signer 2)",
  callback_url: "https://example.com/docusign-callback",
  envelopes_url: "https://api.docusign.com/v2.1/accounts/{accountId}/envelopes",
  access_token: "Bearer <your_access_token>",
});
```

### Important notes

- Ensure that you have valid URLs for the document and callback. The function will throw an error if any of these URLs are missing or invalid.
- The function generates signature tabs based on the provided anchor texts. Ensure that the anchor texts match appropriately within your document.
- If signer_2_check is false, the function will only handle the first signer's information. If it is true, it will handle information for both the first and second signers.
- Carbon copies can be added by providing a comma-separated list of email addresses in the carbon_copies parameter.
- If a callback URL is provided, DocuSign will send event notifications to that URL. Make sure your callback server is configured to handle these notifications correctly.

## DocuSignDownloadEnvelopeFile function

The DocuSignDownloadEnvelopeFile function is a Node.js function that allows you to download a file associated with a DocuSign envelope. This function fetches the file from the DocuSign API based on the provided parameters and stores it as a file in a specified location.
This incorporates the secured saving of Betty Blocks assets, which is why you'll have to define a Model and Property in which you want to save the resulting file - so it generates a FileStorageRequets. The output of the function is the actual reference to that fileStorageRequest which you can then assign to the correct record in an update step.

### Function parameter examples

```
const result = await DocuSignDownloadEnvelopeFile({
  baseUrl: "https://demo.docusign.net/restapi/v2.1",
  accountId: "d452928c-4527-42ec-bd1b-762d562f0b71",
  bearerToken: "<your_bearer_token>",
  envelopeId: "55bd849d-5dfa-491a-99c4-899874ce90c2",
  downloadType: "combined",
  model: { name: "MyModel" },
  property: [{ name: "MyProperty" }],
});
```

### Important notes

Important Notes

- The function requires proper authentication with the DocuSign API, which is achieved by passing the bearerToken in the HTTP request header.
- The downloadType parameter determines which type of file will be downloaded. Make sure to provide the correct value based on your requirements.
- If downloadType is set to "specificDoc", the documentId parameter must be provided to specify which document to download.
- The downloaded file is stored using the storeFile function. This is the secure way files can be stored in Betty Blocks.
- The model and property parameters help in organizing and associating the downloaded file with a specific model and property in your application. Ensure that you pass valid objects with appropriate name properties.
- Make sure to handle any potential errors or exceptions that may occur during the file download and storage process.
