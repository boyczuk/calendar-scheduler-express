import axios from "axios";
import { useState } from 'react';
import './App.css';
import Calendar from './components/Calendar';

function App() {
	const [message, setMessage] = useState("click me");

	function backendCall() {
		axios.get("http://localhost:4000/api/users")
			.then(res => {
				console.log(res.data.result[0].now);
				setMessage(res.data.result[0].now);
			})
	}

	return (
		<div className="App">
			<Calendar />
		</div>
	);
}

export default App;
