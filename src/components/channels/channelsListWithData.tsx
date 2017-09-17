// import * as styles from '../../css/typed/styles.css';

import * as React from 'react';
import { gql, graphql, ChildProps } from 'react-apollo';

import { Col } from 'reactstrap';

const channelsListQuery = gql`
  query ChannelsListQuery {
    channels {
      id
      name
    }
  }
`;
type Channel = {
  name: string;
  id: string;
};
type Response = { 
  channels: Channel[];
};

const ChannelsList = graphql<Response>(channelsListQuery, {});

export default ChannelsList(({ data: { loading, channels, error } }) => { 
  if (loading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <h1>ERROR</h1>;
  } 
  return (
    <div className="channelsList">
      <Col sm={{ size: 'auto', offset: 2 }}>
        <AddChannelWithMutation />
      </Col>
      {channels.map(ch =>
        <div key={ch.id}>
          <Col sm={{ size: 'auto', offset: 2 }}>
            {ch.name}
          </Col>
        </div>
      )}
    </div>);
});

/********************************* */
const createChannelMutation = gql`
  mutation createChannel($name: String!) {
    createChannel(input : {name: $name}) {
      channel {
        id
        name
      }
    }
  }
`;
type ResponseCreate= {
  channel: Channel;
};
type InputProps = {
  name: string
};

class AddChannel extends React.Component<ChildProps<InputProps, ResponseCreate>, {}> {

  handleKeyUp = async (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === 13) {
      evt.persist();
      const { mutate } = this.props;
      const value = evt.currentTarget.value;
      evt.currentTarget.value = '';
      await mutate({ 
        variables: { name: value },
        optimisticResponse: {
          createChannel: {
            __typename : 'ChannelMutationPayload',   // ROB: funkar utan, men får warning att __typename saknas
            channel : {
              name: evt.currentTarget.value,
              id: Math.round(Math.random() * -1000000),
              __typename: 'Channel',
            },
          },
        },
        update: (store, { data: { createChannel } }) => {
            // Read the data from the cache for this query.
            const data: Response = store.readQuery({query: channelsListQuery });
            // Add our channel from the mutation to the end.
            data.channels.push(createChannel.channel);    // ROB: Eftersom DGRAPHQL payload returnerar "channel" och inte "id" o "namn" direkt!!!
            // Write the data back to the cache.
            store.writeQuery({ query: channelsListQuery, data });
        },
      });
    }
  }
  render() {
    return (
      <input type="text" placeholder="New channel" onKeyUp={this.handleKeyUp} />
    );
  }
}

const AddChannelWithMutation = graphql(createChannelMutation)(AddChannel);
