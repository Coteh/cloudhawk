import { Box, Button, Tab } from '@chakra-ui/react';
import { MouseEventHandler } from 'react';

type QueryTabProps = {
    onCloseClicked: MouseEventHandler<HTMLButtonElement>;
    queryTabName: string;
    queryTabNameLimit?: number;
};

export const QueryTab: React.FC<QueryTabProps> = ({
    onCloseClicked,
    queryTabName,
    queryTabNameLimit = 20,
}) => (
    <Box position="relative">
        <Tab height="100%">
            <Box marginRight={"2em"}>
                {queryTabName.slice(0, queryTabNameLimit) + (queryTabName.length >= queryTabNameLimit ? "..." : "")}
            </Box>
        </Tab>
        <Button margin={'1em'} size="xs" onClick={onCloseClicked} position="absolute" top={"3px"} right={0}>
            X
        </Button>
    </Box>
);
