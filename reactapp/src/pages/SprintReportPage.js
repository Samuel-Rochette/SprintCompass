import { useEffect, useReducer, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util/index.js";
import jwtDecode from "jwt-decode";
import { Button, Card, Typography } from "@mui/material";

const SprintReportPage = () => {
	const { sprintId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		report: {},
		stories: [],
		auth: false,
	});

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const { userId } = jwtDecode(token);
		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						query ($sprintid: String) { sprintreport (sprintid: $sprintid) { projectid, name, status, stories { name, description, status, cost, user { username }, tasks { name, status, hourslogged, hoursestimated } } } }
		      `,
					variables: { sprintid: sprintId },
				}
			);
			const auth = (
				await graphqlPost("http://localhost:5000/graphql", token, {
					query: `
						query ($reqid: String, $projectid: String) { getauth (reqid: $reqid, projectid: $projectid) }		      
					`,
					variables: { reqid: userId, projectid: data.sprintreport.projectid },
				})
			).data.getauth;
			setState({
				report: data.sprintreport,
				stories: data.sprintreport.stories,
				auth,
			});
		})();
		pageLoaded.current = true;
	}, []);

	const returnHome = () => {
		navigate("/");
	};

	return (
		<div>
			<Card style={{ display: "flex" }}>
				<h1 style={{ marginLeft: "2%" }}>{state.report.name} Report</h1>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "80%",
						height: "5%",
						width: "8%",
					}}
					onClick={returnHome}
				>
					Return Home
				</Button>
			</Card>

			{state.auth ? (
				<Card>
					{state.stories.length > 0 && (
						<div style={{ marginLeft: "5%" }}>
							{state.stories.map((story, sidx) => {
								return (
									<div key={sidx}>
										<Typography
											style={{
												textDecorationLine: "underline",
												fontWeight: "bold",
												fontSize: 20,
											}}
										>
											{story.name}
										</Typography>
										<Typography style={{ marginLeft: "2%" }}>
											<b>Status:</b> {story.status}
										</Typography>
										<Typography style={{ marginLeft: "2%" }}>
											<b>Description:</b> {story.description}
										</Typography>

										<Typography style={{ marginLeft: "2%" }}>
											<b>Hours Logged:</b>{" "}
											{story.tasks.length > 0
												? story.tasks
														.map(i => i.hourslogged)
														.reduce((a, b) => a + b)
												: "0"}
										</Typography>
										<Typography style={{ marginLeft: "2%" }}>
											<b>Hours Estimated:</b>{" "}
											{story.tasks.length > 0
												? story.tasks
														.map(i => i.hoursestimated)
														.reduce((a, b) => a + b)
												: "0"}
										</Typography>
										<Typography style={{ marginLeft: "2%" }}>
											<b>Cost/hr:</b> {story.cost}
										</Typography>
										<Typography style={{ marginLeft: "2%" }}>
											<b>Total Estimated Cost:</b>{" "}
											{story.tasks.length > 0
												? story.tasks
														.map(i => i)
														.reduce(
															(a, b) =>
																a.hourslogged +
																a.hoursestimated +
																b.hourslogged +
																b.hoursestimated
														) * story.cost
												: "0"}
										</Typography>
										{story.tasks.map((task, tidx) => {
											return (
												<div key={tidx} style={{ marginLeft: "10%" }}>
													<br />
													<Typography style={{ fontWeight: "bold" }}>
														{task.name}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Status: {task.status}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Hours Logged: {task.hourslogged}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Hours Estimated: {task.hoursestimated}
													</Typography>
												</div>
											);
										})}
										<br />
									</div>
								);
							})}
						</div>
					)}
				</Card>
			) : (
				<div>
					<Typography
						style={{
							textDecorationLine: "underline",
							fontWeight: "bold",
							fontSize: 20,
						}}
					>
						Not Authorized for Sprint Report
					</Typography>
				</div>
			)}
		</div>
	);
};

export default SprintReportPage;
