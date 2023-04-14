import { useEffect, useReducer, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util/index.js";
import styles from "../styles.js";
import {
	Autocomplete,
	Box,
	Button,
	Card,
	Modal,
	Paper,
	Table,
	TableCell,
	TableContainer,
	TableBody,
	TableRow,
	TableHead,
	TextField,
	Typography,
} from "@mui/material";

const UserReportPage = () => {
	const { userprojectId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		report: {},
		sprints: [],
		index: 0,
		storyKey: 1000,
	});

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
            query($userprojectid: String) {
              userreport(userprojectid: $userprojectid) {
                username
                projectname
                sprints { 
                  name
                  status
                  stories { 
                    name
                    description
                    status
                    hourslogged
                    hoursestimated
                    tasks {
                      name
                      status 
                    }
                  }
                } 
              } 
            }
          `,
					variables: { userprojectid: userprojectId },
				}
			);
			setState({ report: data.userreport, sprints: data.userreport.sprints });
			console.log(data.userreport);
		})();

		pageLoaded.current = true;
	}, []);

	const returnHome = () => {
		navigate("/")
	}

	return (
	<div>
		<Card style={{display: 'flex'}}>
			<h1 style={{marginLeft: "2%"}}>{state.report.projectname} Report</h1>
			<Button 
				variant="contained"
				style={{marginTop: "1%", marginLeft: "80%", height: "5%", width: "8%"}}
				onClick={returnHome}
			>
				Return Home
			</Button>
		</Card>
			<Card>
				{state.sprints.length > 0 && (
					<div style={{marginLeft: "5%"}}>
						{state.sprints.map(sprint => {
							return (
								<div key={state.index++}>
									<Typography style={{textDecorationLine: "underline", fontWeight: "bold", fontSize: 20}}>
									{sprint.name}
									</Typography>
									<Typography>
										<b>Status:</b> {sprint.status}
									</Typography>
									{sprint.stories.map(story => {
										return (
											<div key={state.storyKey++} style={{marginLeft: "5%"}}>
												<br/>
												<Typography style={{fontWeight: "bold"}}>
													{story.name}
												</Typography>
												<Typography style={{marginLeft: "5%"}}>
													Description: {story.description}
												</Typography>
												<Typography style={{marginLeft: "5%"}}>
													Status: {story.status}
												</Typography>
											</div>
										)
									})}
									<br/>
								</div>
							)
						})}
					</div>
				)}
			</Card>
	</div>
	)
};

export default UserReportPage;
