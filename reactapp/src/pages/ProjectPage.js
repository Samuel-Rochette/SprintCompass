import { useEffect, useReducer, View } from "react";
import { useParams } from "react-router-dom";
import SprintPage from "./SprintPage"

const ProjectPage = () => {
	const { projectId } = useParams();

	useEffect(() => {
		//TEMP DEBUG MESSAGE
		console.log(projectId);
		//TODO: GET ALL STORIES FOR PROJECT ID
	}, []);

	return <div>
			<h1>Project Page</h1>
			<SprintPage></SprintPage>
		</div>
};

export default ProjectPage;
