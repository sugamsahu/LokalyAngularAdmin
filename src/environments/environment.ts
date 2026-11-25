// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiUrl: "http://192.168.1.123:3000",
  // apiUrl2: "http://192.168.1.123:3000",
  // Local backend (LokalyWebServiceNode on this machine)
  apiUrl: "http://localhost:3000",
  apiUrl2: "http://localhost:3000",
  // apiUrl: "https://apilocal.lokaly.in",
  // apiUrl2: "https://apilocal.lokaly.in",
  // apiUrl: "https://apilocalci.lokaly.in",
  // apiUrl2: "https://apilocalci.lokaly.in",
  // apiUrl: "https://apitest2.lokaly.in",
  // apiUrl2: "https://apitest2.lokaly.in",
  // apiUrl: "https://apitest.lokaly.in",
  // apiUrl2: "https://apitest.lokaly.in",
  appVersion: "2.2.1",
  USERDATA_KEY: "authf649fc9a5f55",
  tableSize: 20,
  search_time: 1000,

  //walocal
  firebase : {
  apiKey: "AIzaSyBoaTFRA4Apvi0zpQJOS3CtjzHMlPS-W20",
  authDomain: "lokaly-local.firebaseapp.com",
  projectId: "lokaly-local",
  storageBucket: "lokaly-local.appspot.com",
  messagingSenderId: "165201574587",
  appId: "1:165201574587:web:b3887b8ead4bdbedfec79e"
  }

  // watest1
  // firebase: {
  //   apiKey: "AIzaSyDCy-EIAV0ehVFOA_orxt2n-5Jq9L16yp8",
  //   authDomain: "lokalyapitestac.firebaseapp.com",
  //   projectId: "lokalyapitestac",
  //   storageBucket: "lokalyapitestac.appspot.com",
  //   messagingSenderId: "421132301696",
  //   appId: "1:421132301696:web:edcbb93a5c8852c4b3bd65",
  //   measurementId: "G-PJCJ5WNX7B",
  // },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
