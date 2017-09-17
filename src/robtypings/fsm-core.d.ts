declare module '@opuscapita/fsm-core' {
  
  interface FunctionType {
    name: string,
    arguments: {
      argument1: string;
      argument2: string;
    }
  }
  interface AutoType {
    name: string,
    arguments: {
      argument1: string;
      argument2: string;
    },
    negate: boolean;
  }

  interface TransitionType {
    from: string;
    to: string;
    event: string;
    guards: FunctionType[];
    actions:FunctionType[];
    automatic: AutoType[];
  }

  interface SchemaType {
    name: string,               
    initialState: string,                   
    finalStates: string[],
    objectStateFieldName: string,         
    transitions: TransitionType[];
  }

  interface ARGS {
    schema?: SchemaType;
    conditions?: JSON;
    actions?: JSON
  }

  export class MachineDefinition {

    constructor(args: ARGS)

  }


  export class Machine {
    constructor(schema: MachineDefinition);
    start(object: Object) : Promise<Object>;
    currentState(object: Object) : string;
  }
}