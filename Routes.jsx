import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "pages/Home";
import NotFound from "pages/NotFound";
const RightmoveTwentyTwo = React.lazy(() => import("pages/RightmoveTwentyTwo"));
const RightmoveEleven = React.lazy(() => import("pages/RightmoveEleven"));
const Fiction = React.lazy(() => import("pages/Fiction"));
const Genre = React.lazy(() => import("pages/Genre"));
const Homepage = React.lazy(() => import("pages/Homepage"));
const Land = React.lazy(() => import("pages/Land"));
const Thrift = React.lazy(() => import("pages/Thrift"));
const ProjectRoutes = () => {
  return (
    <React.Suspense fallback={<>Loading...</>}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/thrift" element={<Thrift />} />
          <Route path="/land" element={<Land />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/genre" element={<Genre />} />
          <Route path="/fiction" element={<Fiction />} />
          <Route path="/rightmoveeleven" element={<RightmoveEleven />} />
          <Route path="/rightmovetwentytwo" element={<RightmoveTwentyTwo />} />
        </Routes>
      </Router>
    </React.Suspense>
  );
};
export default ProjectRoutes;
