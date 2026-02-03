// import { store } from '../redux/store';
// import { setIsLogin } from '../redux/Reducers/userReducer';

// // const BASE_URL = 'http://192.168.18.228:8081'; // change if needed
// // const BASE_URL = 'https://unvaleted-postnephritic-lucien.ngrok-free.dev'; // change if needed
// const BASE_URL = 'https://api.interaia.com'; // change if needed

// function getAuthToken() {
//   const state = store.getState();
//   // console.log(state?.user?.accessToken, 'this is my token');
//   return state?.user?.accessToken || null;
// }

// async function handleResponse(response: Response) {
//   const contentType = response.headers.get('content-type');
//   let data;

//   if (contentType && contentType.includes('application/json')) {
//     data = await response.json();
//   } else {
//     data = await response.text(); // for plain text responses
//   }

//   if (response.status === 401) {
//     store.dispatch(setIsLogin(false));
//     throw new Error(
//       typeof data === 'string' ? data : data?.message || 'Unauthorized',
//     );
//   }

//   if (!response.ok) {
//     throw new Error(
//       typeof data === 'string' ? data : data?.message || 'Something went wrong',
//     );
//   }

//   return data;
// }

// function buildHeaders(isMultipart = false) {
//   const headers: any = {};

//   if (!isMultipart) {
//     headers['Content-Type'] = 'application/json';
//   }

//   const token = getAuthToken();
//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   return headers;
// }

// /* =======================
//    BASIC HTTP METHODS
// ======================= */

// async function get(url: string) {
//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: 'GET',
//     headers: buildHeaders(),
//   });

//   return handleResponse(response);
// }

// async function post(url: string, body: any, isMultipart = false) {
//   const fullUrl = `${BASE_URL}${url}`;
//   const headers = buildHeaders(isMultipart);

//   console.log('📤 API REQUEST');
//   console.log('➡️ URL:', fullUrl);
//   console.log('➡️ METHOD: POST');
//   console.log('➡️ HEADERS:', headers);
//   console.log('➡️ BODY:', isMultipart ? body : JSON.stringify(body));

//   const response = await fetch(fullUrl, {
//     method: 'POST',
//     headers: headers,
//     body: isMultipart ? body : JSON.stringify(body),
//   });

//   console.log('⬅️ STATUS:', response.status);

//   return handleResponse(response);
// }

// async function put(url: string, body: any, isMultipart = false) {
//   const fullUrl = `${BASE_URL}${url}`;
//   const headers = buildHeaders(isMultipart);

//   console.log('📤 API REQUEST');
//   console.log('➡️ URL:', fullUrl);

//   console.log('➡️ HEADERS:', headers);
//   console.log('➡️ BODY:', isMultipart ? body : JSON.stringify(body));
//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: 'PUT',
//     headers: headers,
//     body: isMultipart ? body : JSON.stringify(body),
//   });

//   return handleResponse(response);
// }

// async function patch(url: string, body: any) {
//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: 'PATCH',
//     headers: buildHeaders(),
//     body: JSON.stringify(body),
//   });

//   return handleResponse(response);
// }

// async function _delete(url: string) {
//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: 'DELETE',
//     headers: buildHeaders(),
//   });

//   return handleResponse(response);
// }
// async function upload(url: string, formData: FormData) {
//   const response = await fetch(`${BASE_URL}${url}`, {
//     method: 'POST',
//     headers: buildHeaders(true),
//     body: formData,
//   });

//   return handleResponse(response);
// }

// export const Fetch = {
//   get,
//   post,
//   put,
//   patch,
//   delete: _delete,
//   upload,
// };
