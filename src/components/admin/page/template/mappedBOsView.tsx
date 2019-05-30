import * as React from 'react';
import { withStyles, WithStyles, createStyles, ExpansionPanel, ExpansionPanelSummary, Divider, ExpansionPanelDetails, 
    /*TableCell, Table, TableBody, TableHead,*/ List, ListItem, Paper, Typography, Theme, Grid, IconButton,  } from '@material-ui/core';
import { ViewWeek, Delete, Edit,  } from '@material-ui/icons';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { LayoutComp } from './templateConfigView';

export const expStyles = ({ mixins, spacing, typography }: Theme) => createStyles({
    root: {
        width: '100%',
        ...mixins.gutters(),
        ...typography.body1,
        paddingTop: spacing(1),
        paddingBottom: spacing(1),
    },
});

const getTemplateMappingsQuery = gql`
query getTemplateMappings{
    templateMappings{
        id
        template { id name }
        businessObject { id name }
    }
}
`;

type TemplateMappingType = {
    id: string
    template: {
        id: string
        name: string
    }
    businessObject: {
        id: string
        name: string
    }
};

const getTemplateQuery = gql`
query getTemplate($id: ID) {
    template(where: {id: $id}) {
        id
        name
        renderColumns {
            id
            width
            widgets {
                id
                name
                type
            }
        }
    }
}
`;

interface Props extends WithStyles<typeof expStyles> {}

type State = {
    selectedTemplate: number
};

class MappedBOs extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedTemplate: null };
    }

    showTemplate = (expanded: boolean, index: number) => {
        if (expanded) {
            this.setState({selectedTemplate: index});
        } else {
            this.setState({selectedTemplate: null});
        }
    }

    deleteMapping = (id: string) => {
        // RH TODO
    }

    editMapping = (id: string) => {
        // RH TODO
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper>
                <div className={classes.root}>
                    <Typography variant="h6">Mapped Business Objects</Typography>
                </div>
                <Divider style={{marginTop: 10, marginBottom: 10}}/>
                <List>
                    <Query query={getTemplateMappingsQuery}>
                    {({ loading, data: { templateMappings }, error }) => {
                        if (loading) {
                            return <div>Loading</div>;
                        }
                        if (error) {
                            return <div>ERROR: {error.message}</div>;
                        }
                        if (!templateMappings) { return 'Error in mapping table?...'; }

                        return (
                            templateMappings.map((mapping: TemplateMappingType, index: number) =>
                                <div key={index}>
                                    <ListItem >
                                        <Grid item={true} xs={10}>
                                            <Typography variant="subtitle2">{mapping.businessObject.name}</Typography>
                                        </Grid>
                                        <Grid item={true} xs={2}>
                                            <IconButton onClick={() => this.editMapping(mapping.id)} color={'primary'} ><Edit/></IconButton>
                                            <IconButton onClick={() => this.deleteMapping(mapping.id)} color={'secondary'} ><Delete/></IconButton>
                                        </Grid>
                                    </ListItem>
                                    <ListItem>
                                        <div className={this.props.classes.root}>
                                            <ExpansionPanel
                                                onChange={(event, expanded) => this.showTemplate(expanded, index)}
                                                expanded={this.state.selectedTemplate === index}
                                            >
                                                <ExpansionPanelSummary expandIcon={<ViewWeek color={'primary'}/>}>
                                                    {mapping.template.name}
                                                </ExpansionPanelSummary>
                                                <Divider/>

                                                <ExpansionPanelDetails>
                                                    {this.state.selectedTemplate === index ?
                                                        <Query query={getTemplateQuery} variables={{id: mapping.template.id}}>
                                                        {({ data: { template }, loading: loading2, error: error2 }) => {
                                                
                                                            if (loading2) { return 'Loading templates...'; }
                                                            if (error2) { return 'ERROR: {error2.message}'; }
                                                
                                                            return (
                                                                <LayoutComp template={template}/>
                                                            );
                                                        }}
                                                        </Query>
                                                        :
                                                        ''
                                                    }
                                                </ExpansionPanelDetails>

                                            </ExpansionPanel>
                                        </div>
                                    </ListItem>
                                    {index < templateMappings.length - 1 ? <Divider /> : null}
                                </div>
                            )

                        );
                    }}
                    </Query>
                </List>
            </Paper>
/*            <Table>
                <TableHead>
                    <TableCell>
                        Business Object
                    </TableCell>
                    <TableCell>
                        Mapped Template
                    </TableCell>
                </TableHead>
                <Query query={getTemplateMappingsQuery}>
                {({ loading, data: { templateMappings }, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <div>ERROR: {error.message}</div>;
                    }
                    if (!templateMappings) { return 'Error in mapping table?...'; }

                    return (
                        <TableBody>
                            {templateMappings.map((mapping: TemplateMappingType, index: number) =>
                                <div  key={index}>
                                    <TableCell>
                                        {mapping.businessObject.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className={this.props.classes.root}>
                                            <ExpansionPanel
                                                onChange={(event, expanded) => this.showTemplate(expanded, index)}
                                                expanded={this.state.selectedTemplate === index}
                                            >
                                                <ExpansionPanelSummary expandIcon={<ViewWeek color={'primary'}/>}>
                                                    {mapping.template.name}
                                                </ExpansionPanelSummary>
                                                <Divider/>

                                                <ExpansionPanelDetails>
                                                    {this.state.selectedTemplate === index ?
                                                        <Query query={getTemplateQuery} variables={{id: mapping.template.id}}>
                                                        {({ data: { template }, loading: loading2, error: error2 }) => {
                                                
                                                            if (loading2) { return 'Loading templates...'; }
                                                            if (error2) { return 'ERROR: {error2.message}'; }
                                                
                                                            return (
                                                                <LayoutComp template={template}/>
                                                            );
                                                        }}
                                                        </Query>
                                                        :
                                                        ''
                                                    }
                                                </ExpansionPanelDetails>
                                                <Divider />

                                            </ExpansionPanel>
                                        </div>
                                    </TableCell>
                                </div>
                            )}
                        </TableBody>

                    );
                }}
                </Query>
            </Table>*/
    );
    }
}

export const MappedBOsView = withStyles(expStyles)(MappedBOs);