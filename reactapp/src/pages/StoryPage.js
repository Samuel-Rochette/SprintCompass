import { useEffect, useReducer, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { graphqlPost } from "../util";
import jwtDecode from "jwt-decode";
import {
	Button,
	Card,
	Table,
	TableCell,
	TableContainer,
	TableBody,
	TableRow,
	TableHead,
	Paper,
} from "@mui/material";
import styles from "../styles.js";

const StoryPage = () => {
	const {storyId} = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		tasks: [],
		snackbarMsg: "",
		loginStatus: false,
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
						query($storyid: String) {
							gettasksforstory(storyid: $storyid) {
								_id
								name
								status
								storyid
							}
						}
					`,
					variables: { story: storyId },
				}
			);
			setState({tasks: data.gettasksforstory });
		})();
	}, []);

	return (
		<Card>
			<Card style={{display: 'flex'}}>
				<h1 style={{marginLeft: "2%"}}>Stories for Sprint {storyId}</h1>
				<Button variant="contained" style={{marginTop: "1%", marginLeft: "45%", height: "5%", width: "5%"}}>
					New Story
				</Button>
				<Button 
					variant="contained" 
					style={{marginTop: "1%", marginLeft: "1%", height: "5%", width: "8%"}}
				>
					Edit Story
				</Button>
				<Button 
					variant="contained"
					style={{marginTop: "1%", marginLeft: "1%", height: "5%", width: "8%"}}
				>
					Return to Sprint
				</Button>
			</Card>
			{state.stories.length > 0 && (
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Story ID</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.tasks.map(task => {
								return (
									<TableRow
										style={styles.tableRow}
										key={task._id}
									>
										<TableCell>{task.name}</TableCell>
										<TableCell>{task.status}</TableCell>
										<TableCell>{task.storyid}</TableCell>
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

export default StoryPage;