export const queryLogGroups = async (prefix: string) => {
    const result = await fetch(`/log_groups?logGroupPrefix=${prefix}`)

    if (result.status !== 200) {
        console.error('Could not get log groups successfully');

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

    return data.data.logGroups;
};
