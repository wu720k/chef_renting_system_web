// Development build (npm start / ng serve). "/api" is forwarded to http://localhost:8080 by proxy.conf.json,
// so no CORS setup is needed in the browser.
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  chefsUrl: 'https://chat-4b282-default-rtdb.europe-west1.firebasedatabase.app/chefs.json',
  userId: 101,
};
