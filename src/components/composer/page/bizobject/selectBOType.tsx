import * as React from 'react';
import { gql, graphql, ChildProps } from 'react-apollo';
import { Segment, Dropdown } from 'semantic-ui-react';
import EditBOtModal from './editBOModal';

const allMOQuery = gql`
query allMetaObjects {
  allMetaObjects {
    id
    name
  }
}
`;

interface Response {
    allMetaObjects: { id: string, name: string }[];
}

type DropType = {
    text: string;
    value: string;
};

class SelectBOType extends React.Component<ChildProps<{}, Response>> {

    state = { selected: false, selectedId: '', boType: ''};
    
    render() {
        const { loading, allMetaObjects } = this.props.data;
        
        if (loading) {
            return <div>Loading</div>;
        }

        var objs = new Array<DropType>(0);
        allMetaObjects.map(o => {
            objs.push({text: o.name, value: o.id});
        });

        const changeSelected = ((event: React.ChangeEvent<HTMLSelectElement>, data: DropType) => {
            var index = objs.findIndex((x => x.value === data.value));
            this.setState({selected: true, selectedId: data.value, boType: objs[index].text});
        });

        return (         
            <Segment>
                <Dropdown placeholder="Select Type" search={true} selection={true} options={objs} onChange={changeSelected}/>
                {' '}
                <EditBOtModal selected={this.state.selected} metaID={this.state.selectedId} boType={this.state.boType}/>
            </Segment>
        );
    }
}

export default graphql<Response>(allMOQuery)(SelectBOType);
