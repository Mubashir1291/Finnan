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

export const UPDATE_PROFILE = (payload: any) => {
  const formData = new FormData();
  formData.append('user_id', payload.user_id);
  formData.append('address', payload.address);
  formData.append('phone', payload.phone);
  formData.append('first_name', payload.first_name);
  formData.append('is_submit', '1');

  const response = Fetch.post(
    `/wp-json/updateuserprofileinfo/v1${endPoints.EDIT_PROFILE}`,
    formData,
    true,
  );
  return response;
};
export const FORGOT_PASSWORD = (email: any) => {
  // console.log(email, 'hhhhhhhhhhhhhhhhhhhhhhh');
  const response = Fetch.get(
    `/wp-json/userforgotpassword/v1${endPoints.FORGOTPASSWORD}?email=${email?.email}`,
  );
  return response;
};

export const UPDATE_AVATAR = (payload: any, image: any) => {
  const formData = new FormData();
  formData.append('user_id', payload.user_id);
  formData.append('user_avatar_upload', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'avatar.jpg',
  });

  const response = Fetch.post(
    `/wp-json/upoload-profile-avatar/v1${endPoints.AVATAR}`,
    formData,
    true,
  );
  return response;
};

export const GET_PROFILE_AVATAR = (userId: string | number) => {
  return Fetch.get(
    `/wp-json/get-profile-avatar/v1${endPoints.GET_AVATAR}?user_id=${userId}`,
  );
};
