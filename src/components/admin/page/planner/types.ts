
export type PlanConfig = {
    id: string;
    uiMoPlan: {
        id: string
        name: string
    };
    uiMoRelations: MetaRelation[]
};

export type MetaRelation = {
    id: string
    oppositeName: string

    oppositeRelation: {
        // id: string
        oppositeName: string
        incomingObject: {
            // id: string
            name: string
        }
    }};

export type FormValues = {
    available: MetaRelation[]
    selected: MetaRelation[]
};
