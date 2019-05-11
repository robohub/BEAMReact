import * as React from 'react';
import { Query, ChildProps } from 'react-apollo';
import { Dialog, DialogTitle, Button, Select, MenuItem, Input, FormControl, InputLabel } from '@material-ui/core';
import BOEditContainer from './BOEditContainer';
import { allMOQuery } from './queries';
import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './../../../shared/style';

import { BOEditType } from '../../../../domain/utils/boUtils';

interface RObject {
    id: string; name: string;
}

interface Response {
    metaObjects: RObject[];
}

type DropType = {
    label: string;
    value: string;
};

interface Props extends WithStyles<typeof styles> {
    setSelectedBO: (bo: BOEditType) => void;
}

class SelectBOType extends React.PureComponent<ChildProps<{}, Response> & Props> {

    state = { selected: false, selectedId: '', boType: '', visible: false };
    
    show = () => {
        this.setState({ visible: true });
        this.props.setSelectedBO(null); // Close any other editing form
      }
    
    hide = () => {
        this.setState({ visible: false });
    }

    render() {
        return (
            <Query query={allMOQuery}>
                {({ loading, data: { metaObjects }, error, refetch }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    }

                    // tslint:disable-next-line:no-console
                    console.log('SelectBOTYpe , nytt BO, renderar...');
                      
                    var objs = new Array<DropType>(0);
                    metaObjects.map((o: RObject) => {
                        objs.push({label: o.name, value: o.id});
                    });

                    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, child: React.ReactElement) => {
                        this.setState({selected: true, selectedId: event.target.value, boType: child.props.children});
                    };
    
                    return (
                        <div className={this.props.classes.root}>
                            <FormControl>
                                <InputLabel htmlFor="input">Select Type</InputLabel>
                                <Select 
                                    className={this.props.classes.select}
                                    value={this.state.selectedId}
                                    onChange={handleChange}
                                    input={<Input name="MetaObject" id="input"/>}
                                >
                                    {objs.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button disabled={!this.state.selected} variant={'contained'} color={'primary'} onClick={this.show} className={this.props.classes.button}>Create BO</Button>
                            <Dialog 
                                open={this.state.visible}
                                onClose={this.hide}
                                fullWidth={true}
                                maxWidth={'sm'}
                            >
                                <DialogTitle>
                                    {'Add Business Object: ' + this.state.boType}
                                </DialogTitle>
                                <div className={this.props.classes.root}>
                                    {this.state.selected ? <BOEditContainer newObject={true} metaID={this.state.selectedId}/> : '...'}
                                    </div>
                            </Dialog >
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default withStyles(styles)(SelectBOType);
