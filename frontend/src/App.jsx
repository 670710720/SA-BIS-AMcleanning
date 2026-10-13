import { Routes, Route, Navigate } from 'react-router-dom';
import Customers from './page/Customers.jsx';
import './App.css';

function App() {
return (
<Routes>
<Route
path="/"
element={<Navigate to="/customers" replace />}
/>
<Route
path="/customers"
element={<Customers />}
/>
</Routes>
);
}

export default App;