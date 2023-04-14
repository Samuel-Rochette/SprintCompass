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

const SprintReportPage = () => {
	const { sprintId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		report: {},
		stories: [],
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
            query ($sprintid: String) {
              sprintreport(sprintid: $sprintid) {
                name
                status
                stories { 
                  name
                  description
                  status
                  hourslogged
                  hoursestimated
                  user { 
                    username 
                  }
                  tasks {
                    name
                    status 
                  } 
                } 
              } 
            }
		      `,
					variables: { sprintid: sprintId },
				}
			);
			setState({ report: data.sprintreport, stories: data.sprintreport.stories });
			console.log(data.sprintreport);
		})();

		pageLoaded.current = true;
	}, []);

	const returnHome = () => {
		navigate("/")
	}

	return (
		<div>
			<Card style={{display: 'flex'}}>
				<h1 style={{marginLeft: "2%"}}>{state.report.name} Report</h1>
				<Button 
					variant="contained"
					style={{marginTop: "1%", marginLeft: "80%", height: "5%", width: "8%"}}
					onClick={returnHome}
				>
					Return Home
				</Button>
			</Card>
				<Card>
					{state.stories.length > 0 && (
						<div style={{marginLeft: "5%"}}>
							{state.stories.map(story => {
								return (
									<div key={state.index++}>
										<Typography style={{textDecorationLine: "underline", fontWeight: "bold", fontSize: 20}}>
										{story.name}
										</Typography>
										<Typography style={{marginLeft: "2%"}}>
											<b>Status:</b> {story.status}
										</Typography>
										<Typography style={{marginLeft: "2%"}}>
											<b>Description:</b> {story.description}
										</Typography>
										<Typography style={{marginLeft: "2%"}}>
											<b>Hours Estimated:</b> {story.hoursestimated}
										</Typography>
										<Typography style={{marginLeft: "2%"}}>
											<b>Hours Logged:</b> {story.hourslogged}
										</Typography>
										{story.tasks.map(task => {
											return (
												<div key={state.storyKey++} style={{marginLeft: "10%"}}>
													<br/>
													<Typography style={{fontWeight: "bold"}}>
														{task.name}
													</Typography>
													<Typography style={{marginLeft: "5%"}}>
														Status: {task.status}
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

export default SprintReportPage;
