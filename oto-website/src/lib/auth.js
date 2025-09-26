/**
 * Utility functions for authentication and navigation
 */

const LOGIN_URL = 'https://digiads.digiaeon.com/login';

/**
 * Redirects user to the login page
 */
export const redirectToLogin = () => {
  window.open(LOGIN_URL, '_blank');
};

/**
 * Redirects user to the login page in the same tab
 */
export const redirectToLoginSameTab = () => {
  window.location.href = LOGIN_URL;
};

/**
 * Handles Get Started button click
 * Opens login page in a new tab
 */
export const handleGetStartedClick = () => {
  redirectToLogin();
};
