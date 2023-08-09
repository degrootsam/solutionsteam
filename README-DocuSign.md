# DocuSign integration

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
