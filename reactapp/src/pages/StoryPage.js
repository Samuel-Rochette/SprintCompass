
import { useReducer, useEffect, useRef, useState, View } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const StoryPage = () => {
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const {sprintId} = useParams();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		stories: [],
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
					mutation: `
					mutation ($userid: String, $sprintid: String, $name: String, $description: String) 
					{ createstory (userid: $userid, 
						sprintid: $sprintid, 
						name: $name, 
						description: $description) { 
							_id, 
							sprintid, 
							userid, 
							name, 
							description, 
							status, 
							hourslogged 
						} 
					}
					`,
					variables: { sprintid: sprintId },
				}
			);
			console.log(data);
			setState({ stories: data.getstoriesforsprint, loginStatus: true });
		})();
		pageLoaded.current = true;
	}, []);

	return <h1>StoryPage</h1>;
};

export default StoryPage;
