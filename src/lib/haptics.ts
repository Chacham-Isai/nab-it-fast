/**
 * Haptic feedback utility using the Vibration API.
 * Falls back silently on unsupported devices.
 */

const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

/** Light tap — button press, threshold crossed */
export const hapticLight = () => {
  if (canVibrate()) navigator.vibrate(10);
};

/** Medium — card swiped, action confirmed */
export const hapticMedium = () => {
  if (canVibrate()) navigator.vibrate(25);
};

/** Heavy — destructive action, major completion */
export const hapticHeavy = () => {
  if (canVibrate()) navigator.vibrate(50);
};

/** Success pattern — double pulse */
export const hapticSuccess = () => {
  if (canVibrate()) navigator.vibrate([15, 50, 15]);
};

/** Warning pattern — triple short pulse */
export const hapticWarning = () => {
  if (canVibrate()) navigator.vibrate([10, 30, 10, 30, 10]);
};

/** Error pattern — long buzz */
export const hapticError = () => {
  if (canVibrate()) navigator.vibrate([80]);
};
