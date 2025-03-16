import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import PostDetail from "./PostDetail";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts/:id" element={<PostDetail />} />
    </Routes>
  );
};

export default App;
