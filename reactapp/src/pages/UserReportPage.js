import { useEffect, useReducer, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util/index.js";
import { Button, Card, Typography } from "@mui/material";
import jwtDecode from "jwt-decode";

const UserReportPage = () => {
	const { userprojectId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		report: {},
		sprints: [],
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
					query ($userprojectid: String) { userreport (userprojectid: $userprojectid) { projectid, username, projectname, sprints { name, status, stories { name, description, status, cost, tasks { name, status, hourslogged, hoursestimated } } } } }
          `,
					variables: { userprojectid: userprojectId },
				}
			);
			const auth = (
				await graphqlPost("http://localhost:5000/graphql", token, {
					query: `
						query ($reqid: String, $projectid: String) { getauth (reqid: $reqid, projectid: $projectid) }		      
					`,
					variables: { reqid: userId, projectid: data.userreport.projectid },
				})
			).data.getauth;
			setState({
				report: data.userreport,
				sprints: data.userreport.sprints,
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
				<h1 style={{ marginLeft: "2%" }}>
					{state.report.projectname} Report for {state.report.username}
				</h1>
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
					{state.sprints.length > 0 && (
						<div style={{ marginLeft: "5%" }}>
							{state.sprints.map((sprint, sidx) => {
								return (
									<div key={sidx}>
										<Typography
											style={{
												textDecorationLine: "underline",
												fontWeight: "bold",
												fontSize: 20,
											}}
										>
											{sprint.name}
										</Typography>
										<Typography>
											<b>Status:</b> {sprint.status}
										</Typography>
										{sprint.stories.map((story, sidx) => {
											return (
												<div key={sidx} style={{ marginLeft: "5%" }}>
													<br />
													<Typography style={{ fontWeight: "bold" }}>
														{story.name}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Description: {story.description}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Status: {story.status}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Hours Logged:{" "}
														{story.tasks.length > 0
															? story.tasks
																	.map(i => i.hourslogged)
																	.reduce((a, b) => a + b)
															: "0"}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Hours Estimated:{" "}
														{story.tasks.length > 0
															? story.tasks
																	.map(i => i.hoursestimated)
																	.reduce((a, b) => a + b)
															: "0"}
													</Typography>
													<Typography style={{ marginLeft: "5%" }}>
														Estimated Cost:{" "}
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
						Not Authorized for User Report
					</Typography>
				</div>
			)}
		</div>
	);
};

export default UserReportPage;
