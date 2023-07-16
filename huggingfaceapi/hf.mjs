import fetch from "node-fetch";

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/bigscience/bloom",
		{
			headers: {"Content-Type": "application/json", Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({"inputs": "Give a catchy add for a watch "}).then((response) => {
	console.log(JSON.stringify(response));
});