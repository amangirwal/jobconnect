import api from './axios';

// User/Profile APIs
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' } // For file uploads
});

// Job APIs
export const getAllJobs = (params) => api.get('/jobs', { params }); // params: { keyword, location, etc. }
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getMyJobs = () => api.get('/jobs/my-jobs');

// Application APIs
export const applyForJob = (formData) => api.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyApplications = () => api.get('/applications/my-applications');
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) => api.put(`/applications/${id}/status`, { status });
export const sendMessage = (data) => api.post('/applications/message', data);
export const getMessages = (applicationId) => api.get(`/applications/${applicationId}/messages`);
export const markAsRead = (applicationId) => api.put('/applications/message/read', { applicationId });
export const getUnreadCount = () => api.get('/applications/chats/unread-count');
export const getMyChats = () => api.get('/applications/chats');
