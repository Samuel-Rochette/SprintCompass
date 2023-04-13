import { useEffect, useReducer, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util/index.js";
import styles from "../styles.js";

const SprintReportPage = () => {
	const { sprintId } = useParams();
	const reducer = (state, newState) => ({ ...state, ...newState });
	const navigate = useNavigate();
	const pageLoaded = useRef(false);
	const [state, setState] = useReducer(reducer, {
		report: {},
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
			setState({ report: data.sprintreport });
			console.log(data.sprintreport);
		})();

		pageLoaded.current = true;
	}, []);

	return <div>Sprint Report Page</div>;
};

export default SprintReportPage;
