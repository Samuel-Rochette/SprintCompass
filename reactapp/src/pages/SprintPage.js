import { useReducer, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
	Card,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Modal,
	Box,
	TextField,
	Autocomplete,
	Select,
	MenuItem,
} from "@mui/material";
import styles from "../styles.js";
import { graphqlPost } from "../util";

const SprintPage = () => {
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const { sprintId } = useParams();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		stories: [],
		users: [],
		sprint: {},
		name: "",
		description: "",
		status: "",
		cost: "",
		userId: "",
		openAdd: false,
		openEdit: false,
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
						query($sprintid: String) { 
							getstoriesforsprint(sprintid: $sprintid) {
								_id
								sprintid
								userid
								name
								description
								status
								cost
								user { username }
								tasks { hourslogged, hoursestimated }
							}
						}
			 		`,
					variables: { sprintid: sprintId },
				}
			);
			setState({ stories: data.getstoriesforsprint });
		})();

		(async () => {
			const result = await graphqlPost("http://localhost:5000/graphql", token, {
				query: `
						query($sprintid: String) { 
							getsprintbyid(sprintid: $sprintid) { 
								_id
								name
								status
								projectid 
							}
						}
			 		`,
				variables: { sprintid: sprintId },
			});

			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						query($projectid: String) {
							getusersforproject(projectid: $projectid) {
								userid
								username
							}
						}
					`,
					variables: { projectid: result.data.getsprintbyid.projectid },
				}
			);

			setState({
				sprint: result.data.getsprintbyid,
				users: data.getusersforproject,
			});
		})();
		pageLoaded.current = true;
	}, []);

	const selectStory = id => {
		navigate(`/story/${id}`);
	};

	const addStory = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
			mutation ($userid: String, $sprintid: String, $name: String, $description: String, $cost: Int) { createstory (userid: $userid, sprintid: $sprintid, name: $name, description: $description, cost: $cost) { _id, sprintid, userid, name, description, status, cost, user { username }, tasks { hourslogged, hoursestimated } } }
			`,
			variables: {
				sprintid: sprintId,
				userid: state.userId,
				name: state.name,
				description: state.description,
				cost: parseInt(state.cost),
			},
		});
		if (data.createstory === null) return;
		const stories = state.stories.concat([data.createstory]);
		setState({
			stories,
			openAdd: false,
			name: "",
			description: "",
			cost: "",
		});
	};

	const editSprint = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($sprintid: String, $name: String, $status: String) {
					editsprint(sprintid: $sprintid, name: $name, status: $status) {
						_id
						name
						status
					}
				}
			`,
			variables: {
				sprintid: sprintId,
				name: state.name,
				status: state.status,
			},
		});
		if (data.editsprint === null) return;
		setState({
			story: data.editsprint,
			openEdit: false,
			name: "",
			status: "",
		});
	};

	const deleteSprint = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($sprintid: String) {
					deletesprint(sprintid: $sprintid)
				}
			`,
			variables: {
				sprintid: sprintId,
			},
		});
		if (!data.deletesprint) return;
		navigate("/");
	};

	return (
		<div>
			<Card style={{ display: "flex" }}>
				<h1 style={{ marginLeft: "2%" }}>Stories for {state.sprint.name}</h1>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "45%",
						height: "5%",
						width: "5%",
					}}
					onClick={() => navigate(`/sprintreport/${state.sprint._id}`)}
				>
					Report
				</Button>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "1%",
						height: "5%",
						width: "8%",
					}}
					onClick={() => setState({ openAdd: true })}
				>
					Add Story
				</Button>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "1%",
						height: "5%",
						width: "8%",
					}}
					onClick={() =>
						setState({
							openEdit: true,
							name: state.sprint.name,
							status: state.sprint.status,
						})
					}
				>
					Edit Sprint
				</Button>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "1%",
						height: "5%",
						width: "8%",
					}}
					onClick={() => navigate("/")}
				>
					Return Home
				</Button>
			</Card>
			{state.stories.length > 0 && (
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Description</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Assigned To</TableCell>
								<TableCell>Cost/hr</TableCell>
								<TableCell>Hours Logged</TableCell>
								<TableCell>Hours Estimated</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.stories.map(story => {
								return (
									<TableRow
										style={styles.tableRow}
										key={story._id}
										onClick={() => selectStory(story._id)}
									>
										<TableCell>{story.name}</TableCell>
										<TableCell>{story.description}</TableCell>
										<TableCell>{story.status}</TableCell>
										<TableCell>{story.user[0].username}</TableCell>
										<TableCell>{story.cost}</TableCell>
										<TableCell>
											{story.tasks.length > 0
												? story.tasks
														.map(i => i.hourslogged)
														.reduce((a, b) => a + b)
												: 0}
										</TableCell>
										<TableCell>
											{story.tasks.length > 0
												? story.tasks
														.map(i => i.hoursestimated)
														.reduce((a, b) => a + b)
												: 0}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
			<Modal
				open={state.openAdd}
				onClose={() =>
					setState({
						openAdd: false,
						name: "",
						description: "",
						cost: "",
					})
				}
			>
				<Box style={styles.modal}>
					<Typography id="modal-modal-title" variant="h5" component="h2">
						Create Story
					</Typography>
					<TextField
						style={styles.formElement}
						onChange={e => setState({ name: e.target.value })}
						label="Name"
						variant="outlined"
					/>
					<TextField
						style={styles.formElement}
						value={state.description}
						onChange={e => setState({ description: e.target.value })}
						label="Description"
						variant="outlined"
					/>
					<Autocomplete
						style={styles.formElement}
						options={state.users}
						getOptionLabel={option => option.username}
						onChange={(e, value) => setState({ userId: value.userid })}
						renderInput={params => (
							<TextField {...params} label="User" variant="outlined" />
						)}
					/>
					<TextField
						style={styles.formElement}
						value={state.cost}
						onChange={e => setState({ cost: e.target.value })}
						label="Cost/hr"
						variant="outlined"
					/>
					<Box>
						<Button
							onClick={() =>
								setState({
									openAdd: false,
									name: "",
									description: "",
									cost: "",
								})
							}
						>
							Cancel
						</Button>
						<Button onClick={addStory}>Add</Button>
					</Box>
				</Box>
			</Modal>
			<Modal
				open={state.openEdit}
				onClose={() =>
					setState({
						openEdit: false,
						name: "",
						status: "",
					})
				}
			>
				<Box style={styles.modal}>
					<Typography id="modal-modal-title" variant="h5" component="h2">
						Edit {state.sprint.name}
					</Typography>
					<TextField
						style={styles.formElement}
						value={state.name}
						onChange={e => setState({ name: e.target.value })}
						label="Name"
						variant="outlined"
					/>
					<Select
						style={styles.formElement}
						value={state.status}
						label="Status"
						onChange={e => setState({ status: e.target.value })}
						sx={{ width: 200 }}
					>
						<MenuItem value="Planned">Planned</MenuItem>
						<MenuItem value="Ongoing">Ongoing</MenuItem>
						<MenuItem value="Finished">Finished</MenuItem>
					</Select>
					<Box>
						<Button
							onClick={() =>
								setState({
									openEdit: false,
									name: "",
									status: "",
								})
							}
						>
							Cancel
						</Button>
						<Button onClick={deleteSprint}>Delete</Button>
						<Button onClick={editSprint}>Update</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
};

export default SprintPage;
