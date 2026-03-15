import { useState, useEffect } from "react";
import "./App.css";

function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("todo_tasks");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
  };

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () =>
    setTasks((prev) => prev.filter((t) => !t.completed));

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return { tasks, addTask, toggleTask, deleteTask, clearCompleted, counts };
}

function TaskInput({ onAdd }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput("");
  };

  return (
    <div className="input-row">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="What needs doing?"
        className="task-input"
        maxLength={120}
      />
      <button onClick={handleAdd} disabled={!input.trim()} className="add-btn">
        Add
      </button>
    </div>
  );
}

function FilterBar({ filter, setFilter, counts }) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Done" },
  ];

  return (
    <div className="filter-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setFilter(tab.key)}
          className={`filter-btn ${filter === tab.key ? "filter-btn-active" : ""}`}
        >
          {tab.label}
          <span className={`badge ${filter === tab.key ? "badge-active" : ""}`}>
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="task-item">
      <button
        onClick={() => onToggle(task.id)}
        className={`checkbox ${task.completed ? "checkbox-done" : ""}`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path
              d="M1 4L4 7.5L10 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        onClick={() => onToggle(task.id)}
        className={`task-text ${task.completed ? "task-text-done" : ""}`}
      >
        {task.text}
      </span>

      <button onClick={() => onDelete(task.id)} className="delete-btn" aria-label="Delete task">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}

export default function App() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompleted, counts } = useTasks();
  const [filter, setFilter] = useState("all");

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="page">
      <div className="card">
        <header className="header">
          <div className="dot" />
          <div>
            <h1 className="title">My Tasks</h1>
            <p className="subtitle">
              {counts.active === 0 && counts.all > 0
                ? "Everything done — nice work! 🎉"
                : `${counts.active} task${counts.active !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </header>

        <TaskInput onAdd={addTask} />
        <FilterBar filter={filter} setFilter={setFilter} counts={counts} />

        {visibleTasks.length === 0 ? (
          <div className="empty">
            {filter === "completed"
              ? "No completed tasks yet."
              : filter === "active"
              ? "No active tasks — add one above!"
              : "Your list is empty. Add your first task!"}
          </div>
        ) : (
          <ul className="list">
            {visibleTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}

        {tasks.length > 0 && (
          <footer className="footer">
            <span>{counts.all} total · {counts.completed} completed</span>
            {counts.completed > 0 && (
              <button onClick={clearCompleted} className="clear-btn">Clear done</button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}