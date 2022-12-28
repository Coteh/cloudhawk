import { Button, Tab } from '@chakra-ui/react';
import { MouseEventHandler } from 'react';

type QueryTabProps = {
    onCloseClicked: MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
};

export const QueryTab: React.FC<QueryTabProps> = ({
    onCloseClicked,
    children,
}) => (
    <Tab>
        {children}
        <Button margin={'1em'} size="xs" onClick={onCloseClicked}>
            X
        </Button>
    </Tab>
);
