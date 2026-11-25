importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-messaging.js');

// watest1
// firebase.initializeApp({
//   apiKey: "AIzaSyDCy-EIAV0ehVFOA_orxt2n-5Jq9L16yp8",
//   authDomain: "lokalyapitestac.firebaseapp.com",
//   projectId: "lokalyapitestac",
//   storageBucket: "lokalyapitestac.appspot.com",
//   messagingSenderId: "421132301696",
//   appId: "1:421132301696:web:edcbb93a5c8852c4b3bd65",
//   measurementId: "G-PJCJ5WNX7B"
// });

// walocal
firebase.initializeApp({
  apiKey: "AIzaSyBoaTFRA4Apvi0zpQJOS3CtjzHMlPS-W20",
  authDomain: "lokaly-local.firebaseapp.com",
  projectId: "lokaly-local",
  storageBucket: "lokaly-local.appspot.com",
  messagingSenderId: "165201574587",
  appId: "1:165201574587:web:b3887b8ead4bdbedfec79e"
})
// console.log(firebase.messaging())
const messaging = firebase.messaging();
