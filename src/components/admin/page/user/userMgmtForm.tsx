import * as React from 'react';
import { withStyles, WithStyles, Button, Paper, Typography, Divider, Select, FormControl, InputLabel, Input, MenuItem } from '@material-ui/core';

import { styles } from '../../../shared/style';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const getMetaAttrsQuery = gql`
query getMetaAttrs($moId: ID) {
    metaObject(
      where: {id: $moId}
    ) {
        id
        attributes {
            id
            name
            type
        }
    }
}
  `;

interface Props extends WithStyles<typeof styles> {
    selectedMO: string;
    selectedMA: string;
    metaObjects: {id: string; name: string}[];
    onSubmit: (moId: string, maId: string) => void;
}

interface State  {
    moId: string;
    maId: string;
}

class UserMgmt extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {moId: props.selectedMO, maId: props.selectedMA};
    }

    changeMoId(value: string) {
        this.setState({moId: value, maId: ''});
    }

    changeMaId(value: string) {
        this.setState({maId: value});
    }

    save = () => {
        if (this.state.maId === '') {
            alert('Not saved... Please finish selection of mappings!');
        } else {
            this.props.onSubmit(this.state.moId, this.state.maId);
        }
    }
    render() {
        const { classes } = this.props;

        return (
                <Paper>
                    <div className={classes.root}>
                        <Typography variant="h6">System User - Meta Domain mapping</Typography>
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
                                    onChange={ev => this.changeMoId(ev.target.value as string)}
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
                            <Query query={getMetaAttrsQuery} variables={{moId: this.state.moId}}>
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
                                                <InputLabel htmlFor="mainput" className={this.props.classes.select}>
                                                    Userid Mapped Meta Attribute
                                                </InputLabel>
                                                <Select 
                                                    className={this.props.classes.select}
                                                    value={this.state.maId}
                                                    onChange={ev => this.changeMaId(ev.target.value as string)}
                                                    input={<Input name="maSelect" id="mainput"/>}
                                                >
                                                    {data.metaObject.attributes.map((ma: {id: string, name: string, type: string}) => (
                                                        ma.type === 'String' ?
                                                        <MenuItem key={ma.id} value={ma.id}>
                                                            {ma.name}
                                                        </MenuItem>
                                                        :
                                                        null
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
                                disabled={this.state.maId === ''}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Paper>
        );
    }
}

export const UserMgmtForm = withStyles(styles)(UserMgmt);