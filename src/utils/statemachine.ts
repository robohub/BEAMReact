// type ConditionType = (metaField: string) => boolean;
// type FunctionType = (obj: BO, ...objectFields: string[]) => void;

export type SmSchemaType = {
    initial: string,
    final: string,
    transitions: { 
        event: string,
        from: string,
        to: string,
/*        onMoveActions: [{
            businessObject: string,   // Kanske inte behöver anges - objectFields som används ska kopplas till objektinstansen som äger denna statemachine-instansen
            objectFields: [string]
        }],*/
        /* TODO: conditions */
    }[],
};

/*
class Transition {
    name: string;
    from: string;
    to: string;
    move: Map<string, string>;   // Key = from + ':' event ==> to
    conditions: ConditionType[];
    onMove: FunctionType[];
}
*/
type State = string;
type Action = string;

export class StateMachine {
    initialState: string;
    finalState: string;
    // transitions: Transition[];
    transitions: Map<string, string>;   // Key = from + ':' event ==> to
    allActionsPerState: Map<State, Set<Action>>;

    constructor(schema: SmSchemaType) {
        this.initialState = schema.initial;
        this.finalState = schema.final;
        this.transitions = new Map<string, string>();  
        this.allActionsPerState = new Map<string, Set<string>>();
        schema.transitions.map(trans => {
            this.transitions.set(trans.from + ':' + trans.event, trans.to);
            var actions = this.allActionsPerState.get(trans.from);
            if (actions !== undefined) {
                actions.add(trans.event);
            } else {
                actions = new Set<string>(trans.event);
            }
            this.allActionsPerState.set(trans.from, actions);
        });
    }

    receiveEvent(from: string, event: string) {
        return this.transitions.get(from + ':' + event);  // Returns Undefined if a not valid transition
    }
/*
    getState(name: string): State {
        return new State(name);
    }*/
}
/*
class State {
    name: string;

    constructor(namn: string) {
        this.name = namn;
    }
}
*/
/*/////////////////////////////////////////////////////////////////////////////////*/
/*
class BO {
    name: string;
    owner: string;
    state: string;
    statemachine: StateMachine;
}
*/ 
/*
var mySchema = {
    initial: 'Created',
    final: 'Approved',
    transitions: [
        {event: 'Send for review', from: 'Created', to: 'In review'},
        {event: 'Reject', from: 'In review', to: 'Created'},
        {event: 'Review OK', from: 'In review', to: 'For approval'},
        {event: 'Reject', from: 'For approval', to: 'Created'},
        {event: 'Approve', from: 'For approval', to: 'Approved'},
    ]
};

var myObject = new BO;
myObject.name = 'Produktutveckling';
myObject.owner = 'Robert';
myObject.statemachine = new StateMachine(mySchema);
myObject.state = 'Created';

var newstate = myObject.statemachine.receiveEvent(myObject.state, 'Send for review');
myObject.state = (newstate === undefined) ? myObject.state : newstate;
// tslint:disable-next-line:no-console
console.log(myObject.state);

newstate = myObject.statemachine.receiveEvent(myObject.state, 'Send for review');
myObject.state = (newstate === undefined) ? myObject.state : newstate;
// tslint:disable-next-line:no-console
console.log(myObject.state);

newstate = myObject.statemachine.receiveEvent(myObject.state, 'Review OK');
myObject.state = (newstate === undefined) ? myObject.state : newstate;
// tslint:disable-next-line:no-console
console.log(myObject.state);

newstate = myObject.statemachine.receiveEvent(myObject.state, 'Reject');
myObject.state = (newstate === undefined) ? myObject.state : newstate;
// tslint:disable-next-line:no-console
console.log(myObject.state);
*/
