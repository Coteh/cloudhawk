import {
    Tabs,
    TabList,
    TabPanels,
    Input,
    Textarea,
    Button,
    Box,
    Tab,
    Flex,
    Center,
    Image,
    TabPanel,
    FormLabel,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import {
    fetchQueryResults,
    QueryExecutionStatus,
    QueryResults,
    runQuery,
} from '../action/query';
import { LogView } from '../component/LogView';
import { QueryTab } from '../component/QueryTab';
import { QueryTabPanel } from '../component/QueryTabPanel';
import {
    createBlankQueryDefinition,
    QueryControlContext,
    QueryDefinition,
} from '../context/QueryControlContext';
import { QueryResultsContext } from '../context/QueryResultsContext';
import { useLocalStorageState } from '../hook/useLocalStorageState';
import CloudhawkLogo from '../assets/cloudhawk-logo.png';

enum QueryPageState {
    QUERY_PREPARE = 0,
    QUERY_RUNNING = 1,
    QUERY_ERROR = 2,
    QUERY_COMPLETE = 3,
}

export const QueryPage: React.FC<{}> = () => {
    const controlContext = useContext(QueryControlContext);
    const resultsContext = useContext(QueryResultsContext);

    const [currentTabIndex, setCurrentTabIndex] = useLocalStorageState(
        'current-tab-index',
        0
    );
    const [currentQueryDef, setCurrentQueryDef] = useState<QueryDefinition>(
        controlContext.queryDefinitions[0] || {}
    );
    const [queryPrompt, setQueryPrompt] = useState(
        currentQueryDef?.queryPrompt || ''
    );
    const [logGroupName, setLogGroupName] = useState(
        (currentQueryDef?.logGroups && currentQueryDef?.logGroups[0]) || ''
    );
    const [queryId, setQueryId] = useState(currentQueryDef?.queryId || '');
    const [queryStatus, setQueryStatus] =
        useState<QueryExecutionStatus>('Unknown');
    const [queryPageState, setQueryPageState] = useState<QueryPageState>(
        QueryPageState.QUERY_PREPARE
    );
    const [queryErrorText, setQueryErrorText] = useState('');
    const [isCached, setIsCached] = useState(false);

    const [queryResults, setQueryResults] = useState<QueryResults>();

    const handleTabChange = (index: number) => {
        const currentQueryDef =
            controlContext.queryDefinitions[index] ||
            createBlankQueryDefinition();
        setCurrentQueryDef(controlContext.queryDefinitions[index]);

        setCurrentTabIndex(index);
        setQueryPrompt(currentQueryDef.queryPrompt);
        setLogGroupName(currentQueryDef.logGroups[0] || '');
        setQueryId(currentQueryDef.queryId);

        const queryResults = resultsContext.getQueryResults(
            currentQueryDef.queryId
        );
        setQueryResults(queryResults);
        if (queryResults.length > 0) {
            setQueryPageState(QueryPageState.QUERY_COMPLETE);
            setIsCached(true);
        } else {
            setIsCached(false);
        }
    };

    const handleRunQuery = async () => {
        if (queryId !== '') {
            resultsContext.removeQueryResults(queryId);
        }

        const logGroupNames = logGroupName.split(',');
        let queryResult;
        try {
            queryResult = await runQuery(logGroupNames, queryPrompt);
        } catch (e: any) {
            setQueryPageState(QueryPageState.QUERY_ERROR);
            setQueryErrorText(e.message);
            return;
        }

        setCurrentQueryDef(queryResult);
        controlContext.updateQueryDefinition(currentTabIndex, queryResult);
        setQueryPrompt(queryResult.queryPrompt);
        setLogGroupName(queryResult.logGroups[0]);
        setQueryId(queryResult.queryId);
        setQueryResults([]);
        setIsCached(false);
        handleFetchQueryResults(queryResult.queryId);

        setQueryPageState(QueryPageState.QUERY_RUNNING);
    };

    const handleFetchQueryResults = async (queryId: string) => {
        let queryResult;
        try {
            queryResult = await fetchQueryResults(queryId);
        } catch (e: any) {
            setQueryPageState(QueryPageState.QUERY_ERROR);
            setQueryErrorText(e.message);
            return;
        }
        const queryStatus = queryResult.queryStatus;
        setQueryStatus(queryStatus);
        if (queryStatus !== 'Complete') {
            if (queryStatus === 'Running' || queryStatus === 'Scheduled') {
                setTimeout(() => {
                    handleFetchQueryResults(queryId);
                }, 1000);
            }
        } else {
            setQueryPageState(QueryPageState.QUERY_COMPLETE);
        }

        const queryResults = queryResult.queryResults;

        setQueryResults(queryResults);

        resultsContext.addQueryResults(queryId, queryResults);
    };

    useEffect(() => {
        if (resultsContext.hasRetrievedResults) {
            handleTabChange(currentTabIndex);
        }
    }, [resultsContext.hasRetrievedResults]);

    const tabBarHeight = 58;
    const queryBoxHeight = 184;

    const handleColumnAdd = (column: string) => {
        const newQueryDef = JSON.parse(JSON.stringify(currentQueryDef));
        newQueryDef.filteredColumns = [
            ...(newQueryDef.filteredColumns || []),
            column,
        ];
        setCurrentQueryDef(newQueryDef);
        controlContext.updateQueryDefinition(currentTabIndex, newQueryDef);
    };

    const handleColumnRemove = (column: string) => {
        const newQueryDef = JSON.parse(JSON.stringify(currentQueryDef));
        if (!newQueryDef.filteredColumns) {
            newQueryDef.filteredColumns = [];
        }
        newQueryDef.filteredColumns = [
            ...newQueryDef.filteredColumns.slice(
                0,
                newQueryDef.filteredColumns.indexOf(column)
            ),
            ...newQueryDef.filteredColumns.slice(
                newQueryDef.filteredColumns.indexOf(column) + 1
            ),
        ];
        setCurrentQueryDef(newQueryDef);
        controlContext.updateQueryDefinition(currentTabIndex, newQueryDef);
    };

    const renderQueryPanelContents = (
        queryDefinition: QueryDefinition,
        queryResults?: QueryResults
    ) => {
        switch (queryPageState) {
            case QueryPageState.QUERY_COMPLETE:
            case QueryPageState.QUERY_RUNNING:
                return (
                    <>
                        <Flex>
                            <Box marginRight={'2em'}>
                                {queryId && queryResults && (
                                    <span>
                                        {queryResults.length} results
                                        {isCached ? ' (cached)' : ''}
                                    </span>
                                )}
                            </Box>
                            {!isCached && (
                                <Box>
                                    {queryStatus === 'Failed'
                                        ? 'Query failed to execute'
                                        : `Query is ${queryStatus}`}
                                </Box>
                            )}
                        </Flex>
                        <LogView
                            queryDefinition={queryDefinition}
                            queryResults={queryResults}
                            onColumnAdd={handleColumnAdd}
                            onColumnRemove={handleColumnRemove}
                        />
                    </>
                );
            case QueryPageState.QUERY_ERROR:
                return <Flex>Error performing query: {queryErrorText}</Flex>;
            case QueryPageState.QUERY_PREPARE:
                return <Flex>Press "Run query" to send query</Flex>;
        }
    };

    return (
        <>
            <Tabs
                height={'100vh'}
                tabIndex={currentTabIndex}
                onChange={handleTabChange}
                defaultIndex={currentTabIndex}
            >
                <TabList height={tabBarHeight}>
                    <Center padding="0.75em">
                        <Image width={'60px'} src={CloudhawkLogo}></Image>
                    </Center>
                    {controlContext.queryDefinitions.map(
                        (queryDefinition, index) => (
                            <QueryTab
                                onCloseClicked={() => {
                                    controlContext.removeQueryDefinition(index);
                                }}
                            >
                                {queryDefinition.queryId || 'New Query'}
                            </QueryTab>
                        )
                    )}
                    <Tab
                        onClick={() => {
                            setCurrentQueryDef(createBlankQueryDefinition());
                            controlContext.addBlankQueryDefinition();
                        }}
                    >
                        +
                    </Tab>
                </TabList>
                <TabPanels height={`calc(100% - ${tabBarHeight}px)`}>
                    {controlContext.queryDefinitions.map((queryDefinition) => {
                        return (
                            <QueryTabPanel
                                style={{
                                    height: '100%',
                                    overflowX: 'hidden',
                                }}
                            >
                                <Box height={queryBoxHeight}>
                                    <Box data-cy="query-title">
                                        {queryDefinition.queryId || 'New Query'}
                                    </Box>
                                    <Flex alignItems={'center'}>
                                        <FormLabel
                                            width={'100px'}
                                            textAlign={'center'}
                                            verticalAlign={'middle'}
                                            margin={0}
                                            htmlFor="log-group-name"
                                        >
                                            Log Group:
                                        </FormLabel>
                                        <Input
                                            type={'text'}
                                            value={logGroupName}
                                            name="log-group-name"
                                            onChange={(e) =>
                                                setLogGroupName(e.target.value)
                                            }
                                        ></Input>
                                    </Flex>
                                    <Textarea
                                        value={queryPrompt}
                                        name="query-prompt"
                                        onChange={(e) =>
                                            setQueryPrompt(e.target.value)
                                        }
                                    ></Textarea>
                                    <Button onClick={handleRunQuery}>
                                        Run query
                                    </Button>
                                </Box>
                                <Box
                                    style={{
                                        height: `calc(100% - ${queryBoxHeight}px)`,
                                        margin: '2px',
                                    }}
                                >
                                    {renderQueryPanelContents(
                                        queryDefinition,
                                        queryResults
                                    )}
                                </Box>
                            </QueryTabPanel>
                        );
                    })}
                    <TabPanel>
                        {controlContext.queryDefinitions.length <= 0
                            ? 'Welcome to CloudHawk! Press "+" to open your first query.'
                            : ''}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
};
