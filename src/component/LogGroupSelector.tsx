import { Checkbox } from '@chakra-ui/react';
import { Virtuoso } from 'react-virtuoso';

type LogGroupSelectorProps = {
    logGroups: string[];
    selectedLogGroups: string[];
    onLogGroupSelected: (logGroup: string, checked: boolean) => void;
};

export const LogGroupSelector: React.FC<LogGroupSelectorProps> = ({logGroups, selectedLogGroups, onLogGroupSelected}) => {
    const Row = (index: number) => {
        const logGroup = logGroups[index];
        const checked = selectedLogGroups.includes(logGroup);
        return (
            <Checkbox key={`${logGroup}_${index}`} defaultChecked={checked} checked={checked} onChange={(e) => {
                if (e.target.checked) {
                    console.log(e.target, logGroup, "checked!");
                } else {
                    console.log(e.target, logGroup, "not checked!");
                }
                onLogGroupSelected(logGroup, e.target.checked);
            }}>{logGroup}</Checkbox>
        )
    };

    return (
        <Virtuoso totalCount={logGroups.length} itemContent={Row} />
    );
};
