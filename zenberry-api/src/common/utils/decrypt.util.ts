import * as CryptoJS from 'crypto-js';

export const decrypt = (data: string | null | undefined) => {
  if (!data) return data;
  const key = process.env.GENERAL_ENCRYPTION_SECRET;
  const bytes = CryptoJS.AES.decrypt(data, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}