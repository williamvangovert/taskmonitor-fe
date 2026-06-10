import axios from './axios';

export const getEnhancements = async (projectId) => {
  const { data } = await axios.get(`/projects/${projectId}/enhancements`);
  return data;
};

export const createEnhancement = async (projectId, data) => {
  const { data: responseData } = await axios.post(`/projects/${projectId}/enhancements`, data);
  return responseData;
};

export const updateEnhancement = async (projectId, enhancementId, data) => {
  const { data: responseData } = await axios.put(`/projects/${projectId}/enhancements/${enhancementId}`, data);
  return responseData;
};

export const deleteEnhancement = async (projectId, enhancementId) => {
  const { data } = await axios.delete(`/projects/${projectId}/enhancements/${enhancementId}`);
  return data;
};

export const getEnhancement = async (projectId, enhancementId) => {
  const { data } = await axios.get(`/projects/${projectId}/enhancements/${enhancementId}`);
  return data;
};
