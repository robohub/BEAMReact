import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ mixins, spacing }: Theme) => createStyles({
    root: {
        ...mixins.gutters(),
        paddingTop: spacing.unit,
        paddingBottom: spacing.unit,
    },
    button: {
        marginTop: spacing.unit,
        marginLeft: spacing.unit,
        marginBottom: spacing.unit
    },
});