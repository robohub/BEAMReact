import * as React from 'react';
import { withStyles, WithStyles, createStyles, Theme, Snackbar, IconButton, Grid } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import * as Globals from '../../../shared/globals';

import { UserMgmtForm } from './userMgmtForm';
import { UserTemplateMappingForm } from './userTemplateMappingForm';
import { UserTableView } from './userTableView';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { client } from '../../../../index';

const allMetaObjectsQuery = gql`
query allMetaObjects {
    metaObjects {
        id
        name
    }
}
`;
/*
const writeUserMappingMutation = gql`
mutation writeUserMapping($id: ID, $moId: ID, $maId: ID) {
    upsertSystemSetup(
      where: {id: $id}
      create: { systemUserMOMapping: {connect: { id: $moId}}, systemUseridMAMapping: {connect: { id: $maId}}}
      update: { systemUserMOMapping: {connect: { id: $moId}}, systemUseridMAMapping: {connect: { id: $maId}}}
    ) {
      id
    }
  }
`;
*/
const writeUserMappingMutation = gql`
mutation writeUserMapping($id: ID, $moId: ID, $maId: ID) {
    updateSystemSetup(
      where: {id: $id}
      data: { systemUserMOMapping: {connect: { id: $moId}}, systemUseridMAMapping: {connect: { id: $maId}}}
    ) {
      id
    }
  }
`;

const updateUserMOTemplateMutation = gql`
mutation updateUserMOTemplate($id: ID, $moId: ID, $mrId: ID, $oppMRId: String) {
    updateSystemSetup(
      where: {id: $id}
      data: {templateConfig: {update: {
        userRelatedMRId: $oppMRId,
      	moObject: {connect: {id: $moId}},
      	moRelation: {connect: {id: $mrId}}
      }}}
    ) {
      id
    }
  }
`;

const styles = ({ palette }: Theme) => createStyles({
    root: {
        flexGrow: 1,
        backgroundColor: palette.background.paper,
      },
});

interface Props extends WithStyles<typeof styles> {
}

class UserMgmt extends React.PureComponent<Props> {
    state = { snackbarOpen: false };

    onSaveUserMgmt = (moId: string, maId: string) => {
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

    onSaveUserTemplate = (moId: string, mrId: string, oppMRId: string) => {
        
        client.mutate({
            mutation: updateUserMOTemplateMutation,
            variables: {
                id: Globals.SystemConfigVars.SYSTEM_SETUP_ID,
                moId: moId,
                mrId: mrId,
                oppMRId: oppMRId
            }
        }).then(() => {
            Globals.SystemConfigVars.TEMPLATE_CONFIG_METAOBJECT = moId;
            Globals.SystemConfigVars.TEMPLATE_CONFIG_MORELATION = mrId;
            Globals.SystemConfigVars.USER_RELATED_METARELATION = oppMRId;
            this.saveFinished();
        });
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    saveFinished = async () => {
        this.setState({snackbarOpen: true});  // Will update UI with cach changes as well...
    }

    render() {  
        return (
            <div>
                <Query query={allMetaObjectsQuery}>
                    {({ loading: loading2, data: { metaObjects }, error: error2 }) => {
                        if (loading2) {
                            return <div>Loading</div>;
                        }
                        if (error2) {
                            return <h1>ERROR</h1>;
                        }
                        // tslint:disable-next-line:no-console
                        console.log('-- Render of UserMgmtView 2');

                        return (
                            <div>
                                <Grid container={true} spacing={2}>
                                    <Grid item={true} xs={4}>
                                        <UserMgmtForm
                                            selectedMO={Globals.SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING}
                                            selectedMA={Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING}
                                            metaObjects={metaObjects}
                                            onSubmit={this.onSaveUserMgmt}
                                        />
                                    </Grid>
                                    <Grid item={true} xs={4}>
                                        <UserTemplateMappingForm
                                            selectedMO={Globals.SystemConfigVars.TEMPLATE_CONFIG_METAOBJECT}
                                            selectedMR={Globals.SystemConfigVars.TEMPLATE_CONFIG_MORELATION}
                                            metaObjects={metaObjects}
                                            onSubmit={this.onSaveUserTemplate}
                                        />
                                    </Grid>
                                </Grid>
                                <UserTableView/>
                            </div>
                        );
                    }}
                </Query>

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

export const UserMgmtView = withStyles(styles)(UserMgmt);
