const otpStore = new Map();

export function saveOTP(mobile, otp) {
  otpStore.set(mobile, {
    otp: String(otp),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

export function getOTP(mobile) {
  return otpStore.get(mobile);
}

export function deleteOTP(mobile) {
  otpStore.delete(mobile);
}