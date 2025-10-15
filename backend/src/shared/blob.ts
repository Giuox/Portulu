import { BlobSASPermissions, BlobServiceClient, SASProtocol, StorageSharedKeyCredential, generateBlobSASQueryParameters } from "@azure/storage-blob";

export function getUploadSas(containerName: string, blobName: string, minutes = 10): { url: string; expiresOn: string } {
  const accountName = process.env.STORAGE_ACCOUNT_NAME as string;
  const accountKey = process.env.STORAGE_ACCOUNT_KEY as string;
  if (!accountName || !accountKey) throw new Error("missing_storage_credentials");
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const expiresOn = new Date(Date.now() + minutes * 60 * 1000);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      startsOn: new Date(Date.now() - 60 * 1000),
      expiresOn,
      protocol: SASProtocol.Https,
      version: undefined
    },
    credential
  ).toString();
  const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
  return { url, expiresOn: expiresOn.toISOString() };
}

export function getBlobService(): BlobServiceClient {
  const accountName = process.env.STORAGE_ACCOUNT_NAME as string;
  const accountKey = process.env.STORAGE_ACCOUNT_KEY as string;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  return new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
}

