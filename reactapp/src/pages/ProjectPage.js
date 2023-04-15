import { useEffect, useReducer, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util";
import jwtDecode from "jwt-decode";
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
import styles from "../styles.js";

const ProjectPage = () => {
	const { projectId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		sprints: [],
		project: {},
		openAdd: false,
		openEdit: false,
		name: "",
		description: "",
	});
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		//const { userId } = jwtDecode(token);
		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						query($projectid: String) {
							getsprintsforproject(projectid: $projectid) {
								_id
								name
								status
  								projectid
							}
						}
					`,
					variables: { projectid: projectId },
				}
			);
			setState({sprints: data.getsprintsforproject});
		})();

		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						query($projectid: String) {
							getprojectbyid(projectid: $projectid) {
								name
								description
							}
						}
					`,
					variables: { projectid: projectId },
				}
			);
			setState({ project: data.getprojectbyid });
		})();
	}, []);

	const selectSprint = (id) => {
		navigate(`/sprint/${id}`);
	};

	const returnHome = () => {
		navigate("/")
	}

	
	const addUser = () => {
		navigate(`/users/${projectId}`)
	}

	const addSprint = async () => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($projectid: String, $name: String) {
					createsprint(projectid: $projectid, name: $name ) {
						_id
						name
						status
						projectid
					} 
				}
			`,
			variables: {
				projectid: projectId,
				name: state.sprintName,
			},
		});
		if(data.createsprint === undefined || data.createsprint === null) return;
		const sprints = state.sprints.concat([
			{
				_id: data.createsprint._id,
				name: data.createsprint.name,
				status: data.createsprint.status,
				projectid: projectId,
			}
		])
		setState({ sprints, openAdd: false });
	}

	const editSprint = async (sprints) => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const sprint = sprints.find(sprint => sprint.name === state.sprintName);
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($sprintid: String, $name: String, $status: String) {
					editsprint(sprintid: $sprintid, name: $name, status: $status ) {
						_id
						name
						status
						projectid
					} 
				}
			`,
			variables: {
				sprintid: sprint._id,
				name: state.sprintName,
				status: state.sprintStatus,
			},
		});
		const array = state.sprints.map((s) => {if (s.name === state.sprintName) {return data.editsprint;} else {return s;}});
		setState({ openEdit: false, sprints: array});
	}

	const deleteSprint = async (sprints) => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const sprint = sprints.find(sprint => sprint.name === state.sprintName);
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($sprintid: String) {
					deletesprint(sprintid: $sprintid)
				}
			`,
			variables: {
				sprintid: sprint._id,
			},
		});
		if(!data.deletesprint) return;
		setState({ 
			openEdit: false,
			sprints: state.sprints.filter((e) => e !== sprint ),
		});
	}

	const addSprint = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($projectid: String, $name: String) {
					createsprint(projectid: $projectid, name: $name ) {
						_id
						name
						status
						projectid
					} 
				}
			`,
			variables: {
				projectid: projectId,
				name: state.sprintName,
			},
		});
		if (data.createsprint === undefined || data.createsprint === null) return;
		const sprints = state.sprints.concat([data.createsprint]);
		setState({ sprints, openAdd: false });
	};

	const editProject = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation($projectid: String, $name: String, $description: String) {
					editproject(projectid: $projectid, name: $name, description: $description) {
						_id
						name
						description
					}
				}
			`,
			variables: {
				projectid: projectId,
				name: state.name,
				description: state.description,
			},
		});
		if (data.editproject === undefined || data.editproject === null) return;
		setState({ project: data.editproject, openEdit: false });
	};

	const deleteProject = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
				mutation ($projectid: String) { deleteproject (projectid: $projectid) }
			`,
			variables: {
				projectid: projectId,
			},
		});
		if (!data.deleteproject) return;
		navigate("/");
	};

	return (
		<Card>
			<Card style={{ display: "flex" }}>
				<h1 style={{ marginLeft: "2%" }}>Sprints for {state.project.name}</h1>
				<Button
					variant="contained"
					style={{
						marginTop: "1%",
						marginLeft: "45%",
						height: "5%",
						width: "6%",
					}}
					onClick={() => setState({ openAdd: true })}
				>
					New Sprint
				</Button>
				<Button 
					variant="contained" 
					style={{marginTop: "1%", marginLeft: "1%", height: "5%", width: "8%"}}
					onClick={() => setState({openEdit: true})}
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
					onClick={() => setState({ ...state.project, openEdit: true })}
				>
					Add User
				</Button>
				<Button 
					variant="contained"
					style={{marginTop: "1%", marginLeft: "1%", height: "5%", width: "8%"}}
					onClick={returnHome}
				>
					Return Home
				</Button>
			</Card>
			<Modal open={state.openAdd} onClose={() => setState({ openAdd: false })}>
				<Box style={styles.modal}>
					<Typography style={styles.formElement} variant="h6" component="h2">
						Add Sprint
					</Typography>
					<TextField
						onChange={e => setState({ sprintName: e.target.value })}
						label="Sprint Name"
					/>
					<Box>
						<Button
							style={styles.formElement}
							onClick={() => setState({ openAdd: false })}
						>
							Cancel
						</Button>
						<Button style={styles.formElement} onClick={() => addSprint()}>
							Add
						</Button>
					</Box>
				</Box>
			</Modal>
			<Modal
				open={state.openEdit}
				onClose={() => setState({ openEdit: false })}
			>
				<Box style={styles.modal}>
					<Typography style={styles.formElement} variant="h6" component="h2">
						Edit {state.project.name}
					</Typography>
					<TextField
						style={styles.formElement}
						value={state.name}
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
					<Box>
						<Button
							style={styles.formElement}
							onClick={() => setState({ openEdit: false })}
						>
							Cancel
						</Button>
						<Button style={styles.formElement} onClick={deleteProject}>
							Delete
						</Button>
						<Button style={styles.formElement} onClick={editProject}>
							Update
						</Button>
					</Box>
				</Box>
			</Modal>
			{state.sprints.length > 0 && (
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Status</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.sprints.map(sprint => {
								return (
									<TableRow
										style={styles.tableRow}
										key={sprint._id}
										onClick={() => selectSprint(sprint._id)}
									>
										<TableCell>{sprint.name}</TableCell>
										<TableCell>{sprint.status}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Card>
	); 
};

export default ProjectPage;
