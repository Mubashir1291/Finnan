import { endPoints } from './endPoints';
import { Fetch } from './config';

export const CHAT = (payload: any) => {
  console.log(payload, 'this is calling login');
  const response = Fetch.post(`${endPoints.CHAT}`, payload);
  return response;
};
export {
  userLogin as AI_LOGIN,
  userSession as AI_SESSION,
  AI_CHATTING,
} from './config';
