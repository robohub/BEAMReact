import * as React from 'react';
import { withStyles, WithStyles, Button, Paper, Typography, Divider, Select, FormControl, InputLabel, Input, MenuItem } from '@material-ui/core';

import { styles } from '../../../shared/style';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { client } from '../../../..';

const getMetaRelsQuery = gql`
query getMetaRels($moId: ID) {
    metaObject(
      where: {id: $moId}
    ) {
        id
        outgoingRelations {
            id
            oppositeName
            multiplicity
        }
    }
}
`;

const getOppRelQuery = gql`
query getOppRel($id: ID) {
    metaRelation(where: {id: $id}) {
      id
      oppositeRelation { id }
    }
}
`;

interface Props extends WithStyles<typeof styles> {
    selectedMO: string;
    selectedMR: string;
    metaObjects: {id: string; name: string}[];
    onSubmit: (moId: string, mrId: string, oppMRId: string) => void;
}

interface State  {
    moId: string;
    mrId: string;
}

class MappingForm extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {moId: props.selectedMO, mrId: props.selectedMR};
    }

    changeMoId(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({moId: event.target.value, mrId: ''});
    }

    changeMrId(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({mrId: event.target.value});
    }

    save = () => {
        client.query({
            query: getOppRelQuery,
            variables: {id: this.state.mrId}
        }).then(res => {
            let oppMRId = res.data.metaRelation.oppositeRelation.id;
            this.props.onSubmit(this.state.moId, this.state.mrId, oppMRId);
        });
    }

    render() {
        const { classes } = this.props;

        return (
                <Paper>
                    <div className={classes.root}>
                        <Typography variant="h6">User - Meta Object connection</Typography>
                    </div>
                    <Divider style={{marginTop: 10, marginBottom: 10}}/>
                    <div className={classes.root}>
                        <div>
                            <FormControl className={this.props.classes.button}>  {/* RH TODO: coordinate styles with better context driven names! */}
                                <InputLabel htmlFor="moinput" className={this.props.classes.select}>
                                    Mapped Meta Object
                                </InputLabel>
                                <Select 
                                    className={this.props.classes.select}
                                    value={this.state.moId}
                                    onChange={newValue => this.changeMoId(newValue)}
                                    input={<Input name="moSelect" id="moinput"/>}
                                >
                                    {this.props.metaObjects.map(opt => (
                                        <MenuItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* errors.moId && touched.moId ? (<div className={classes.errorText}>{errors.moId}</div>) : null */}
                        </div>
                        <div>
                        {this.state.moId !== '' ?
                            <Query query={getMetaRelsQuery} variables={{moId: this.state.moId}}>
                                {({ loading, data, error}) => {
                                    if (loading) {
                                        return <div>Loading options...</div>;
                                    }
                                    if (error) {
                                        return <div>Error: {error.message}</div>;
                                    }
                                    return (
                                        <div>
                                            <FormControl className={this.props.classes.button}>  {/* RH TODO: coordinate styles with better context driven names! */}
                                                <InputLabel htmlFor="mrinput" className={this.props.classes.select}>
                                                    Mapped Meta Relation
                                                </InputLabel>
                                                <Select 
                                                    className={this.props.classes.select}
                                                    value={this.state.mrId}
                                                    onChange={newValue => this.changeMrId(newValue)}
                                                    input={<Input name="mrSelect" id="mrinput"/>}
                                                >
                                                    {data.metaObject.outgoingRelations.map((mr: {id: string, oppositeName: string, multiplicity: string}) => (
                                                        // mr.multiplicity === 'One' ?
                                                        <MenuItem key={mr.id} value={mr.id}>
                                                            {mr.oppositeName}
                                                        </MenuItem>
                                                        // :
                                                        // null
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {/*errors.maId && touched.maId ? (<div className={classes.errorText}>{errors.maId}</div>) : null*/}
                                        </div>
                                    );
                                }}
                            </Query>
                            :
                            null
                        }
                    </div>
                        <div>
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ textTransform: 'none' }}
                                onClick={e => this.save()} 
                                className={classes.button}
                                disabled={this.state.mrId === ''}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Paper>
        );
    }
}

export const UserTemplateMappingForm = withStyles(styles)(MappingForm);