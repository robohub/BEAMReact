import * as React from 'react';
// import { Input } from 'reactstrap';

/*
type BizAttributes = {
    metaAttributeId: string;
    value: string;
};
type BusinessObjectAttr = {
    bizAttributes: BizAttributes[];
};
*/

/* export default class GenerateModel extends React.Component */
export default class CreateBO extends React.Component/*<{}, BusinessObjectAttr>*/ {
  /*constructor() {
    super();
    this.state = {
      bizAttributes: [],
    };
  }*/

  /*updateInputValue() {
    this.setState({
      inputValue: evt.target.value
    });
  }*/
  render() {
    return (
/*        this.state.bizAttributes.map(attr => 
            <Input key={attr.metaAttributeId} value={attr.value}/>)*/
            <div>hej</div>
    );
  }

}

/*
ROB:

mutation nestedCreateBO {
  createBusinessObject(
      metaObjectId: "cj60j748guxya0161d85kpi5y",     // Existerande
      bizAttributes: [
          {
            metaAttributeId: "cj60m00j6vwqh0145xv6uotlr",    // existerande
            value: "Production"},                            // Nytt värde
          {
            metaAttributeId: "cj60m05atvucl0178ppyutkpv",    // existerande 
            value: "Göteborgsgatan 11"}]                     // Nytt värde
    )
    {  // Response
        id
        metaObject {
            id
            name
        }
        bizAttributes {
            metaAttribute {
                id
                name
            }
            value
        }
    }
}

ANOTHER EXAMPLE:

import gql from 'graphql-tag';
const BandMutation = gql`
  mutation (
    $name: String!
    $country: String
    $website: String
    $Members: [Person]
    $Contact: Person
    $Albums: [Albums]
  ) {
    createBand(
      name: $name
      Country: $Country
      Members: $Members
      Contact: $Contact
      Albums: $Albums
    ) {
      id
      members {
        id
      }
      contact {
        id
      }
      albums {
        id
        songs {
          id
        }
      }
    }
  }
`;

const variables = {
  name: "Stormo",
  country: "Italy",
  website: "https://stormo.bandcamp.com/"
  members: [{
    firstName: "Luca",
    lastName: "Rocco",
  }, {
    firstName: "Federico",
    lastName: "Trimeri",
  }, {
    firstName: "Giacomo",
    lastName: "Rento",
  }, {
    firstName: "Gabriele",
    lastName: "Coldepin",
  }],
  contact: {
    firstName: "Giacomo",
    lastName: "Rento",
  },
  albums: [{
    name: "SOSPESI NEL VUOTO BRUCEREMO IN UN ATTIMO E IL CERCHIO SARÀ CHIUSO",
    year: 2014,
    songs: [{
      trkNr: 1,
      title: "In Volo",
      duration: "02:50" ,
    }, {
      trkNr: 2,
      title: "Supernova",
      duration: "02:10" ,
    }, {
      trkNr: 3,
      title: "Fuga",
      duration: "01:24" ,
    }, {
      trkNr: 4,
      title: "Perchè La Bambina Cade",
      duration: "02:46",
    }]
  }, {
    name: "7",
    year: 2009,
    songs: [{
      trkNr: 1,
      title: "Incosiderata Putrefazione",
      duration: "03:18",
    }, {
      trkNr: 2,
      title: "Abbandono La Mia Volontà",
      duration: "03:20",
    }]
  }, {
    name: "Self-Titled EP",
    year: 2007,
    songs: [{
      trkNr: 4,
      title: "Quando Non Ci Sei",
      duration: "02:08",
    }, {
      trkNr: 5,
      title: "Al Punto Di Non Ritorno",
      duration: "04:36",
    }]
  }]
}

import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import BandMutation from './../graphql/BandMutation';
class CompanySettings extends Component {
  constructor(props) {
    super(props);
    this.sendData = this.sendData.bind(this);
  }
sendData(variables) {
    this.props.CreateBand({ variables })
    .then((response) => {
      window.alert('You submitted data about a new band');
    }).catch((e) => {
      console.error(e);
    });
  }
render() {
    return <FormCreateBand onSubmit={this.sendData} />;
  }
}
export default compose(
  // with this I can use the mutation with this.props.CreateBand
  graphql(BandMutation, { name: 'CreateBand' }),
  // I can write here other mutations or queries
)(CompanySettings);

*/
