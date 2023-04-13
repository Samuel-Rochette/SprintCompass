import { useEffect, useReducer, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { graphqlPost } from "../util/index.js";
import styles from "../styles.js";

const UserReportPage = () => {
	const { userprojectId } = useParams();
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
            query($userprojectid: String) {
              userreport(userprojectid: $userprojectid) {
                username
                projectname
                sprints { 
                  name
                  status
                  stories { 
                    name
                    description
                    status
                    hourslogged
                    hoursestimated
                    tasks {
                      name
                      status 
                    }
                  }
                } 
              } 
            }
          `,
					variables: { userprojectid: userprojectId },
				}
			);
			setState({ report: data.userreport });
			console.log(data.userreport);
		})();

		pageLoaded.current = true;
	}, []);

	return <div>User Report Page</div>;
};

export default UserReportPage;
