import * as CryptoJS from 'crypto-js';

export const encrypt = (data: string | null | undefined) => {
  if (!data) return data;
  const key = process.env.GENERAL_ENCRYPTION_SECRET;
  return CryptoJS.AES.encrypt(data, key).toString();
}