
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

const SprintPage = () => {
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const {sprintId} = useParams();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		stories: [],
		snackbarMsg: "",
		loginStatus: false,
		storyName: "",
		storyDescription: "",
		storyStatus: "",
		storyHours: ""
	});
	const [openModal		, setOpenModal			] = useState();
	const [modalName		, setModalName			] = useState();
	const [modalDescription	, setModalDescription	] = useState();
	const [modalStatus		, setModalStatus		] = useState();
	const [modalHours		, setModalHours			] = useState();
	

	const selectSprint = id => {
		navigate(`/sprint/${id}`);
	};

	// --------------------------------- MODAL OPEN AND ADD STORY -----------------------------------------
	const handleAddStory = () =>{
		console.log("clicked add story");
		setOpenModal(true);
		
	}

	// --------------------------------- MODAL CLOSE AND CREATE STORY -----------------------------------------
	const handleModalClose = async ()=>{
		setOpenModal(false);
		//console.log(state.storyName + "  " + state.storyDescription);

		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const { data } = await graphqlPost("http://localhost:5000/graphql", token, {
			query: `
			mutation ($userid: String, $sprintid: String, $name: String, $description: String, $hoursestimated: Int) { 
				createstory (
					userid: $userid, 
					sprintid: $sprintid, 
					name: $name, 
					description: $description, 
					hoursestimated: $hoursestimated) { 
						_id, 
						sprintid, 
						userid, 
						name, 
						description, 
						status, 
						hourslogged, 
						hoursestimated, 
						user { 
							username 
						} 
					} 
				}
			`,
			variables: {
				sprintid: sprintId,
				storyname: state.storyName,
				description: state.storyDescription,
				status: state.storyStatus,
				hours: state.storyHours
			},
		});
		if(data.createstory === undefined || data.createstory === null) return;
		const stories = state.stories.concat([
			{
				_id: data.createstory._id,
				storyname: data.createstory.name,
				status: data.createstory.status,
				sprintid: sprintId,
			}
		])
		setState({ stories, openAdd: false });
	}//end of add story

	// --------------------------------- USE EFFECT -----------------------------------------
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token || pageLoaded.current) return;
		const { userId } = jwtDecode(token);
		(async () => {
			const result = await graphqlPost(
				"http://localhost:5000/graphql",
				token,
				{
					query: `
					query ($sprintid: String) { 
						getstoriesforsprint (sprintid: $sprintid) { 
							_id, 
							sprintid, 
							userid, 
							name, 
							description, 
							status, 
							hourslogged, 
							user { 
								username 
							} 
						} 
					}
			 		`,
			 		variables: { sprintid: sprintId },
				}
			);
			console.log(result);
			// console.log(data);
			// setState({ stories: data.getstoriesforsprint, loginStatus: true });
		})();
		pageLoaded.current = true;
	}, []);//end of useEffect



	// --------------------------------- RETURN START -----------------------------------------
	return <div>
	<Box>
		<h3>Sprint Info</h3>
		<Button onClick={handleAddStory}>Add Story</Button>
		<Modal
			open={openModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
			>
			<Box style={styles.modal}>
				<Typography id="modal-modal-title" variant="h5" component="h2">
				New Story Item
				</Typography>
				<TextField  style={styles.modalTextField1} onChange={(e) => setState({ storyName 		: e.target.value		})} helperText="required field" id="filled-basic" label="Story Name" variant="filled" />
				<TextField  style={styles.modalTextField2} onChange={(e) => setState({ storyDescription : e.target.value})} helperText="required field" multiline id="filled-basic" label="Story Description" variant="filled" />
				<TextField  style={styles.modalTextField1} onChange={(e) => setState({ storyStatus 		: e.target.value		})} helperText="required field" id="filled-basic" label="Story Status" variant="filled" />
				<TextField  style={styles.modalTextField1} onChange={(e) => setState({ storyHours 		: e.target.value		})} id="filled-basic" label="Hours Logged" variant="filled" />

				

			<Button onClick={handleModalClose}>Done</Button>
			</Box>
		</Modal>
	</Box>
	<TableContainer component={Paper}>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Description</TableCell>
						<TableCell>status</TableCell>
						<TableCell>hourslogged</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{state.stories.map(story => {
						return (
							<TableRow
								style={styles.tableRow}
								key={story._id}
								onClick={() => selectSprint(story._id)}
							>
								<TableCell>{story.name}</TableCell>
								<TableCell>{story.description}</TableCell>
								<TableCell>{story.status}</TableCell>
								<TableCell>{story.hours}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
</div>;
};

export default SprintPage;



