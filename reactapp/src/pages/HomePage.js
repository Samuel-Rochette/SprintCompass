import { useReducer, useEffect, useRef, Image } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
	Grid,
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
	Snackbar,
} from "@mui/material";
import styles from "../styles.js";
import { graphqlPost } from "../util";

const HomePage = () => {
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		projects: [],
		snackbarMsg: "",
		name: "",
		description: "",
		loginStatus: false,
		openAdd: false,
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
						query($userid: String) {
							getprojectsforuser(userid: $userid) {
								_id
								name
								description
							}
						}
					`,
					variables: { userid: userId },
				}
			);
			console.log(data);
			setState({ projects: data.getprojectsforuser, loginStatus: true });
		})();
		pageLoaded.current = true;
	}, []);

	const selectProject = id => {
		navigate(`/project/${id}`);
	};

	const createProject = () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const { userId } = jwtDecode(token);
		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						mutation($userid: String, $name: String, $description: String) {
							createproject(userid: $userid, name: $name, description: $description) {
								_id
								name
								description
							}
						}
					`,
					variables: {
						userid: userId,
						name: state.name,
						description: state.description,
					},
				}
			);
			if (data.createproject === null) return;
			const projects = state.projects.concat([data.createproject]);
			setState({ projects, openAdd: false, name: "", description: "" });
		})();
	};

	return (
		<div>
			{state.loginStatus && (
				<Grid style={styles.headerContainer} container spacing={2}>
					<Grid item xs={10}>
						<Typography variant="h4" component="h2">
							My Projects
						</Typography>
					</Grid>
					<Grid item xs={2}>
						<Button
							variant="contained"
							onClick={() => setState({ openAdd: true })}
						>
							Create Project
						</Button>
					</Grid>
				</Grid>
			)}
			{state.loginStatus && state.projects.length !== 0 ? (
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Description</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.projects.map(project => {
								return (
									<TableRow
										style={styles.tableRow}
										key={project._id}
										onClick={() => selectProject(project._id)}
									>
										<TableCell>{project.name}</TableCell>
										<TableCell>{project.description}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<div style={styles.container}>
					<h2>Welcome to Sprint Compass!</h2>
					<img
						style={styles.image}
						src="./sprint-compass-logo.png"
						alt="logo"
					/>
				</div>
			)}
			<Modal
				open={state.openAdd}
				onClose={() => setState({ openAdd: false, name: "", description: "" })}
			>
				<Box style={styles.modal}>
					<Typography id="modal-modal-title" variant="h5" component="h2">
						New Story Item
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
							onClick={() =>
								setState({ openAdd: false, name: "", description: "" })
							}
						>
							Cancel
						</Button>
						<Button style={styles.formElement} onClick={createProject}>
							Create Project
						</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
};

export default HomePage;
