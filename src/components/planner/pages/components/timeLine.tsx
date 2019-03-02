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
        itemBOs {
            id
            name
        }
    }
}
`;

type PlansType = {
    plans: PlanType[]
};

type PlanType = {
    id: string;
    planBO: { id: string },
    planData: { items: {}[], groups: string}
    itemBOs: {id: string, name: string}[]
};

const updatePlan = gql`
mutation updatePlan($planId: ID!, $planData: Json, $boId: ID, $itemBOs: [BusinessObjectWhereUniqueInput!]) {
    upsertPlan(
    where: {
      id: $planId
    }
    create: {
			planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {connect: $itemBOs}
    }
    update: {
			planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {set: $itemBOs}
    }
  ) {
        id
  }
}
`;

interface Props extends WithStyles<typeof styles> {
    selectedBO: string;
    selectedBoName: string;
    updateSelectedBO: (boId: string) => void;
}

interface State {
    snackbarOpen: boolean;
    selectedBOId: string;
}

class TimeLine extends React.Component<Props, State> {
    state = {
        snackbarOpen: false, selectedBOId: ''
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
            },
            stack: true
        };

        this.timeline = new vis.Timeline(this.container, null, null, this.options);

        this.timeline.on('doubleClick', (event => {
            // tslint:disable-next-line:no-console
            console.log(event);
            if (event.item && this.state.selectedBOId !== event.item) {
                // this.selectedObjId = e.currentTarget.id;
                this.props.updateSelectedBO(event.item);  // Will lead to change of plan...
            }            
        }));
    }

    componentDidUpdate() {
        if (this.props.selectedBO !== null && this.props.selectedBO !== this.state.selectedBOId) {
            this.setState({selectedBOId: this.props.selectedBO});
            this.items.clear();
            this.groups.clear();
            this.drawTimeLine();
        }
    }

    generateId() {
        var timestamp = (new Date().getTime() / 1000 ).toString();
        return timestamp + (Math.random() * 16).toString();
    }

    validateItems(dataItems: {}[], plan: PlanType) {
        var newDataItems = new Array<{}>();

        dataItems.map((item: {id: string, content: string, bizobject: boolean, className: string}) => {
            var found = false;
            var newItem = item;
            var newContent = item.content;
            for (var i = 0; i < plan.itemBOs.length; i++) {  // As of now the ID of an object is 25-character string...
                if (item.bizobject && item.id === plan.itemBOs[i].id ) {
                    found = true;
                    newContent = plan.itemBOs[i].name;  // Update content, may have changed
                    break;
                }
            }
            if (!found && item.bizobject) {
                newContent = '-REMOVED- ' + item.content;
                newItem.bizobject = false;
                newItem.id = this.generateId();
                newItem.className = 'orange';   // See App.css for CSS classes
            }
            newItem.content = newContent;
            newDataItems.push(newItem);
        });
        return newDataItems;
    }

    async drawTimeLine() {
        if (this.props.selectedBO !== null) {
             await client.query({
                query: getPlan,
                fetchPolicy: 'network-only',    // TODO RH: fix cahce strategy!!!
                variables: { 
                    boid: this.props.selectedBO
                }
            }).then((response: ApolloQueryResult<PlansType>) => {
                if (response.data.plans.length === 0) {
                    this.initTimeLineWithData();
                    this.selectedPlanId = '';
                } else {
                    let data = response.data.plans[0].planData;
                    let validatedItems = this.validateItems(data.items, response.data.plans[0]);  // Check for removed items...
                    this.items.clear();
                    this.items.add(validatedItems);
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
        var milestonesId = this.generateId();

        this.groups.add([
            {
                id: milestonesId,
                content: 'Milestones',
                style: 'background-color: orange; padding-right: 10px; padding-left: 5px'
            },
            {
                id: this.generateId(),
                content: 'Header',
                style: 'background-color: orange; padding-right: 10px; padding-left: 5px'
            },

        ]);

        this.items.add({ id: this.generateId(), content: 'Start of this year', start: start, type: 'point', group: milestonesId });
        this.items.add({ id: this.generateId(), content: 'End of this year', start: end, type: 'point', group: milestonesId });
    }

    createGroup = () => {
        this.groups.add(
            {
                id: this.generateId(),
                content: 'En ny grupp med långt namn, eller ännu längre...',
                style: 'background-color: gainsboro; padding-right: 10px; padding-left: 5px'
            },
        );
    }

    saveClicked = () => {
        let itemData = this.items.get({
            type: {
              start: 'ISODate',
              end: 'ISODate'
            }
        });
        let groupData = this.groups.get();

        var itemBOs = new Array<{id: string}>();
        this.items.map((item: {id: string, bizobject: boolean}) => {
            if (item.bizobject) {
                itemBOs.push({id: item.id});
            }
        });

        client.mutate({
            mutation: updatePlan,
            // fetchPolicy: 'network-only',
            variables: { 
                planId: this.selectedPlanId,
                planData: { items: itemData, groups: groupData },
                boId: this.props.selectedBO,
                itemBOs: itemBOs
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
                <Typography variant="h6">{this.state.selectedBOId !== '' ? 'Selected Plan: ' + this.props.selectedBoName : 'No Plan selected...'}</Typography>
                
                <Divider/>

                <div id="timeline" />
                <Button variant="contained" color="primary" className={this.props.classes.button} onClick={this.saveClicked} disabled={this.props.selectedBO === null}>Save</Button>
                <Button color="primary" className={this.props.classes.button} onClick={this.fitClicked} disabled={this.props.selectedBO === null}>Fit</Button>
                <Button color="primary" className={this.props.classes.button} onClick={this.createGroup} disabled={this.props.selectedBO === null}>Create Group</Button>
            </div>
        );
    }
}

export default withStyles(styles)(TimeLine);