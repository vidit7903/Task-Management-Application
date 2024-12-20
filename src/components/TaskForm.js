import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ fetchTasks }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/tasks`, { title, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (error) {
      alert('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Title:</label>
        <input type="text" className="form-control" required value={title}
          onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mb-3">
        <label>Description:</label>
        <textarea className="form-control" value={description}
          onChange={(e) => setDescription(e.target.value)}></textarea>
      </div>
      <button type="submit" className="btn btn-primary">Add Task</button>
    </form>
  );
};

export default TaskForm;
