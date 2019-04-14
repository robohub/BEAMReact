import * as React from 'react';
import { withStyles, WithStyles, createStyles, List, ListItem, ExpansionPanel, ExpansionPanelSummary, Divider, ExpansionPanelDetails, } from '@material-ui/core';
import { ViewWeek,  } from '@material-ui/icons';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { LayoutComp } from './templateConfigView';

export const expStyles = () => createStyles({
    root: {
        width: '100%'
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
    selectedTemplate: string
};

class MappedBOs extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedTemplate: null };
    }

    showTemplate = (expanded: boolean, id: string) => {
        if (expanded) {
            this.setState({selectedTemplate: id});
        } else {
            this.setState({selectedTemplate: null});
        }
    }

    render() {  
        return (
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
                        templateMappings.map((mapping: TemplateMappingType) =>
                            <ListItem key={mapping.id}>
                                {mapping.businessObject.name}
                                <div className={this.props.classes.root}>
                                    <ExpansionPanel
                                        onChange={(event, expanded) => this.showTemplate(expanded, mapping.template.id)}
                                        expanded={this.state.selectedTemplate === mapping.template.id}
                                    >
                                        <ExpansionPanelSummary expandIcon={<ViewWeek color={'primary'}/>}>
                                            {mapping.template.name}
                                        </ExpansionPanelSummary>
                                        <Divider/>

                                        <ExpansionPanelDetails>
                                            {this.state.selectedTemplate === mapping.template.id ?
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
                            </ListItem>
                        )

                    );
                }}
                </Query>
            </List>
        );
    }
}

export const MappedBOsView = withStyles(expStyles)(MappedBOs);