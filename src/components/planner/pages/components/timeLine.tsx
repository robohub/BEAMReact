import * as React from 'react';

import * as vis from 'vis';

import { Button, Snackbar, Divider, Typography, IconButton, } from '@material-ui/core';
// import * as moment from 'moment';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

import { updateBORelations } from '../../../../domain/businessObject';
import { RelatedBOType } from '../../../../domain/utils/boUtils';
import { SelectedPlanBOType, PlanDataType } from './types';
import { KeyboardArrowUp, KeyboardArrowDown, ToggleOffOutlined, SubdirectoryArrowRight, DeleteForeverOutlined, Menu } from '@material-ui/icons';
import { PureQueryOptions } from 'apollo-client';
import * as ReactDOM from 'react-dom';
// import * as ReactDOMServer from 'react-dom/server';

interface Props extends WithStyles<typeof styles> {
    tlContainerId: string;  // id for timeline - where rendered timeline will attach itself, used when using several timelines in same component
    plans: PlanDataType[];
    selectedBO: SelectedPlanBOType;
    updateSelectedBO: (boId: string) => void;
    readonly: boolean;
    getRefetchQueries?: (bo: SelectedPlanBOType) => PureQueryOptions[];
}

interface State {
    snackbarOpen: boolean;
    itemStacking: boolean;
    minimized: boolean;
    hiddenGroup: boolean;
}

class TimeLineComp extends React.Component<Props, State> {
    state = {
        snackbarOpen: false, /*selectedBO: {id: '', name: '', metaObjectId: '', },*/ itemStacking: true, minimized: false, hiddenGroup: false, hideTools: true
    };
    
    private selectedBO = {id: '', name: '', metaObjectId: '', } as SelectedPlanBOType;
    private container: HTMLElement;
    private timeline: vis.Timeline;
    private items = new vis.DataSet();
    private groups = new vis.DataSet();
    private selectedPlanId = '';
    private itemBOsInPlan: RelatedBOType[] = new Array<RelatedBOType>();
    private options = {};
    private snackbarMessage = '';
    private nestedIndex = 1;
    // private initItems = new vis.DataSet();

    componentDidMount() {

        this.container = document.getElementById(this.props.tlContainerId);
        // this.container = document.getElementById('vis2');
/*
        // Create a DataSet (allows two way data-binding)
        var items = new vis.DataSet([
          {id: 1, content: 'item 1', start: '2013-04-20'},
          {id: 2, content: 'item 2', start: '2013-04-14'},
          {id: 3, content: 'item 3', start: '2013-04-18'},
          {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
          {id: 5, content: 'item 5', start: '2013-04-25'},
          {id: 6, content: 'item 6', start: '2013-04-27'}
        ]);
*/      

        // Setup timeline
        this.container = document.getElementById(this.props.tlContainerId);
        
        var d = new Date();
        var start = d.getFullYear() + '-01-01';
        var end = d.getFullYear() + '-12-31';

        this.options = {
            start: start,  // Better performance?
            end: end,
//            autoResize: false,
            // groupOrder: 'content',  // groupOrder can be a property name or a sorting function
            // clickToUse: true,
            groupEditable: true,
            editable: true,
/*           editable: {
                add: true,         // add new items by double tapping AND DROPPING!
                updateTime: true,  // drag items horizontally
                updateGroup: true, // drag items from one group to another
                remove: true,       // delete an item by tapping the delete button top right
                overrideItems: false  // allow these options to override item.editable
            },*/
            multiselect: true,
            orientation: 'top',
            // tslint:disable-next-line:no-any
            onAdd : (item: any, callback: (arg0: any) => void) => {
                if (this.items.get(item.id) !== null) {
                    alert('Item already in added in plan...');
                    callback(null);
                } else {
                    if (item.bizobject) { item.className = 'orange';  } // See App.css for CSS classes
                    callback(item);
                }
            },
            margin: {
                item: 20,
            },
            zoomKey: 'ctrlKey',
            stack: true,
/*            // tslint:disable-next-line:no-any
            groupTemplate: (group: any, element: HTMLElement) => {
                return '<h6>' + group.content + '</h6>';
            },*/
            // tslint:disable-next-line:no-any
            groupTemplate: (group: any, element: HTMLElement) => {
                return ReactDOM.render(
//                return ReactDOMServer.renderToStaticMarkup(   // This render ok, but buttons don't work
                    <div style={{width: 200}}>
                        <Typography variant="subtitle2">{group.content}</Typography>
                        
                        <Divider/>

                        {!group.nestinglevel ?
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                {group.nestedGroups ?
                                    <IconButton  aria-label="Nested" onClick={e => this.hideShowNestedGroups(group)}>
                                        <Menu fontSize="small"/>
                                    </IconButton>
                                    :
                                    null
                                }
                                <IconButton  aria-label="Hide" onClick={e => this.hideGroup(group)}>
                                    <ToggleOffOutlined fontSize="small"/>
                                </IconButton>
                                <IconButton aria-label="Create nested group" onClick={e => this.addNestedGroup(group)}>
                                    <SubdirectoryArrowRight fontSize="small" />
                                </IconButton>
                                <IconButton aria-label="Delete" onClick={e => this.deleteGroup(group)}>
                                    <DeleteForeverOutlined fontSize="small"/>
                                </IconButton>
                            </div>
                            :
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <IconButton aria-label="Delete" onClick={e => this.deleteGroup(group)}>
                                    <DeleteForeverOutlined fontSize="small" />
                                </IconButton>
                            </div>
                        }
                    </div>,
                    element);
            },
            // tslint:disable-next-line:no-any
            template: (item: any, element: HTMLElement) => {
/*                if (item && item.content) {  // This works but is static --> no events sent like e.g. double-click!!!!
                    return ReactDOMServer.renderToStaticMarkup(<Typography variant="caption">{item.content}</Typography>);
                }
                return '';*/
/*                if (item && item.content) {
                    return ReactDOM.render(       // RH TODO This doesn't work any longer!!??? ---> Error saying 'content' property not present...
                        <Typography variant="caption">{item.content}</Typography>,
                        element);
                }
                return '';*/
                return '<caption>' + item.content + '</caption>';
            }
        };

//        // Create a Timeline
//        this.timeline = new vis.Timeline(this.container, items, this.options);

        this.timeline = new vis.Timeline(this.container, null, null, this.options);
        
        this.setupHackOverridingNestedButton(this.timeline);  // Otherwise my buttons (del, hide, etc...) in the group can't be reached...

        this.timeline.on('doubleClick', (event => {
            // tslint:disable-next-line:no-console
            console.log(event);
            if (event.item && this.selectedBO.id !== event.item) {
                // this.selectedObjId = e.currentTarget.id;
                this.props.updateSelectedBO(event.item);  // Will lead to change of plan...
            }            
        }));
        if (this.props.selectedBO.id !== '') {
            this.drawPlan();
        }
    }

    // tslint:disable-next-line:no-any
    setupHackOverridingNestedButton(timeline: any) {
        timeline.itemSet.groupHammer.off('tap');
    }

    componentDidUpdate() {
        // tslint:disable-next-line:no-console
        console.log('wwwwwwwwwwwwwwwwwwwwwwwwwww ---- TIMELINE componentUpdate...' + this.props.selectedBO.id);
        // tslint:disable-next-line:no-console
        if (this.props.selectedBO.id !== '') {
            this.drawPlan();
        }
    }

    generateId() {
        var timestamp = (new Date().getTime() / 1000 ).toString();
        return timestamp + (Math.random() * 16).toString();
    }

    validateItems(dataItems: {}[], connectedItems: {id: string, name: string}[]) {
        var newDataItems = new Array<{}>();
        var itemBOs = new Array<RelatedBOType>();  // Store the item BOs in the plan

        dataItems.map((item: {id: string, content: string, bizobject: boolean, className: string, mrid: string}) => {
            var found = false;
            var newItem = item;
            var newContent = item.content;
            for (var i = 0; i < connectedItems.length; i++) {  // As of now the ID of an object is 25-character string...
                if (item.bizobject && item.id === connectedItems[i].id ) {
                    found = true;
                    newContent = connectedItems[i].name;  // Update content, may have changed
                    itemBOs.push({boId: item.id, mrId: item.mrid});
                    break;
                }
            }
            if (!found && item.bizobject) {
                newContent = '-REMOVED- ' + item.content;
                newItem.bizobject = false;
                newItem.id = this.generateId();
                newItem.className = 'red';   // See App.css for CSS classes
            }
            newItem.content = newContent;
            newDataItems.push(newItem);
        });
        return { validatedItems: newDataItems, itemBOs: itemBOs };
    }

    getHighestNestedIndex = () => {
        let highestIndex = 1;
        let groups = this.groups.get();
        groups.map((group: {nestinglevel: number, id: number}) => {
            if (group.nestinglevel) {
                if (group.id > highestIndex) { highestIndex = group.id; }
            }
        });
        return highestIndex;
    }

    drawPlan() {
        if (this.props.plans.length === 0 ) {
            if (this.selectedBO.id !== this.props.selectedBO.id) {
                this.items.clear();
                this.groups.clear();
                this.nestedIndex = 1;
                this.selectedPlanId = '';
                this.itemBOsInPlan = new Array<RelatedBOType>();
                this.initTimeLineWithData();

                this.timeline.setData({items: this.items, groups: this.groups}); 
                this.timeline.redraw();
                this.timeline.fit();
                this.selectedBO = this.props.selectedBO;
                
            }
        } else {
            // Get items connected to selected BO
            let plan = this.props.plans[0];
            let { validatedItems, itemBOs } = this.validateItems(plan.planData.items, plan.itemBOs);  // Check for removed items...
            if (
                this.selectedBO.id !== this.props.selectedBO.id ||
                this.itemBOsHasChanged(itemBOs)
            ) {
                this.items.clear();
                this.items.add(validatedItems);
                this.itemBOsInPlan = this.getBOsFromItems();
                this.groups.clear();
                this.groups.add(plan.planData.groups);
                this.nestedIndex = this.getHighestNestedIndex() + 1;
                this.selectedPlanId = plan.id;

                this.timeline.setData({items: this.items, groups: this.groups}); 
                this.timeline.redraw();
                this.timeline.fit();
                this.selectedBO = this.props.selectedBO;
            }
        }
    }

    itemBOsHasChanged(newBOs: RelatedBOType[]) { // Checks if RefetchQuery (propbably) has changed planned item BOs
        var changed = this.getDeletedBOs(this.itemBOsInPlan, newBOs).length + this.getDeletedBOs(newBOs, this.itemBOsInPlan).length; // Deleted + added
        return changed;
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
                nestinglevel: 0
            },
            {
                id: this.generateId(),
                content: 'Header',
                nestinglevel: 0
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
                nestinglevel: 0
            },
        );
    }

    // tslint:disable-next-line:no-any
    deleteGroup = (group: any) => {
        // Remove connected items
        this.items.get().map((item: {id: string, group: string}) => {
            // Remove items in nested groups!
            if (item.group === group.id) {
                this.items.remove(item.id);
            }
        });
        // Remove nested groups
        if (group.nestedGroups) {
            for (var i = group.nestedGroups.length - 1; i >= 0; i-- ) {
                let ngid = group.nestedGroups[i];
                this.deleteGroup(this.groups.get(ngid));
            }
        }
        if (group.nestedInGroup) {
            // Remove reference to group in parent, if I am a nested group
            
            // tslint:disable-next-line:no-any
            this.groups.get().forEach((parent: any /*vis.DataGroup*/) => {
                if (parent.nestedGroups) {
                    let found = false;
                    parent.nestedGroups.forEach((ngid: number, index: number) => {
                        if (group.id ===  ngid) {
                            parent.nestedGroups.splice(index, 1); // Remove reference from nestedGroups
                            if (parent.nestedGroups.length === 0) {
                                // Update parent to reflect that nestedGroups empty ==> remove ArrowDown icon
                                this.groups.update({id: parent.id, nestedGroups: null});
                            }
                            found = true;
                            return;
                        }
                    });
                    if (found) {
                        return;
                    }
                }
            });
        }
        // Remove group
        this.groups.remove(group);

        // tslint:disable-next-line:no-console
        console.log('GROUPS after delete group: ' + JSON.stringify(this.groups.get(), null, 2));
        // tslint:disable-next-line:no-console
        console.log('ITEMS after delete group: ' + JSON.stringify(this.items.get(), null, 2));

    }

    hideGroup = (group: vis.DataGroup) => {
        this.groups.update({id: group.id, visible: false});
        this.setState({hiddenGroup: true});
        if (group.nestedGroups) {
            group.nestedGroups.forEach((ngid: number) => {
                this.groups.update({id: ngid, visible: false});
            });
        }
    }

    unhideGroups = () => {
        this.setState({hiddenGroup: false});
        // tslint:disable-next-line:no-any
        this.groups.forEach((group: any /*vis.DataGroup*/) => {
            // if (!group.visible && group.nestinglevel === 0) {  // Only unhide hidden parent groups!
            this.groups.update({id: group.id, visible: true});
            // }
        });
    }

    // tslint:disable-next-line:no-any
    addNestedGroup = (group: any /*vis.DataGroup*/) => {
        let nestedlist = group.nestedGroups;
        if (nestedlist) {
            // Secure that hidden nested groups will be shown
            group.nestedGroups.map((ngid: number) => {
                this.groups.update({id: ngid, visible: true});
            });    
            nestedlist.push(this.nestedIndex);
        } else {
            nestedlist = [this.nestedIndex];
        }
        this.groups.update({id: group.id, nestedGroups: nestedlist/*, showNested: true*/});
        this.groups.add(
            {
                id: this.nestedIndex++,
                content: 'Nested group...' + (this.nestedIndex - 1),
                nestinglevel: group.nestinglevel + 1,
                nestedInGroup: group.id,
                visible: true
            },
        );
    }

    // tslint:disable-next-line:no-any
    hideShowNestedGroups = (group: any /*vis.DataGroup*/) => {
        group.nestedGroups.map((ngid: number) => {
            // tslint:disable-next-line:no-any
            let nestedGroup = this.groups.get(ngid) as any;
            this.groups.update({id: ngid, visible: !nestedGroup.visible});
        });
        this.groups.update({id: group.id/*, showNested: !group.showNested*/});
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

    saveClicked = async () => {
        let itemData = this.items.get({
            type: {
              start: 'ISODate',
              end: 'ISODate'
            }
        });
        let groupData = this.groups.get();

        const itemBOs = this.getBOsFromItems();

        let delBOs = this.getDeletedBOs(this.itemBOsInPlan, itemBOs);
        let addedBOs = this.getDeletedBOs(itemBOs, this.itemBOsInPlan);

        var refetchQueries = this.props.getRefetchQueries(this.selectedBO);
   
//        if (addedBOs.length || delBOs.length) {  // Too simple, not taking planData changes in account!!!
        this.selectedPlanId = await updateBORelations(
            // For BO
            this.selectedBO.id,
            this.selectedBO.name,
            this.selectedBO.metaObjectId,
            addedBOs,
            delBOs,
            this.saveFinished,
            refetchQueries,
            // For Plan related update
            this.selectedPlanId,
            {items: itemData, groups: groupData},
            itemBOs
        );
//        }

        // this.itemBOsInPlan = itemBOs;   // Reflect new state...
    }

    fitClicked = () => {
        this.timeline.fit();
    }

    toggleStack = () => {
        this.timeline.setOptions({stack: !this.state.itemStacking});
        this.setState({itemStacking: !this.state.itemStacking});
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    toggleMinimize = () => {
        this.timeline.setOptions({height: !this.state.minimized ? '0px' : null});
        this.setState({minimized: !this.state.minimized});
    }

    render() {
        
        // tslint:disable-next-line:no-console
        console.log('xxxxxxxxxxxx ---- TIMELINE rendererar...' + this.props.selectedBO.id);

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

                <div style={{display: 'flex', justifyContent: 'left'}}>
                    {this.selectedBO.id !== '' ? 
                        <IconButton color="primary" onClick={this.toggleMinimize}>
                            {this.state.minimized ? <KeyboardArrowDown/> : <KeyboardArrowUp/>}
                        </IconButton>
                        :
                        null
                    }
                    <Typography variant="h6" style={{marginTop: 7}}>{this.selectedBO.id !== '' ? 'Selected Plan: ' + this.props.selectedBO.name : 'No Plan selected...'}</Typography>
                </div>

                <Divider/>

                <div id={this.props.tlContainerId} />
                <div id="vis2"/>
                {this.props.selectedBO.id !== '' ?
                    !this.props.readonly ?
                        <div>
                            <Button variant="contained" color="primary" className={this.props.classes.button} onClick={this.saveClicked} disabled={this.props.selectedBO.id === ''}>
                                Save
                            </Button>
                            <Button color="primary" className={this.props.classes.button} onClick={this.fitClicked} disabled={this.props.selectedBO.id === ''}>
                                Fit
                            </Button>
                            <Button color="primary" className={this.props.classes.button} onClick={this.createGroup} disabled={this.props.selectedBO.id === ''}>
                                Create Group
                            </Button>
                            <Button color="primary" className={this.props.classes.button} onClick={this.toggleStack} disabled={this.props.selectedBO.id === ''}>
                                Stack
                            </Button>
                            <Button color="primary" className={this.props.classes.button} onClick={this.unhideGroups} disabled={!this.state.hiddenGroup}>
                                Unhide
                            </Button>
                            <Button color="primary" className={this.props.classes.button} /*onClick={this.unhideGroups}*/ disabled={true/*this.props.selectedBO.id === ''*/}>
                                Unplanned
                            </Button>
                        </div>
                        :
                        null
                    :
                    null
                }
            </div>
        );
    }
}

export const TimeLine = withStyles(styles)(TimeLineComp);