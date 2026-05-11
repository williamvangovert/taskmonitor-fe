import axios from './axios';

export const login = async (credentials) => {
  const { data } = await axios.post('/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await axios.post('/register', userData);
  return data;
};

export const logout = async () => {
  await axios.post('/logout');
};

export const getMe = async () => {
  const { data } = await axios.get('/me');
  return data;
};
