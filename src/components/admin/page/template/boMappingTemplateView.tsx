import * as React from 'react';
import { withStyles, WithStyles, Paper, Grid, Fab, ListItem, ListItemText, Divider, Typography } from '@material-ui/core';

import { styles } from '../../../shared/style';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { MappedBOsView } from './mappedBOsView';
import { Add } from '@material-ui/icons';

import { MuiDownShiftComboBox } from '../../../shared/muiDownshift';
import { client } from '../../../..';

const getTemplateBOsQuery = gql`
query templateConfig {
    templateConfigs{
        id
        moObject {
            id
            name
            businessObjects { id name }
        }
    }
    templates {
        id
        name
    }
    templateMappings{
        id
        businessObject { id name }
    }
}
`;

const createMappingMutation = gql` 
mutation createMapping ($boId: ID, $tId:ID) {
    createTemplateMapping(
      data: {template: {connect: {id: $tId}}, businessObject: {connect: {id: $boId}}}
    ) {
      id
    }
}
`;

interface Props extends WithStyles<typeof styles> {}

class BoMappingTemplate extends React.Component<Props> {
    state = { selectBOValue: null as string, selectTemplateValue: null as string };

    addMapping = () => {
        client.mutate({
            mutation: createMappingMutation,
            variables: {
                boId: this.state.selectBOValue,
                tId: this.state.selectTemplateValue
            }
        }).then(() => {  // Remove save BO from unmapped option list...
            // Automatic?
        });
    }

    onSelectBoChange = (value: string) => {
        this.setState({selectBOValue: value});
    }

    onSelectTemplateChange = (value: string) => {
        this.setState({selectTemplateValue: value});
    }

    // tslint:disable-next-line:no-any
    displayTemplate = (item: any, props: any) => {
        let stateColor = 'rgba(0,0,0,0)';

        if (props['data-highlighted']) {
            stateColor = 'rgba(0,0,0,0.12)';
        }

        if (props['data-selected']) {
            stateColor = 'rgba(0,0,0,0.46)';
        }

        return (
            <ListItem
                button={true}
                {...props}
                style={{
                    backgroundColor: stateColor,
                    textAlign: 'left'
                }}
                key={`autocomplete-item-${item.value}`}
                dense={true}
            >
                <ListItemText
                    primary={`${item.label}`}
                />
            </ListItem>
        );
    }
        
    render() {
        const { classes } = this.props;

        return (
                
                <div>
                    <Query query={getTemplateBOsQuery}>
                    {({ loading, data: { templateConfigs, templates, templateMappings }, error }) => {
                        if (loading) {
                            return <div>Loading</div>;
                        }
                        if (error) {
                            return <div>ERROR: {error.message}</div>;
                        }

                        if (!templateConfigs) { return '-No template config made...'; }
                        if (!templates) { return '-No templates defined...'; }
                        if (!templateMappings) { templateMappings = []; }

                        let optionsBO = new Array<{label: string, value: string}>();
                        templateConfigs[0].moObject.businessObjects.map((bo: {id: string, name: string}) => {
                            let found = false;  // Sort out already mapped BOs
                            templateMappings.forEach((mapping: {businessObject: { id: string}}) => {
                                if (mapping.businessObject.id === bo.id) {
                                    found = true;
                                    return;
                                }
                            });
                            if (!found) { optionsBO.push({label: bo.name, value: bo.id}); }
                        });
                        
                        let optionsTemplate = new Array<{label: string, value: string}>();
                        templates.map((bo: {id: string, name: string}) =>
                            optionsTemplate.push({label: bo.name, value: bo.id})
                        );

                        return (
                            <Grid container={true} spacing={16}>
                                <Grid item={true} xs={12} md={5} xl={4}>
                                    <Paper>
                                        <div className={classes.root}>
                                            <Typography variant="h6">Map BO -> template</Typography>
                                        </div>
                                        
                                        <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                        
                                        <div className={classes.root}>
                                            <MuiDownShiftComboBox
                                                label="Unmapped Business Object"
                                                placeholder="Type/select Business Object..."
                                                options={optionsBO}
                                                onChange={this.onSelectBoChange}
                                            />
                                            <MuiDownShiftComboBox
                                                label="Template"
                                                placeholder="Type/select template..."
                                                options={optionsTemplate}
                                                onChange={this.onSelectTemplateChange}
                                            />
                                            <Fab
                                                size="small"
                                                color="primary"
                                                aria-label="Add"
                                                className={classes.button}
                                                onClick={this.addMapping}
                                                disabled={!this.state.selectBOValue || !this.state.selectTemplateValue}
                                            >
                                                <Add />
                                            </Fab>
                                        </div>
                                    </Paper>
                                </Grid>
                                <Grid item={true} xs={12} md={7} xl={8}>
                                    <Paper>
                                        <MappedBOsView/>
                                    </Paper>
                                </Grid>
                            </Grid>
                        );
                    }}
                    </Query>
                </div>
        );
    }
}

export const BoMappingTemplateView = withStyles(styles)(BoMappingTemplate);