import { Fetch } from './config';
import { endPoints } from './endPoints';

export const REGISTER_ACCOUNT = (formData: any) => {
  console.log(formData, 'hello data');
  return Fetch.post(
    `/wp-json/register/v1${endPoints.REGISTER}`,
    formData,
    true,
  );
};

export const LOGIN_ACCOUNT = (payload: any) => {
  console.log('this is calling login');
  const response = Fetch.get(
    `/wp-json/login/v1${endPoints.LOGIN}?username=${payload.email}&password=${payload.password}`,
  );
  return response;
};

export const UPDATE_PASSWORD = (payload: any) => {
  const formData = new FormData();
  formData.append('user_id', payload.user_id);
  formData.append('old_password', payload.old_password);
  formData.append('new_password', payload.new_password);
  formData.append('please_change_my_password', '1');

  const response = Fetch.post(
    `/wp-json/resetuserpassword/v1${endPoints.UPDATEPASSWORD}`,
    formData,
    true,
  );
  return response;
};

export const FORGOT_PASSWORD = (email: any) => {
  console.log(email, 'hhhhhhhhhhhhhhhhhhhhhhh');
  const response = Fetch.get(
    `/wp-json/userforgotpassword/v1${endPoints.FORGOTPASSWORD}?email=${email?.email}`,
  );
  return response;
};

export const EDIT_PROFILE = (payload: any) => {
  return Fetch.post(endPoints.EDIT_PROFILE, payload);
};

export const UPDATE_AVATAR = (formData: FormData) => {
  return Fetch.upload(endPoints.UPDATE_AVATAR, formData);
};

export const GET_PROFILE_AVATAR = (userId: string | number) => {
  return Fetch.get(`${endPoints.GET_AVATAR}?user_id=${userId}`);
};
