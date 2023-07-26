const ArrayBufferToBase64 = (arrayBuffer) => {
  let base64 = "";
  const encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a;
  let b;
  let c;
  let d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i += 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += `${encodings[a]}${encodings[b]}==`;
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += `${encodings[a]}${encodings[b]}${encodings[c]}=`;
  }

  return base64;
};

const generateAchorTabsJson = (anchor_tabs) => {
  const col = anchor_tabs.split(",");
  let anchorJson = {
    anchorString: "",
    anchorUnits: "pixels",
    anchorXOffset: "0",
    anchorYOffset: "0",
  };
  let signHereTabs = [];
  col.forEach((anchor) => {
    anchorJson.anchorString = anchor;
    signHereTabs.push(anchorJson);
  });
  return signHereTabs;
};

const DocuSignCreateSignatureRequest = async ({
  document,
  signer_email,
  signer_name,
  anchor,
  signer_2_check,
  signer_email_2,
  signer_name_2,
  anchor_2,
  carbon_copies,
  date_anchor,
  date_anchor_2,
  callback_url,
  envelopes_url,
  access_token,
}) => {
  // File to b64
  const fileExtension = document.name.split(".")[1];
  const fileName = document.name.split(".")[0];
  const fileUrl = document.url;
  if (!fileExtension | !fileName | !fileUrl) {
    throw new Error("Could not find file extension, file name or file url");
  }

  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const buffer = blob.buffer;
  const docbase64 = ArrayBufferToBase64(buffer);
  if (!docbase64) {
    throw new Error("Could not convert file to base64");
  }

  let envelopeJson = {
    emailSubject: `Signature request for: ${fileName}`,
    emailBlurb: `Your signature has been requested for the document ${fileName}. Please review the document.`,
    documents: [
      {
        documentBase64: docbase64,
        name: fileName,
        fileExtension: fileExtension,
        documentId: "1",
      },
    ],
    recipients: {
      carbonCopies: [],
      signers: [],
    },
    status: "sent",
    eventNotification: {},
  };

  // 1st signer json
  const signerJson = {
    email: signer_email,
    name: signer_name,
    recipientId: "1",
    routingOrder: "1",
    tabs: {
      dateSignedTabs: [
        {
          bold: "true",
          anchorString: date_anchor,
          anchorUnits: "pixels",
          anchorYOffset: "0",
          anchorXOffset: "0",
        },
      ],
      signHereTabs: generateAchorTabsJson(anchor),
    },
  };
  envelopeJson.recipients.signers.push(signerJson);

  //add Carbon Copies
  if (carbon_copies) {
    cc_col = carbon_copies.split(",");
    cc_col.forEach((cc, index) => {
      envelopeJson.recipients.carbonCopies.push({
        email: cc,
        name: cc,
        recipientId: `${index + 3}`,
        routingOrder: `${index + 3}`,
      });
      // index + 3 to make sure the recipientId is not the same as the signerIds
    });
  }

  if (signer_2_check) {
    // 2nd signer json
    const signerJson_2 = {
      email: signer_email_2,
      name: signer_name_2,
      recipientId: "2",
      routingOrder: "2",
      tabs: {
        dateSignedTabs: [
          {
            bold: "true",
            anchorString: date_anchor_2,
            anchorUnits: "pixels",
            anchorYOffset: "0",
            anchorXOffset: "0",
          },
        ],
        signHereTabs: generateAchorTabsJson(anchor_2),
      },
    };
    envelopeJson.recipients.signers.push(signerJson_2);
  }
  if (callback_url) {
    envelopeJson.eventNotification = {
      recipientEvents: [
        {
          recipientEventStatusCode: "Completed",
          includeDocuments: "true",
        },
        {
          includeDocuments: "false",
          recipientEventStatusCode: "Declined",
        },
        {
          includeDocuments: "false",
          recipientEventStatusCode: "AuthenticationFailed",
        },
        {
          includeDocuments: "false",
          recipientEventStatusCode: "AutoResponded",
        },
      ],
      eventData: {
        version: "restv2.1",
        format: "json",
      },
      url: callback_url,
    };
  }

  const bearerToken = access_token.startsWith("Bearer ")
    ? access_token
    : `Bearer ${access_token}`;
  const apiUrl = envelopes_url.startsWith("https://")
    ? envelopes_url
    : `https://${envelopes_url}`;

  const response_envelope = await fetch(envelopes_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
    body: JSON.stringify(envelopeJson),
  });
  const result = await response_envelope.json();
  if (result.hasOwnProperty("errorCode")) {
    throw new Error("DocuSign returned an error: " + result.errorCode);
  } else {
    return { envelope_id: result.envelopeId };
  }
};
export default DocuSignCreateSignatureRequest;
