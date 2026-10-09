// Production build (ng build). The API is called directly; the Spring Boot API allows
// http://localhost:4200 through CORS (see Chef_Renting_System_API application.properties).
export const environment = {
  production: true,
  /** Base URL of the Spring Boot API. */
  apiBaseUrl: 'http://localhost:8080/api',
  /**
   * JSON endpoint of the chef data (e.g. the Firebase Realtime Database URL ending in ".json").
   * If it fails or returns no usable chef, the local fallback src/assets/data/chefs.json is used.
   */
  chefsUrl: 'https://chat-4b282-default-rtdb.europe-west1.firebasedatabase.app/chefs.json',
  /** Fixed user id (there is no authentication in this assignment). */
  userId: 101,
};
