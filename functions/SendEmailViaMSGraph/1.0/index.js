const parseMapVariables = (headers) =>
  headers.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const checkBearerToken = (access_token) => {
  if (access_token.startsWith("Bearer ")) {
    return access_token;
  }
  return `Bearer ${access_token}`;
};
const buildRecipients = (recipients) => {
  let array = [];
  recipients.forEach((r) => {
    if (r.key === r.value) {
      array.push({ emailAddress: { address: r.value } });
    } else array.push({ emailAddress: { name: r.key, address: r.value } });
  });
  return array;
};
const SendEmailViaMSGraph = async ({
  log,
  accessToken,
  sendFromEmail,
  sendFromName,
  subject,
  recipients,
  ccRecipients,
  bccRecipients,
  bodyContentType,
  body,
  attachments,
}) => {
  if (log) {
    console.log(
      `Send Mail via Graph API initiated. Parameters:
            sendFromEmail: ${sendFromEmail}
            sendFromName: ${sendFromName}
            subject: ${subject}
            recipients: ${JSON.stringify(recipients)}
            ccRecipients: ${ccRecipients}
            bccRecipients: ${bccRecipients}
            bodyContentType: ${bodyContentType}
            body: ${body}
            accessToken: ${accessToken}
            attachments: ${attachments}`
    );
  }
  const repientsJson = buildRecipients(recipients);
  const ccJson = buildRecipients(ccRecipients);
  const bccJson = buildRecipients(bccRecipients);
  const bearerToken = checkBearerToken(accessToken);
  const emailDomainRegex = /(?<=@)[^.]+(?=\.)/g; // Regex to get the domain (excluding extension) from the email
  const emailDomain = sendFromEmail.match(emailDomainRegex)[0]; // user@bettyblocks.com => bettyblocks
  const userPrincipalName = sendFromEmail.replace(
    emailDomain,
    emailDomain + ".onmicrosoft"
  ); // user@bettyblocks.com => user@bettyblocks.onmicrosoft.com

  const apiUrl = `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/sendMail`;

  let attachmentsJson = [];
  if (attachments) {
    const mimePattern = /^data:([^;]+);/;
    attachments.forEach((attch, index) => {
      let match = attch.value.match(mimePattern);
      if (match) {
        if (log) {
          console.log(
            `Attachment ${index}: \n ${attch.key} \n Mimetype: ${match[1]} \n B64: ${attch.value}`
          );
        }
        attachmentsJson.push({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attch.key,
          contentBytes: attch.value.split(",")[1],
          contentType: match[1],
        });
      } else {
        var error = `Unable to get mime type for: ${attch.key}. Please validate if the mime type is part of the Attachment Base64 `;
        console.error(error);
        throw new Error(error);
      }
    });
  }

  const requestBody = {
    from: {
      emailAddress: {
        address: sendFromEmail,
        name: sendFromName,
      },
    },
    message: {
      subject: subject,
      body: {
        contentType: bodyContentType,
        content: body,
      },
      toRecipients: repientsJson,
      ccRecipients: ccJson,
      bccRecipients: bccJson,
      attachments: attachmentsJson,
    },
  };
  if (log) {
    console.log(`Request body: ${JSON.stringify(requestBody)}`);
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearerToken,
    },
    body: JSON.stringify(requestBody),
  };
  if (log) {
    console.log(`Request URL: ${apiUrl}`);
  }
  const response = await fetch(apiUrl, options);
  if (log) {
    console.log(`Response: ${JSON.stringify(response)}`);
  }
  return { as: response.status };
};

export default SendEmailViaMSGraph;
