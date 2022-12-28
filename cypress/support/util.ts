export const BASIC_QUERY_PROMPT = `fields @timestamp, @message
| sort @timestamp desc
| limit 20`;

export const createSampleQuery = (
    queryPrompt: string,
    logGroups: string[],
    queryId: string,
    filteredColumns?: string[]
) => {
    return {
        queryPrompt: queryPrompt,
        logGroups: logGroups,
        queryId: queryId,
        filteredColumns: filteredColumns ?? [],
    };
};
