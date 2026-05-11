import axios from './axios';

export const getTimelines = async (projectId) => {
  const { data } = await axios.get(`/projects/${projectId}/timelines`);
  return data;
};

export const getTimeline = async (projectId, timelineId) => {
  const { data } = await axios.get(`/projects/${projectId}/timelines/${timelineId}`);
  return data;
};

export const createTimeline = async (projectId, timelineData) => {
  const { data } = await axios.post(`/projects/${projectId}/timelines`, timelineData);
  return data;
};

export const updateTimeline = async (projectId, timelineId, timelineData) => {
  const { data } = await axios.put(`/projects/${projectId}/timelines/${timelineId}`, timelineData);
  return data;
};

export const deleteTimeline = async (projectId, timelineId) => {
  await axios.delete(`/projects/${projectId}/timelines/${timelineId}`);
};
