import { createStyles, Theme } from '@material-ui/core/styles';

const inputWidth = 300;

export const styles = ({ mixins, spacing, typography }: Theme) => createStyles({
    root: {
        ...mixins.gutters(),
        ...typography.body1,
        paddingTop: spacing(1),
        paddingBottom: spacing(1),
    },
    button: {
        marginTop: spacing(1),
        marginLeft: spacing(1),
        marginBottom: spacing(1)
    },
    selectButton: {
        marginTop: spacing(2),
        marginLeft: spacing(1),
        marginBottom: spacing(1)
    },
    select: {
        minWidth: inputWidth,
    },
    textField: {
        marginTop: spacing(1),
        marginLeft: spacing(1),
        marginBottom: spacing(1),
        width: inputWidth,
      },
      paperMargin: {
        marginTop: spacing(2),
        marginBottom: spacing(2),

      },
      errorText: {
          color: 'red'
      }
});