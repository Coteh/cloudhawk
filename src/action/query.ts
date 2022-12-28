import { QueryDefinition } from '../context/QueryControlContext';

export type RunQueryResult = QueryDefinition;

export type QueryExecutionStatus =
    | 'Running'
    | 'Failed'
    | 'Complete'
    | 'Scheduled'
    | 'Timeout'
    | 'Unknown';

export type QueryResults = {
    Field: string;
    Value: string;
}[][];

export type ExecuteQueryResult = {
    queryStatus: QueryExecutionStatus;
    queryResults: QueryResults;
};

export const runQuery: (
    logGroupNames: string[],
    queryPrompt: string
) => Promise<RunQueryResult> = async (
    logGroupNames: string[],
    queryPrompt: string
) => {
    let formData = new FormData();
    logGroupNames.forEach((logGroupName) =>
        formData.append('logGroupNames', logGroupName)
    );
    formData.append('query', queryPrompt);

    const result = await fetch('/query', {
        method: 'POST',
        body: formData,
    });

    if (result.status !== 200) {
        console.error('Could not query successfully');

        let message = '';
        try {
            const data = await result.json();

            message = data.message;
        } catch (e) {
            console.error(e);
            message = 'Could not parse error from server';
        }

        throw new Error(message);
    }

    const data = await result.json();

    return {
        queryPrompt: queryPrompt,
        logGroups: logGroupNames,
        queryId: data.data.queryId,
        filteredColumns: [],
    };
};

export const fetchQueryResults: (
    queryId: string
) => Promise<ExecuteQueryResult> = async (queryId: string) => {
    const result = await fetch('/results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            queryId: queryId,
        }),
    });

    if (result.status !== 200) {
        console.error('Could not fetch query results successfully');

        let message = '';
        try {
            const data = await result.json();

            message = data.message;
        } catch (e) {
            console.error(e);
            message = 'Could not parse error from server';
        }

        throw new Error(message);
    }

    const data = await result.json();

    const queryResult = data.data;

    return queryResult;
};
