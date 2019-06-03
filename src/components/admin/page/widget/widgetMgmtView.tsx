import * as React from 'react';
import { withStyles, WithStyles, createStyles, Theme, Snackbar, IconButton, Divider } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { WidgetList } from './widgetList';
import { CreateWidget } from './createWidget';

const styles = ({ palette }: Theme) => createStyles({
    root: {
        flexGrow: 1,
        backgroundColor: palette.background.paper,
      },
});

interface Props extends WithStyles<typeof styles> {
}

interface State {
    snackbarOpen: boolean;
    creatingWidget: boolean;
}

class WidgetMgmtComp extends React.PureComponent<Props, State> {
    state = {
        snackbarOpen: false,
        creatingWidget: false
    };
/*
    onSaveWidget = (moId: string, maId: string) => {
        client.mutate({
            mutation: writeUserMappingMutation,
            variables: {
                id: Globals.SystemConfigVars.SYSTEM_SETUP_ID,
                moId: moId,
                maId: maId
            }
        }).then(() => {
            Globals.SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING = moId;
            Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING = maId;
            this.saveFinished();
        });
    }
*/
    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    saveFinished = async () => {
        this.setState({snackbarOpen: true});  // Will update UI with cach changes as well...
    }

    setCreating = (creating: boolean) => {
        this.setState({creatingWidget: creating});
    }

    render() {

        // tslint:disable-next-line:no-console
        console.log('## WidgetMgmt RENDERAR ....');

        return (
            <div>

                <CreateWidget setCreating={this.setCreating}/>
                <Divider style={{marginTop: 10, marginBottom: 10}}/>
                <WidgetList isCreating={this.state.creatingWidget}/>

                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.snackbarOpen}
                    autoHideDuration={6000}
                    onClose={this.snackbarClose}
                    ContentProps={{'aria-describedby': 'message-id'}}
                    message={<span id="message-id">Saved Mapping</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                            <CloseIcon/>
                        </IconButton>,
                    ]}
                />
            </div>
        );
    }
}

export const WidgetMgmtView = withStyles(styles)(WidgetMgmtComp);
