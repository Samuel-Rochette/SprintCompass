import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";

const ProjectPage = () => {
	const { projectId } = useParams();

	useEffect(() => {
		//TEMP DEBUG MESSAGE
		console.log(projectId);
		//TODO: GET ALL STORIES FOR PROJECT ID
	}, []);

	return <h1>ProjectPage</h1>;
};

export default ProjectPage;
