import axios from './axios';

export const getProjects = async (page = 1, status = 'all') => {
  const { data } = await axios.get(`/projects?page=${page}&status=${status}`);
  return data; // sekarang return { data: [...], current_page, last_page, total }
};

export const getProject = async (id) => {
  const { data } = await axios.get(`/projects/${id}`);
  return data;
};

export const createProject = async (projectData) => {
  const { data } = await axios.post('/projects', projectData);
  return data;
};

export const updateProject = async (id, projectData) => {
  const { data } = await axios.put(`/projects/${id}`, projectData);
  return data;
};

export const deleteProject = async (id) => {
  await axios.delete(`/projects/${id}`);
};