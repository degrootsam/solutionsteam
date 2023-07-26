const DocuSignDownloadEnvelopeFile = async ({
  baseUrl,
  accountId,
  bearerToken,
  envelopeId,
  downloadType,
  documentId, //Should be dependant on downloadType=specificDoc in functions.js - is that possible?
  model: { name: modelName },
  property: [{ name: propertyName }],
}) => {
  const lastUrlPart =
    downloadType === "specificDoc" ? documentId : downloadType;
  const url = `${baseUrl}/accounts/${accountId}/envelopes/${envelopeId}/documents/${lastUrlPart}`;
  // https://demo.docusign.net/restapi/v2.1/accounts/d452928c-4527-42ec-bd1b-762d562f0b71/envelopes/55bd849d-5dfa-491a-99c4-899874ce90c2/documents/combined

  const response = await fetch(url, {
    headers: { Authorization: bearerToken },
  });
  const disposition = response.headers["content-disposition"][0]; //file; filename="Engagement_Letter.pdf"; documentid="22"
  const contentType = response.headers["content-type"][0]; //application/pdf
  const fileLabel = disposition
    .split(";")[1]
    .replace("filename=", "")
    .replaceAll('"', "")
    .trim(); //Engagement_Letter.pdf
  const fileExtension = fileLabel.split(".")[1]; //pdf
  const fileName = fileLabel.split(".")[0]; //Engagement_Letter

  const fileRef = await storeFile(
    modelName,
    propertyName,
    {
      contentType: contentType,
      extension: fileExtension,
      fileBuffer: response.blob().buffer,
      fileName: fileName,
    },
    { headers: {} }
  );

  return { fileRef };
};

export default DocuSignDownloadEnvelopeFile;
