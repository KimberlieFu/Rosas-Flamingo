import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // add new task
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask }]);
    setNewTask("");
  };

  // delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Tasks</h2>
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
        />
        <button style={styles.addButton} onClick={addTask}>
          ➕
        </button>
      </div>
      <ul style={styles.list}>
        {tasks.map((task) => (
          <li key={task.id} style={styles.listItem}>
            {task.text}
            <button style={styles.deleteButton} onClick={() => deleteTask(task.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: { padding: 20, maxWidth: 400, margin: "auto", textAlign: "center" },
  title: { fontSize: "24px", marginBottom: "10px" },
  inputContainer: { display: "flex", gap: "5px" },
  input: { flex: 1, padding: "8px", fontSize: "16px" },
  addButton: { padding: "8px", cursor: "pointer" },
  list: { marginTop: "20px", listStyleType: "none", padding: 0 },
  listItem: { display: "flex", justifyContent: "space-between", padding: "5px 10px", borderBottom: "1px solid #ccc" },
  deleteButton: { cursor: "pointer", background: "none", border: "none", fontSize: "16px" },
};

export default App;