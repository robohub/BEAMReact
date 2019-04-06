import { createStyles, Theme } from '@material-ui/core/styles';

const inputWidth = 300;

export const styles = ({ mixins, spacing, typography }: Theme) => createStyles({
    root: {
        ...mixins.gutters(),
        ...typography.body1,
        paddingTop: spacing.unit,
        paddingBottom: spacing.unit,
    },
    button: {
        marginTop: spacing.unit,
        marginLeft: spacing.unit,
        marginBottom: spacing.unit
    },
    selectButton: {
        marginTop: 2 * spacing.unit,
        marginLeft: spacing.unit,
        marginBottom: spacing.unit
    },
    select: {
        minWidth: inputWidth,
    },
    textField: {
        marginTop: spacing.unit,
        marginLeft: spacing.unit,
        marginBottom: spacing.unit,
        width: inputWidth,
      },
      paperMargin: {
        marginTop: spacing.unit * 2,
        marginBottom: spacing.unit * 2,

      },
      errorText: {
          color: 'red'
      }
});