import './App.css';
import { QueryControlContextProvider } from './context/QueryControlContext';
import { QueryPage } from './page/QueryPage';
import { QueryResultsContextProvider } from './context/QueryResultsContext';

function App() {
    return (
        <QueryControlContextProvider>
            <QueryResultsContextProvider>
                <QueryPage />
            </QueryResultsContextProvider>
        </QueryControlContextProvider>
    );
}

export default App;
