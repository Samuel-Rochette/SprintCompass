import { useReducer, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
	Autocomplete,
	TextField,
} from "@mui/material";
import styles from "../styles.js";
import { graphqlPost } from "../util";

const UserPage = () => {
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		openAdd: false,
		openEdit: false,
		users: [],
		nonUsers: ["user1", "user2", "user3"],
		selectedUser: 0,
		project: "",
		username: "",
	});

	useEffect(() => {
		const token = localStorage.getItem("token");
		!token && navigate("/");
		if (pageLoaded.current) return;
		(async () => {
			const { data } = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
						query($projectid: String) {
							getusersforproject(projectid: $projectid) {
								_id
								username 
							}
						}
					`,
					variables: { projectid: projectId },
				}
			);
			setState({ users: data.getusersforproject, project: projectId });
		})();
		pageLoaded.current = true;
	});

	const selectUser = idx => {};

	return (
		<div>
			<Grid style={styles.headerContainer} container spacing={2}>
				<Grid item xs={10}>
					<Typography variant="h4" component="h2">
						Users for Project {state.project}
					</Typography>
				</Grid>
				<Grid item xs={2}>
					<Button onClick={() => setState({ openAdd: true })}>Add User</Button>
				</Grid>
			</Grid>
			{state.users.length !== 0 && (
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.users.map((user, idx) => {
								return (
									<TableRow
										style={styles.tableRow}
										key={user._id}
										onClick={() => selectUser(idx)}
									>
										<TableCell>{user.username}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
			<Modal
				open={state.openAdd}
				onClose={() => setState({ openAdd: false, username: "" })}
			>
				<Box style={styles.modal}>
					<Typography style={styles.formElement} variant="h6" component="h2">
						Add User
					</Typography>
					<Autocomplete
						options={state.nonUsers}
						getOptionLabel={option => option}
						value={state.username}
						onChange={() => e => setState({ username: e.target.value })}
						renderInput={params => (
							<TextField {...params} label="Username" variant="outlined" />
						)}
					/>
					<Box>
						<Button
							style={styles.formElement}
							onClick={() => setState({ openAdd: false, username: "" })}
						>
							Cancel
						</Button>
						<Button style={styles.formElement}>Add</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
};

export default UserPage;
