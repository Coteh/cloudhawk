import { Box, Flex } from '@chakra-ui/react';
import { QueryResults } from '../action/query';
import { QueryDefinition } from '../context/QueryControlContext';
import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

type LogViewProps = {
    queryDefinition: QueryDefinition;
    queryResults?: QueryResults;
    onColumnAdd: Function;
    onColumnRemove: Function;
};

export const LogView: React.FC<LogViewProps> = ({
    queryDefinition,
    queryResults,
    onColumnAdd,
    onColumnRemove,
}) => {
    const [expandedRows, setExpandedRows] = useState<Map<number, boolean>>(
        new Map()
    );

    const expandCollapseRow = (index: number, expanded: boolean) => {
        setExpandedRows((expandedRows) => {
            const newExpandedRows = new Map(expandedRows);
            newExpandedRows.set(index, expanded);
            return newExpandedRows;
        });
    };

    const Row = (index: number) => {
        const expanded = expandedRows.get(index);
        if (!queryResults) {
            return <></>;
        }
        const queryResult = queryResults[index];

        return (
            <Flex border="1px solid black" borderLeft="none" borderRight="none">
                <Box width="200px" flexShrink={0}>
                    {queryResult[0].Value}
                </Box>
                <Box width="50px" flexShrink={0}></Box>
                <Flex flexDirection={'column'} flex={1} width={500}>
                    <Box>
                        {queryResult.map(
                            (column) =>
                                (!queryDefinition.filteredColumns ||
                                    queryDefinition.filteredColumns.length ===
                                        0 ||
                                    queryDefinition.filteredColumns.includes(
                                        column.Field
                                    )) && (
                                    <>
                                        <span>
                                            {column.Field}={column.Value}
                                        </span>
                                        <br />
                                    </>
                                )
                        )}
                    </Box>
                    <a
                        onClick={() => expandCollapseRow(index, !expanded)}
                        href="#"
                    >
                        {expanded ? 'collapse' : 'expand'}
                    </a>
                    {expanded && (
                        <Box>
                            {queryResult.map((column) => (
                                <>
                                    <span>
                                        {column.Field}={column.Value}
                                    </span>
                                    {queryDefinition.filteredColumns &&
                                    queryDefinition.filteredColumns.includes(
                                        column.Field
                                    ) ? (
                                        <a
                                            style={{
                                                marginLeft: '8px',
                                            }}
                                            href="#"
                                            onClick={() =>
                                                onColumnRemove(column.Field)
                                            }
                                        >
                                            remove
                                        </a>
                                    ) : (
                                        <a
                                            style={{
                                                marginLeft: '8px',
                                            }}
                                            href="#"
                                            onClick={() =>
                                                onColumnAdd(column.Field)
                                            }
                                        >
                                            add
                                        </a>
                                    )}
                                    <br />
                                </>
                            ))}
                        </Box>
                    )}
                </Flex>
            </Flex>
        );
    };

    return (
        <Virtuoso totalCount={queryResults?.length || 0} itemContent={Row} />
    );
};
