export const jsonPost = async (url, data) => {
	return (
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
	).json();
};

export const graphqlPost = async (url, token, query) => {
	return (
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(query),
		})
	).json();
};
