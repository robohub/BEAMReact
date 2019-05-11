import * as React from 'react';

import * as vis from 'vis';
import { client } from '../../../../index';

import { Button, Snackbar, Divider, Typography } from '@material-ui/core';
// import * as moment from 'moment';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

import { updateBORelations } from '../../../../domain/businessObject';
import { RelatedBOType } from '../../../../domain/utils/boUtils';
import { getPlan, getConnectedItems, getItemBOs, getPlanBOs } from './queries';
import { SelectedPlanBOType } from './types';

/*
type PlanType = {
    id: string;
    planBO: { id: string },
    planData: { items: {}[], groups: string}
    itemBOs: {id: string, name: string}[]
};
*/

type ConnectedItemType = {
    outgoingRelations: {
        oppositeObject: {
            id: string
            name: string
        }
    }[]
};

/*
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
*/
interface Props extends WithStyles<typeof styles> {
    selectedBO: SelectedPlanBOType;
    updateSelectedBO: (boId: string) => void;
    readonly: boolean;
}

interface State {
    snackbarOpen: boolean;
    selectedBO: SelectedPlanBOType;
}

class TimeLine extends React.Component<Props, State> {
    state = {
        snackbarOpen: false, selectedBO: {id: '', name: '', metaObjectId: ''}
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
            if (event.item && this.state.selectedBO.id !== event.item) {
                // this.selectedObjId = e.currentTarget.id;
                this.props.updateSelectedBO(event.item);  // Will lead to change of plan...
            }            
        }));
        if (this.props.selectedBO.id !== '') {
            this.showTimeLine();
        }
    }

    componentDidUpdate() {
        if (this.props.selectedBO.id !== this.state.selectedBO.id) {
            this.showTimeLine();
        }
    }

    showTimeLine() {
        let bo = this.state.selectedBO;
        bo.id = this.props.selectedBO.id;
        this.setState({selectedBO: bo});

        this.items.clear();
        this.groups.clear();
        this.drawTimeLine();
    }

    generateId() {
        var timestamp = (new Date().getTime() / 1000 ).toString();
        return timestamp + (Math.random() * 16).toString();
    }

    validateItems(dataItems: {}[], connectedItems: ConnectedItemType) {
        var newDataItems = new Array<{}>();

        dataItems.map((item: {id: string, content: string, bizobject: boolean, className: string}) => {
            var found = false;
            var newItem = item;
            var newContent = item.content;
            for (var i = 0; i < connectedItems.outgoingRelations.length; i++) {  // As of now the ID of an object is 25-character string...
                if (item.bizobject && item.id === connectedItems.outgoingRelations[i].oppositeObject.id ) {
                    found = true;
                    newContent = connectedItems.outgoingRelations[i].oppositeObject.name;  // Update content, may have changed
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
        if (this.props.selectedBO.id !== '') {
            let plansResult = await client.query({
                query: getPlan,
                variables: { 
                    boid: this.props.selectedBO.id
                }
            });

            if (plansResult.data.plans.length === 0) {
                this.initTimeLineWithData();
                this.selectedPlanId = '';
            } else {
                // Get items connected to selected BO
                let result = await client.query({
                    query: getConnectedItems,
                    variables: { 
                        boid: this.props.selectedBO.id
                    }
                });
                let connectedItemsResult = result.data.businessObject as ConnectedItemType;

                let data = plansResult.data.plans[0].planData;
                let validatedItems = this.validateItems(data.items, connectedItemsResult);  // Check for removed items...
                this.items.clear();
                this.items.add(validatedItems);
                this.groups.clear();
                this.groups.add(data.groups);
                this.selectedPlanId = plansResult.data.plans[0].id;
            }                

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

    getBOsFromItems() {
        var itemBOs = new Array<RelatedBOType>();  // Filter out BOs
        this.items.map((item: {id: string, bizobject: boolean, mrid: string}) => {
            if (item.bizobject) {
                itemBOs.push({boId: item.id, mrId: item.mrid});
            }
        });
        return itemBOs;
    }

    getDeletedBOs(initBOs: RelatedBOType[], compareBOs: RelatedBOType[]) {
        let deleted = new Array<RelatedBOType>();
        initBOs.map(old => {
            let found = false;
            compareBOs.forEach(comp => {
                if (old.boId === comp.boId) {
                    found = true;
                    return;
                }
            });
            if (!found) { deleted.push(old); }
        });
        return deleted;
    }

    saveFinished = async () => {
        this.snackbarMessage = 'Timeplan saved';
        this.setState({snackbarOpen: true});
    }

    saveClicked = () => {
        let itemData = this.items.get({
            type: {
              start: 'ISODate',
              end: 'ISODate'
            }
        });
        let groupData = this.groups.get();

        var itemBOs = this.getBOsFromItems();
     
        updateBORelations(
            this.state.selectedBO.id,
            this.state.selectedBO.name,
            itemBOs,
            this.saveFinished,
            [
                {
                    query: getPlanBOs,
                },
                {
                    query: getPlan,
                    variables: {boid: this.props.selectedBO.id}                
                },
                {
                    query: getItemBOs,
                    variables: {moid: this.props.selectedBO.metaObjectId}
                }
            ],
            this.selectedPlanId,
            {items: itemData, groups: groupData},
        );
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
                <Typography variant="h6">{this.state.selectedBO.id !== '' ? 'Selected Plan: ' + this.props.selectedBO.name : 'No Plan selected...'}</Typography>
                
                <Divider/>

                <div id="timeline" />
                {!this.props.readonly ?
                    <div>
                        <Button variant="contained" color="primary" className={this.props.classes.button} onClick={this.saveClicked} disabled={this.props.selectedBO === null}>Save</Button>
                        <Button color="primary" className={this.props.classes.button} onClick={this.fitClicked} disabled={this.props.selectedBO.id === ''}>Fit</Button>
                        <Button color="primary" className={this.props.classes.button} onClick={this.createGroup} disabled={this.props.selectedBO.id === ''}>Create Group</Button>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}

export default withStyles(styles)(TimeLine);