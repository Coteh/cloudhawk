import { createContext, useEffect, useState } from 'react';
import { useLocalStorageState } from '../hook/useLocalStorageState';
import { QueryResults } from '../action/query';

type QueryResultsContextType = {
    getQueryResults: (queryId: string) => QueryResults;
    addQueryResults: (queryId: string, queryResults: QueryResults) => void;
    removeQueryResults: (queryId: string) => void;
    hasRetrievedResults: boolean;
};

export const QueryResultsContext = createContext<QueryResultsContextType>({
    getQueryResults: () => [],
    addQueryResults: () => {},
    removeQueryResults: () => {},
    hasRetrievedResults: false,
});

export const QueryResultsContextProvider: React.FC<
    {} & {
        children: React.ReactNode;
    }
> = ({ children }) => {
    const [queryResultsMap, setQueryResultsMap] = useState<
        Map<string, QueryResults>
    >(new Map());
    const [cachedQueryIds, setCachedQueryIds] = useLocalStorageState<string[]>(
        'cachedQueryIds',
        []
    );
    const [hasRetrievedResults, setHasRetrievedResults] = useState(false);

    useEffect(() => {
        setQueryResultsMap((queryResultsMap) => {
            cachedQueryIds.forEach((cachedQueryId) => {
                const queryResultsStr =
                    window.localStorage.getItem(cachedQueryId);
                if (!queryResultsStr) {
                    return queryResultsMap.set(cachedQueryId, []);
                }
                try {
                    const queryResults = JSON.parse(queryResultsStr);
                    queryResultsMap.set(cachedQueryId, queryResults);
                } catch (e) {
                    console.warn(e);
                    queryResultsMap.set(cachedQueryId, []);
                }
            });
            setHasRetrievedResults(true);
            return queryResultsMap;
        });
    }, []);

    const addCachedQueryId = (queryId: string) => {
        setCachedQueryIds((cachedQueryIds) => {
            return [...cachedQueryIds, queryId];
        });
    };

    const removeCachedQueryId = (queryId: string) => {
        setCachedQueryIds((cachedQueryIds) => {
            const index = cachedQueryIds.indexOf(queryId);
            if (index < 0) {
                console.warn(`Query ${queryId} not found in cached query ids`);
                return cachedQueryIds;
            }
            return [
                ...cachedQueryIds.slice(0, index),
                ...cachedQueryIds.slice(index + 1),
            ];
        });
    };

    const getQueryResults = (queryId: string) => {
        return queryResultsMap.get(queryId) || [];
    };

    const addQueryResults = (queryId: string, queryResults: QueryResults) => {
        setQueryResultsMap((queryResultsMap) => {
            queryResultsMap.set(queryId, queryResults);
            return queryResultsMap;
        });
        window.localStorage.setItem(queryId, JSON.stringify(queryResults));
        addCachedQueryId(queryId);
    };

    const removeQueryResults = (queryId: string) => {
        setQueryResultsMap((queryResultsMap) => {
            queryResultsMap.delete(queryId);
            return queryResultsMap;
        });
        window.localStorage.removeItem(queryId);
        removeCachedQueryId(queryId);
    };

    return (
        <QueryResultsContext.Provider
            value={{
                getQueryResults,
                addQueryResults,
                removeQueryResults,
                hasRetrievedResults,
            }}
        >
            {children}
        </QueryResultsContext.Provider>
    );
};
