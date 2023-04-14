import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import {
	HomePage,
	ProjectPage,
	SprintPage,
	StoryPage,
	UserPage,
	SprintReportPage,
	UserReportPage,
} from "./pages";

const App = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="project">
					<Route path=":projectId" element={<ProjectPage />} />
				</Route>
				<Route path="sprint">
					<Route path=":sprintId" element={<SprintPage />} />
				</Route>
				<Route path="story">
					<Route path=":storyId" element={<StoryPage />} />
				</Route>
				<Route path="users">
					<Route path=":projectId" element={<UserPage />} />
				</Route>
				<Route path="sprintreport">
					<Route path=":sprintId" element={<SprintReportPage />} />
				</Route>
				<Route path="userreport">
					<Route path=":userprojectId" element={<UserReportPage />} />
				</Route>
			</Routes>
		</Router>
	);
};

function About() {
	return <h2>About</h2>;
}

function Users() {
	return <h2>Users</h2>;
}

export default App;
