import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import TasksPage from "./TaskPage";
import CatPage from "./CatPage";

const App = () => {
  return (
    <Router>
      <div style={styles.appContainer}>
        <div style={styles.sidebar}>
          <h2 style={styles.title}>Menu</h2>
          <nav>
            <ul style={styles.navList}>
              <li><Link to="/" style={styles.navItem}>📝 Tasks</Link></li>
              <li><Link to="/cat" style={styles.navItem}>🐱 Cat</Link></li>
            </ul>
          </nav>
        </div>

        <div style={styles.mainContent}>
          <Switch>
            <Route exact path="/" component={TasksPage} />
            <Route path="/cat" component={CatPage} />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

const styles = {
  appContainer: { display: "flex", height: "100vh" },
  sidebar: { 
    width: "200px", 
    background: "#fff", 
    color: "#222", 
    padding: "20px", 
    height: "100%",  
    borderRight: "2px solid #ddd" 
  },
  title: { fontSize: "20px", marginBottom: "20px" },
  navList: { listStyle: "none", padding: 0 },
  navItem: { display: "block", padding: "10px", color: "#222", textDecoration: "none" },
  mainContent: { flex: 1, padding: "20px" }
};

export default App;
