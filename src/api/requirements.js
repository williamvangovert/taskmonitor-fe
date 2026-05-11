import axios from './axios';

export const getRequirements = async (timelineId) => {
  const { data } = await axios.get(`/timelines/${timelineId}/requirements`);
  return data;
};

export const getRequirement = async (timelineId, requirementId) => {
  const { data } = await axios.get(`/timelines/${timelineId}/requirements/${requirementId}`);
  return data;
};

export const createRequirement = async (timelineId, requirementData) => {
  const { data } = await axios.post(`/timelines/${timelineId}/requirements`, requirementData);
  return data;
};

export const updateRequirement = async (timelineId, requirementId, requirementData) => {
  const { data } = await axios.put(`/timelines/${timelineId}/requirements/${requirementId}`, requirementData);
  return data;
};

export const deleteRequirement = async (timelineId, requirementId) => {
  await axios.delete(`/timelines/${timelineId}/requirements/${requirementId}`);
};
