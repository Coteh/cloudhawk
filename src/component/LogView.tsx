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
    };

    const HeaderRow = () => {
        if (!queryResults || !queryResults.length) {
            return <></>;
        }
        const queryResult = queryResults[0];

        return (
            <Tr>
                {queryResult.map((column) => (
                    <Th
                        width={200}
                        style={{
                            background: 'blue',
                            color: 'white',
                        }}
                    >
                        {(!queryDefinition.filteredColumns ||
                            queryDefinition.filteredColumns.length === 0 ||
                            queryDefinition.filteredColumns.includes(
                                column.Field
                            )) &&
                            column.Field}
                    </Th>
                ))}
            </Tr>
        );
    };

    const Row = (index: number) => {
        const expanded = expandedRows.get(index);
        if (!queryResults || !queryResults.length) {
            return <></>;
        }
        const queryResult = queryResults[index];

        let ci = 0;

        return (
            <Fragment key={`Row_${index}`}>
                {queryResult.map((column) => {
                    // TODO fix filtered columns not taking up full width of table
                    if (
                        queryDefinition.filteredColumns &&
                        queryDefinition.filteredColumns.length > 0 &&
                        !queryDefinition.filteredColumns.includes(column.Field)
                    ) {
                        return <></>;
                    }
                    ci += 1;
                    return (
                        <Td
                            className="result-td"
                            flexDirection={'column'}
                            width={500}
                            maxWidth={1000}
                            // TODO if just selecting text, do not expand/collapse the row
                            onClick={() => {
                                expandCollapseRow(index, !expanded);
                                // TODO fix table scrolling back to the top
                                setTimeout(() => {
                                    if (!ref.current) {
                                        return;
                                    }
                                    ref.current.scrollIntoView({
                                        index: index + 10,
                                        behavior: 'auto',
                                        done: () => {},
                                    });
                                }, 0);
                            }}
                        >
                            <Flex justifyContent={'space-between'}>
                                {ci === 1 ? (
                                    <Box>
                                        {expanded ? (
                                            <RiArrowDownSFill />
                                        ) : (
                                            <RiArrowRightSFill />
                                        )}
                                    </Box>
                                ) : (
                                    <></>
                                )}
                                <Box whiteSpace={'normal'}>{column.Value}</Box>
                            </Flex>
                        </Td>
                    );
                })}
                {/* TODO fix the table horizontal scroll not appearing unless you scroll the document, the heights of the dashboard need to be adjusted so that the whole thing will fit in the view without scrolling */}
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
                Table: (props) => <Table {...props} variant="striped" />,
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
                                    <Td colSpan={5}>
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
                                                                // TODO fix table scrolling back to the top
                                                                setTimeout(
                                                                    () => {
                                                                        if (
                                                                            !ref.current
                                                                        ) {
                                                                            return;
                                                                        }
                                                                        ref.current.scrollIntoView(
                                                                            {
                                                                                index:
                                                                                    index +
                                                                                    10,
                                                                                behavior:
                                                                                    'auto',
                                                                                done: () => {},
                                                                            }
                                                                        );
                                                                    },
                                                                    0
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
                                                                // TODO fix table scrolling back to the top
                                                                setTimeout(
                                                                    () => {
                                                                        if (
                                                                            !ref.current
                                                                        ) {
                                                                            return;
                                                                        }
                                                                        ref.current.scrollIntoView(
                                                                            {
                                                                                index:
                                                                                    index +
                                                                                    10,
                                                                                behavior:
                                                                                    'auto',
                                                                                done: () => {},
                                                                            }
                                                                        );
                                                                    },
                                                                    0
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
