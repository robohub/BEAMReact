import * as React from 'react';

import * as vis from 'vis';
import gql from 'graphql-tag';
import { client } from '../../../../index';

import { Button, Snackbar, Divider, Typography } from '@material-ui/core';
// import * as moment from 'moment';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

import { ApolloQueryResult } from 'apollo-client';

const getPlan = gql`
query getPlan($boid: ID!) {
    plans (where: {planBO: {id: $boid}}) {
        id
        planBO {
            id
            name
        }
        planData
    }
}
`;

type PlanType = {
    plans: {
        id: string;
        planBO: { id: string },
        planData: { items: string, groups: string};
    }[]
};

const updatePlan = gql`
mutation updatePlan($planId: ID!, $planData: Json, $boId: ID) {
    upsertPlan(
        where: {
            id: $planId
        }
        create: {
            planData: $planData, planBO: {connect: {id: $boId}}
        }
        update: {
            planData: $planData, planBO: {connect: {id: $boId}}
        }
    ) {
        id
    }
}
`;

interface Props extends WithStyles<typeof styles> {
    selectedBO: string;
}

interface State {
    snackbarOpen: boolean;
    selectedBO: string;
}

class TimeLine extends React.Component<Props, State> {
    state = {
        snackbarOpen: false, selectedBO: ''
    };
      
    private container: HTMLElement;
    private timeline: vis.Timeline;
    private items = new vis.DataSet();
    private groups = new vis.DataSet();
    private selectedPlanId = '';
    private options = {};
    private snackbarMessage = '';

    componentDidMount() {
        // Setup timeline
        this.container = document.getElementById('timeline');

        this.options = {
            // groupOrder: 'content',  // groupOrder can be a property name or a sorting function
            editable: {
                add: true,         // add new items by double tapping AND DROPPING!
                updateTime: true,  // drag items horizontally
                updateGroup: true, // drag items from one group to another
                remove: true,       // delete an item by tapping the delete button top right
                overrideItems: false  // allow these options to override item.editable
            },
            // tslint:disable-next-line:no-any
            onAdd : (item: any, callback: (arg0: any) => void) => {
                if (this.items.get(item.id) !== null) {
                    alert('Item already in added in plan...');
                    callback(null);
                } else {
                    callback(item);
                }
            },
            margin: {
                item: 20,
            }
        };
        this.timeline = new vis.Timeline(this.container, null, null, this.options); 
    }

    componentDidUpdate() {
        if (this.props.selectedBO !== null && this.props.selectedBO !== this.state.selectedBO) {
            this.setState({selectedBO: this.props.selectedBO});
            this.items.clear();
            this.groups.clear();
            this.drawTimeLine();
        }
    }

    async drawTimeLine() {
        if (this.props.selectedBO !== null) {
             await client.query({
                query: getPlan,
                fetchPolicy: 'network-only',    // TODO RH: fix cahce strategy!!!
                variables: { 
                    boid: this.props.selectedBO
                }
            }).then((response: ApolloQueryResult<PlanType>) => {
                if (response.data.plans.length === 0) {
                    this.initTimeLineWithData();
                } else {
                    let data = response.data.plans[0].planData;
                    this.items.clear();
                    this.items.add(data.items);
                    this.groups.clear();
                    this.groups.add(data.groups);
                    this.selectedPlanId = response.data.plans[0].id;
                }                
            }).catch(e => {
                alert('Error when loading plan: ' + e);
            });
        }
        this.timeline.setData({items: this.items, groups: this.groups}); 
        // this.timeline.redraw();
        this.timeline.fit();
    }

    initTimeLineWithData() {
        // var now = moment().minutes(0).seconds(0).milliseconds(0);
        var d = new Date();
        var start = d.getFullYear() + '-01-01';
        var end = d.getFullYear() + '-12-31';
    
        this.groups.add([
            {
                id: 2,
                content: 'Header',
                stacking: false
            },
            {
                id: 1,
                content: 'Milestones',
            },
        ]);

        this.items.add({ id: 5, content: 'Start of this year', start: start, type: 'point', group: 1 });
        this.items.add({ id: 6, content: 'End of this year', start: end, type: 'point', group: 1 });
    }

    saveClicked = () => {
        let itemData = this.items.get({
            type: {
              start: 'ISODate',
              end: 'ISODate'
            }
        });
        let groupData = this.groups.get();

        client.mutate({
            mutation: updatePlan,
            // fetchPolicy: 'network-only',
            variables: { 
                planId: this.selectedPlanId,
                planData: { items: itemData, groups: groupData },
                boId: this.props.selectedBO
            }
        }).then(() => {
            this.snackbarMessage = 'Timeplan saved';
            this.setState({snackbarOpen: true});
        }).catch(e => {
            alert('Error when saving plan: ' + e);
        });
    }

    fitClicked = () => {
        this.timeline.fit();
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    render() {
        return (
            <div >
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={this.state.snackbarOpen}
                    autoHideDuration={6000}
                    onClose={this.snackbarClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.snackbarMessage}</span>}
                    /*action={[
                        <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
                        UNDO
                        </Button>,
                        <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={classes.close}
                        onClick={this.handleClose}
                        >
                        <CloseIcon />
                        </IconButton>,
                    ]}*/
                />
                <Typography variant="h6">{this.state.selectedBO !== '' ? 'Selected Plan: ' + this.state.selectedBO : 'No Plan selected...'}</Typography>
                
                <Divider/>

                <div id="timeline" />
                <Button variant="contained" color="primary" className={this.props.classes.button} onClick={this.saveClicked} disabled={this.props.selectedBO === null}>Save</Button>
                <Button variant="contained" color="primary" className={this.props.classes.button} onClick={this.fitClicked} disabled={this.props.selectedBO === null}>Fit</Button>
            </div>
        );
    }
}

export default withStyles(styles)(TimeLine);