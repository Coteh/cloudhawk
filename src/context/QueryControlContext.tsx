import { createContext } from 'react';
import { useLocalStorageState } from '../hook/useLocalStorageState';

export type QueryDefinition = {
    queryPrompt: string;
    logGroups: string[];
    queryId: string;
    filteredColumns: string[];
};

const BASIC_QUERY_PROMPT = `fields @timestamp, @message
| sort @timestamp desc
| limit 20`;

export const createBlankQueryDefinition = () => ({
    queryPrompt: BASIC_QUERY_PROMPT,
    logGroups: [],
    queryId: '',
    filteredColumns: [],
});

type QueryControlContextType = {
    queryDefinitions: QueryDefinition[];
    updateQueryDefinition: (
        index: number,
        queryDefinition: QueryDefinition
    ) => void;
    addBlankQueryDefinition: () => void;
    removeQueryDefinition: (index: number) => void;
};

export const QueryControlContext = createContext<QueryControlContextType>({
    queryDefinitions: [],
    updateQueryDefinition: () => {},
    addBlankQueryDefinition: () => {},
    removeQueryDefinition: () => {},
});

export const QueryControlContextProvider: React.FC<
    {} & {
        children: React.ReactNode;
    }
> = ({ children, ...rest }) => {
    const [queryDefinitions, setQueryDefinitions] = useLocalStorageState<
        QueryDefinition[]
    >('queryDefs', []);

    const updateQueryDefinition = (
        index: number,
        queryDefinition: QueryDefinition
    ) => {
        setQueryDefinitions((queryDefinitions) => {
            queryDefinitions = [
                ...queryDefinitions.slice(0, index),
                queryDefinition,
                ...queryDefinitions.slice(index + 1),
            ];
            return queryDefinitions;
        });
    };

    const addBlankQueryDefinition = () => {
        setQueryDefinitions((queryDefinitions) => {
            queryDefinitions = [
                ...queryDefinitions,
                createBlankQueryDefinition(),
            ];
            return queryDefinitions;
        });
    };

    const removeQueryDefinition = (index: number) => {
        setQueryDefinitions((queryDefinitions) => {
            queryDefinitions = [
                ...queryDefinitions.slice(0, index),
                ...queryDefinitions.slice(index + 1),
            ];
            return queryDefinitions;
        });
    };

    return (
        <QueryControlContext.Provider
            value={{
                queryDefinitions,
                updateQueryDefinition,
                addBlankQueryDefinition,
                removeQueryDefinition,
            }}
        >
            {children}
        </QueryControlContext.Provider>
    );
};
