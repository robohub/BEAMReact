import * as React from 'react';
import { Table, TableHead, TableBody, TableCell, TableRow, Chip, Button, Paper, List, ListItem, ListItemText, ListItemIcon,
    /* Avatar,*/ Divider, Snackbar, IconButton, TextField, Fab, ListItemSecondaryAction, Typography } from '@material-ui/core';
import { Delete, Edit, ViewWeek, Add, Close,  } from '@material-ui/icons';
import { client } from '../../../../index';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const getTemplatesQuery = gql`
query getTemplates {
    templates {
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

export type TemplateType = {
    id: string
    name: string
    renderColumns: {
        id: string
        width: Number
        widgets: {
            id: string
            name: string
            type: string
        }[]
    }[]
};

const createTemplateMutation = gql`
mutation createTemplate($name: String!) {
    createTemplate(data: {name: $name}) {
        id
        name
        renderColumns {
            id
        }
    }
}
`;

const deleteTemplateMutation = gql`
mutation deleteTemplate($id: ID) {
    deleteTemplate(where: {id: $id}) {
        id
    }
}
`;

const updateTemplateColumnsMutation = gql`
mutation updateTemplate ($id: ID, $width: Int) {
    updateTemplate(
        where: {id: $id}
        data: {renderColumns: {create: [{width: $width}]}}
    ) {
        id
    }
}
`;

const deleteColumnMutation = gql`
mutation deleteColumn($id: ID) {
    deleteRenderColumn(where: {id: $id}) {
        id
    }
}
`;

const deleteWidgetMutation = gql`
mutation deleteWidget($id: ID) {
    deleteWidget(where: {id: $id}) {
        id
    }
}
`;

const addWidgetMutation = gql`
mutation updateColumn ($id: ID, $width: Int, $type: WidgetType!, $name: String, $text: String) {
    updateRenderColumn(
        where: {id: $id}
        data: {widgets: {create: [{width: $width, type: $type, name: $name, text: $text}]}}
    ) {
        id
    }
}
`;

interface Props extends WithStyles<typeof styles> {
    template: TemplateType;
    saveFunc?: (text: string) => void;  // If not provided, component renders read-only
}

class LayoutTable extends React.Component<Props> {

    addColumn = () => {
        client.mutate({
            mutation: updateTemplateColumnsMutation,
            variables: {id: this.props.template.id, width: 4},
            refetchQueries: [{query: getTemplatesQuery}],
            update: () => {
                this.props.saveFunc('Added Column');
            }
        });
    }

    deleteColumn = (id: string) => {
        client.mutate({
            mutation: deleteColumnMutation,
            variables: {id: id},
            refetchQueries: [{query: getTemplatesQuery}],
            update: () => {
                this.props.saveFunc('Deleted Column');
            }
        });
    }

    deleteWidget = (id: string) => {
        client.mutate({
            mutation: deleteWidgetMutation,
            variables: {id: id},
            refetchQueries: [{query: getTemplatesQuery}],
            update: () => {
                this.props.saveFunc('Deleted Widget');
            }
        });
    }

    addWidget = (id: string) => {
        client.mutate({
            mutation: addWidgetMutation,
            variables: {
                id: id,
                type: 'Text',
                width: 6,
                name: 'NO NAME',
                text: 'Detta är en default-text som lagras med automatik av Robert och BEAM... och de är bäst, det vet ju alla!'
            },
            refetchQueries: [{query: getTemplatesQuery}],
            update: () => {
                this.props.saveFunc('Added Widget');
            }
        });
    }

    render() {
        const { classes, template, saveFunc } = this.props;
        return (
            <List>
                {template.renderColumns.length ?
                    template.renderColumns.map((col, i) => (
                        <span key={i}>
                            <ListItem>
                                <ListItemIcon>
                                    <ViewWeek />
                                </ListItemIcon>
                                <ListItemText
                                    primary={'Column: ' + (i + 1) + ', width=' + col.width}
                                    secondary={
                                        <span>
                                            {col.widgets.map((widget, j) => 
                                                <span key={j} >
                                                    {saveFunc ?
                                                        <Chip
                                                            component={'span'}
                                                            label={'<' + widget.type + '> ' + widget.name}
                                                            onDelete={e => this.deleteWidget(widget.id)}
                                                            className={classes.button}
                                                        />
                                                        :
                                                        <Chip component={'span'} label={'<' + widget.type + '> ' + widget.name} className={classes.button}/>
                                                    }
                                                    {saveFunc ?
                                                        <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={e => this.addWidget(col.id)}>
                                                            <Add />
                                                        </Fab>
                                                        :
                                                        null
                                                    }
                                                </span>
                                                )}
                                        </span>
                                    }
                                />
                                {saveFunc ?
                                    <ListItemSecondaryAction>
                                        <IconButton aria-label="Delete" onClick={e => this.deleteColumn(col.id)}>
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                    :
                                    null
                                }
                            </ListItem>
                            <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>
                        </span>
                    ))
                    :
                    <Typography variant="body2">-No columns defined-</Typography>
                }
                {saveFunc ?    
                    <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.addColumn}>
                        <Add />
                    </Fab>
                    :
                    null
                }
            </List>
                    
        );
    }

}

export const LayoutComp =  withStyles(styles)(LayoutTable);

interface TProps extends WithStyles<typeof styles> {
}
export class TemplateConfig extends React.Component<TProps> {
    state = { snackbarOpen: false , templateName: ''};

    private dbMessage = '';

    deleteTemplate = (id: string) => {
        client.mutate({
            mutation: deleteTemplateMutation,
            variables: {id: id},
            refetchQueries: [{query: getTemplatesQuery}],
            update: () => {
                this.dbMessage = 'Removed Template';
                this.setState({snackbarOpen: true});
            }
        });
    }

    editTemplate = (id: string) => {
        // To be implemented
    }

    createTemplate = () => {
        client.mutate({
            mutation: createTemplateMutation,
            variables: {name: this.state.templateName},
            update: (cache, result) => {
                const data: {templates: TemplateType[]} = cache.readQuery({query: getTemplatesQuery});
                data.templates.push(result.data.createTemplate);
                cache.writeQuery({query: getTemplatesQuery, data});

                this.dbMessage = 'Created new Template';
                this.setState({snackbarOpen: true});
            }
        });   
    }

    handleInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        this.setState({templateName: event.target.value});
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    saved = (text: string) => {
        this.dbMessage = text;
        this.setState({snackbarOpen: true});
    }

    render() {  
        const { classes } = this.props;

        return (
            
            <div className={classes.root}>
                <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.createTemplate} disabled={this.state.templateName === ''}>
                    <Add />
                </Fab>
                <TextField id="input" placeholder="Add Template" onChange={this.handleInput} className={this.props.classes.textField}/>
                <Paper>
                    <div className={classes.root}>
                        <Typography variant="h6">Templates</Typography>
                    </div>
                    <Divider style={{marginTop: 10, marginBottom: 10}}/>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {' '}
                                </TableCell>
                                <TableCell>
                                    Name
                                </TableCell>
                                <TableCell>
                                    Columns
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            <Query query={getTemplatesQuery}>
                            {({ data, loading, error }) => {
                    
                                if (loading) { return <TableRow><TableCell>Loading templates...</TableCell></TableRow>; }
                                if (error) { return <TableRow><TableCell>ERROR: {error.message}</TableCell></TableRow>; }
                    
                                const templates = data.templates as TemplateType[];
                                return (
                                    templates.length ?
                                        templates.map(template =>
                                            <TableRow key={template.id}>
                                                <TableCell>
                                                    <Button onClick={() => this.deleteTemplate(template.id)} color={'secondary'}> <Delete/> </Button>
                                                    <Button onClick={() => this.editTemplate(template.id)} color={'primary'}> <Edit/> </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2">{template.name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <LayoutComp template={template} saveFunc={this.saved}/>
                                                </TableCell>
                                            </TableRow>
                                        )
                                        :
                                        <TableRow><TableCell>-No templates defined-</TableCell></TableRow>
                                );
                            }}
                            </Query>

                        </TableBody>

                    </Table>
                </Paper>
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.snackbarOpen}
                    autoHideDuration={3000}
                    onClose={this.snackbarClose}
                    ContentProps={{'aria-describedby': 'message-id'}}
                    message={<span id="message-id">{this.dbMessage}</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                            <Close/>
                        </IconButton>,
                    ]}
                />   
            </div>
        );
    }
}

export const TemplateConfigView =  withStyles(styles)(TemplateConfig);
