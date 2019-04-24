import * as React from 'react';

import { EditUserView } from './editUserView';

import { withStyles, WithStyles, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Typography,
    IconButton, TextField, Grid, Divider, Dialog, DialogTitle, Snackbar,  } from '@material-ui/core';
import { Delete, Edit, KeyboardArrowLeft, KeyboardArrowRight, Search, Close } from '@material-ui/icons';

import * as Globals from '../../../shared/globals';
import { styles } from '../../../shared/style';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const countUsersQuery = gql`
query countUsers($searchString: String) {
    usersConnection(
        where: {
            OR: [
                {userid_contains: $searchString},
                {name_contains: $searchString}
            ]
        }
    ){
        aggregate {
            count
        }
    }
}
`;

const allUsersQuery = gql`
query allUsers($first: Int, $skip: Int, $orderBy: UserOrderByInput, $searchString: String){
    users(
        where: {
            OR: [
                {userid_contains: $searchString},
                {name_contains: $searchString}
            ]
        }
        first: $first, skip: $skip, orderBy: $orderBy
    ) {
        id
        userid
        name
    }
}
`;

interface Response {
    users: {
        id: string;
        userid: string;
        name: string;
    }[];
}

interface Props extends WithStyles<typeof styles> {}
    
class UserTable extends React.Component<Props> {
    state = {
        orderBy: 'userid_ASC', searchString: '', currPage: 0, pageSize: 3,
        editDialogOpen: false, selectedUserId: '', snackbarOpen: false
    };

    private noOfUsers: 0;

    componentDidUpdate() {
        // tslint:disable-next-line:no-console
        console.log('Component did UPDATE----');

    }

    componentDidMount() {
        // tslint:disable-next-line:no-console
        console.log('Component did mount----');
    }

    deleteUser = (userId: string) => {
        // tslint:disable-next-line:no-console
        console.log(userId);
    }

    editUser = (userId: string) => {
        this.setState({editDialogOpen: true, selectedUserId: userId});
    }

    pageBack = () => {
        if (this.state.currPage > 0) { this.setState({ currPage: this.state.currPage - 1}); }
    }

    pageForward = () => {
        if ((this.state.currPage + 1) * this.state.pageSize < this.noOfUsers) {
            this.setState({ currPage: this.state.currPage + 1});
        }
    }

    hideEditForm = () => {
        this.setState({ editDialogOpen: false });
    }

    handleInput(value: string) {
        // tslint:disable-next-line:no-console
        console.log(value);
        this.setState({searchString: value});
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    whenUserSaved = async () => {
        this.hideEditForm();
        this.setState({snackbarOpen: true});
    }

    render() {
        const { classes } = this.props;
        return (
            <Paper className={classes.paperMargin}>
                <Grid container={true} className={classes.root}>
                    <Grid item={true} xs={2}>
                        <Typography variant="h6">System Users</Typography>
                    </Grid>
                    {Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING !== '' ?
                        <Grid item={true}>
                            <Search/>
                            <TextField
                                value={this.state.searchString}
                                // className={this.props.classes.textField}
                                id="search"
                                onChange={event => this.handleInput(event.target.value)}
                                placeholder={'Search...'}
                            />
                        </Grid>
                        :
                        null
                    }
                </Grid>
                <Divider style={{marginTop: 10, marginBottom: 10}}/>
                {Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING !== '' ?
                    <div>
                        <Table style={{tableLayout: 'fixed'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>User ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <Query
                                    query={allUsersQuery}
                                    variables={{
                                        first: this.state.pageSize,
                                        skip: this.state.currPage * this.state.pageSize,
                                        orderBy: this.state.orderBy,
                                        searchString: this.state.searchString
                                    }}
                                >
                                {({ loading, data, error}) => {
                                    if (loading) {
                                        return <TableRow><TableCell>Loading</TableCell></TableRow>;
                                    }
                                    if (error) {
                                        return <TableRow><TableCell>Error: {error.message}</TableCell></TableRow>;
                                    }
                                    // tslint:disable-next-line:no-console
                                    console.log('-- Render of UserTableView');

                                    let response = data as Response;

                                    return (
                                        response.users.length ?
                                            response.users.map(user => 
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <Button onClick={() => this.deleteUser(user.id)} color={'secondary'} ><Delete/></Button>
                                                        <Button onClick={() => this.editUser(user.id)} color={'primary'} ><Edit/></Button>
                                                    </TableCell>
                                                    <TableCell><Typography variant="subtitle2">{user.name}</Typography></TableCell>
                                                    <TableCell>{user.userid}</TableCell>
                                                </TableRow>                            
                                            )
                                            :
                                            <TableRow>
                                                <TableCell>
                                                    No users defined...
                                                </TableCell>
                                            </TableRow>
                                    );
                                }}
                                </Query>
                            </TableBody>
                        </Table>
                    
                        <Query query={countUsersQuery} variables={{ searchString: this.state.searchString }} >
                        {({ loading, data, error}) => {
                            if (error) { return 'Error: ' + error.message; }

                            if (!loading) { this.noOfUsers = data.usersConnection.aggregate.count; }

                            return (
                                <div className={classes.button}>
                                    {this.state.currPage * this.state.pageSize + 1 + '-' + (this.state.currPage + 1) * this.state.pageSize + ' of ' + (loading ? 0 : this.noOfUsers)}
                                    <IconButton className={this.props.classes.button} aria-label="Back" onClick={() => this.pageBack()} disabled={this.state.currPage === 0}>
                                        <KeyboardArrowLeft />
                                    </IconButton>
                                    <IconButton
                                        className={this.props.classes.button}
                                        aria-label="Forward"
                                        onClick={() => this.pageForward()}
                                        disabled={loading ? true : (this.state.currPage + 1) * this.state.pageSize >= this.noOfUsers}
                                    >
                                        <KeyboardArrowRight />
                                    </IconButton>
                                </div>
                            );
                        }}
                        </Query>
                    </div>
                    :
                    <div className={classes.root}>
                        -To create users, please define the SystemUser Meta Domain mapping first!-
                    </div>
                }

                <Dialog 
                    open={this.state.editDialogOpen}
                    onClose={this.hideEditForm}
                    fullWidth={true}
                    maxWidth={'md'}
                >
                    <DialogTitle>
                        Edit User
                    </DialogTitle>
                    <EditUserView
                        newObject={false}
                        selectedUserId={this.state.selectedUserId}
                        whenSaved={this.whenUserSaved}
                    />
                </Dialog >

                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.snackbarOpen}
                    autoHideDuration={6000}
                    onClose={this.snackbarClose}
                    ContentProps={{'aria-describedby': 'message-id'}}
                    message={<span id="message-id">Saved User</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                            <Close/>
                        </IconButton>,
                    ]}
                />
            </Paper>
        );
    }
}

export const UserTableView = withStyles(styles)(UserTable);