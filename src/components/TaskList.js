import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${apiUrl}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) {
      alert('Failed to fetch tasks');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${apiUrl}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const handleUpdate = async (taskId, updatedTask) => {
    try {
      await axios.put(`${apiUrl}/tasks/${taskId}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      alert('Failed to update task');
    }
  };

  return (
    <div>
      <h2>Your Tasks</h2>
      <TaskForm fetchTasks={fetchTasks} />
      <ul className="list-group mt-3">
        {tasks.map(task => (
          <li key={task._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
            </div>
            <div>
              <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdate(task._id, { status: task.status === 'complete' ? 'incomplete' : 'complete' })}>
                {task.status === 'complete' ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
