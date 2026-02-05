import { endPoints } from './endPoints';
import { Fetch } from './config';





export const SESSION_AI = (payload: any) => {
  console.log(payload, 'this is calling login');
  const response = Fetch.post(`/session${endPoints.SESSION}`, payload);
  return response;
};

export const CHAT = (payload: any) => {
  console.log(payload, 'this is calling login');
  const response = Fetch.post(`${endPoints.CHAT}`, payload);
  return response;
};