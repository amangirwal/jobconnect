import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateJob from './pages/CreateJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import ApplicationsList from './pages/ApplicationsList';
import MyChats from './pages/MyChats';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="jobs/:jobId/applications" element={<ApplicationsList />} />
        <Route path="create-job" element={<CreateJob />} />
        <Route path="my-jobs" element={<MyJobs />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="my-chats" element={<MyChats />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
