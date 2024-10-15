// src/utils/referralUtils.ts

const REFERRAL_EXPIRATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

export function setReferral(address: string) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    const referralData = {
      address,
      expiresAt: Date.now() + REFERRAL_EXPIRATION
    };
    localStorage.setItem('referralData', JSON.stringify(referralData));
  }
}

export function getReferral(): string {
  const referralDataString = localStorage.getItem('referralData');
  if (referralDataString) {
    const referralData = JSON.parse(referralDataString);
    if (Date.now() < referralData.expiresAt) {
      return referralData.address;
    } else {
      localStorage.removeItem('referralData');
    }
  }
  return '0x0000000000000000000000000000000000000000';
}

export function clearReferral() {
  localStorage.removeItem('referralData');
}
