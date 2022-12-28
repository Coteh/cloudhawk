import { TabPanel } from '@chakra-ui/react';

type QueryTabPanelProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
};

export const QueryTabPanel: React.FC<QueryTabPanelProps> = ({
    style,
    children,
}) => (
    <TabPanel overflow="scroll" padding={0} style={style}>
        {children}
    </TabPanel>
);
