import React from "react";

const CatPage = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Cat</h2>
      <p>Welcome to the your Cat emporium!</p>
    </div>
  );
};

const styles = {
    container: { padding: 20, maxWidth: 400, margin: "auto", textAlign: "center" },
    title: { fontSize: "24px", marginBottom: "10px" },
  };

export default CatPage;
