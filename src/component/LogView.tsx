import {
    Box,
    Flex,
    Link,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { QueryResults } from '../action/query';
import { QueryDefinition } from '../context/QueryControlContext';
import { useState, useRef, forwardRef, Fragment } from 'react';
import { TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { RiArrowRightSFill, RiArrowDownSFill } from 'react-icons/ri';

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
    const ref = useRef<TableVirtuosoHandle>(null);

    const expandCollapseRow = (index: number, expanded: boolean) => {
        setExpandedRows((expandedRows) => {
            const newExpandedRows = new Map(expandedRows);
            newExpandedRows.set(index, expanded);
            return newExpandedRows;
        });
        performAutoScroll(index);
    };

    // TODO auto-scroll to exact position instead of to specific index
    const performAutoScroll = async (index: number) => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (!ref.current) return;
        ref.current.scrollToIndex(index);
    };

    const HeaderRow = () => {
        if (!queryResults || !queryResults.length) {
            return <></>;
        }
        const queryResult = queryResults[0];

        return (
            <Tr>
                <Th
                    width="1px"
                    style={{
                        background: 'blue',
                        color: 'white',
                    }}
                />
                {queryResult.map(
                    (column) =>
                        (!queryDefinition.filteredColumns ||
                            queryDefinition.filteredColumns.length === 0 ||
                            queryDefinition.filteredColumns.includes(
                                column.Field
                            )) && (
                            <Th
                                style={{
                                    background: 'blue',
                                    color: 'white',
                                }}
                            >
                                {column.Field}
                            </Th>
                        )
                )}
            </Tr>
        );
    };

    const Row = (index: number) => {
        const expanded = expandedRows.get(index);
        if (!queryResults || !queryResults.length) {
            return <></>;
        }
        const queryResult = queryResults[index];

        return (
            <Fragment key={`Row_${index}`}>
                <Td
                    style={{
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        expandCollapseRow(index, !expanded);
                    }}
                >
                    {expanded ? <RiArrowDownSFill /> : <RiArrowRightSFill />}
                </Td>
                {queryResult.map((column) => {
                    // TODO fix filtered columns not taking up full width of table
                    if (
                        queryDefinition.filteredColumns &&
                        queryDefinition.filteredColumns.length > 0 &&
                        !queryDefinition.filteredColumns.includes(column.Field)
                    ) {
                        return <></>;
                    }
                    return (
                        <Td
                            className="result-td"
                            flexDirection={'column'}
                            maxWidth={1000}
                            style={{
                                cursor: 'pointer',
                            }}
                            // TODO if just selecting text, do not expand/collapse the row
                            onClick={() => {
                                expandCollapseRow(index, !expanded);
                            }}
                        >
                            <Box whiteSpace={'normal'} wordBreak="break-all">
                                {column.Value}
                            </Box>
                        </Td>
                    );
                })}
            </Fragment>
        );
    };

    return (
        <TableVirtuoso
            ref={ref}
            data={queryResults}
            components={{
                Scroller: forwardRef((props, ref) => (
                    <TableContainer
                        {...props}
                        ref={ref}
                        overflowY={'initial'}
                        overflowX={'initial'}
                    />
                )),
                Table: (props) => <Table {...props} layout="fixed" />,
                TableHead: Thead,
                TableRow: (props) => {
                    const index = props['data-index'];
                    const expanded = expandedRows.get(index);
                    const queryResult = queryResults
                        ? queryResults[index]
                        : undefined;
                    return (
                        <>
                            <Tr {...props} />
                            {queryResult && expanded && (
                                <Tr>
                                    <Td
                                        colSpan={
                                            queryDefinition.filteredColumns
                                                .length + 1
                                        }
                                    >
                                        <Box>
                                            {queryResult.map((column) => (
                                                <>
                                                    <span>
                                                        {column.Field}=
                                                        {column.Value}
                                                    </span>
                                                    {queryDefinition.filteredColumns &&
                                                    queryDefinition.filteredColumns.includes(
                                                        column.Field
                                                    ) ? (
                                                        <Link
                                                            style={{
                                                                marginLeft:
                                                                    '8px',
                                                            }}
                                                            href="#"
                                                            onClick={() => {
                                                                onColumnRemove(
                                                                    column.Field
                                                                );
                                                                performAutoScroll(
                                                                    index
                                                                );
                                                            }}
                                                        >
                                                            remove
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            style={{
                                                                marginLeft:
                                                                    '8px',
                                                            }}
                                                            href="#"
                                                            onClick={() => {
                                                                onColumnAdd(
                                                                    column.Field
                                                                );
                                                                performAutoScroll(
                                                                    index
                                                                );
                                                            }}
                                                        >
                                                            add
                                                        </Link>
                                                    )}
                                                    <br />
                                                </>
                                            ))}
                                        </Box>
                                    </Td>
                                </Tr>
                            )}
                        </>
                    );
                },
                TableBody: forwardRef((props, ref) => (
                    <Tbody
                        {...props}
                        ref={ref}
                        style={{
                            overflow: 'auto',
                        }}
                    />
                )),
            }}
            fixedHeaderContent={HeaderRow}
            itemContent={Row}
        />
    );
};
