
export type PlanConfig = {
    uiMoPlan: {
        id: string;
        name: string
        businessObjects: BoType[]
    }
};

export type BoType = {
    id: string
    name: string
    plan: { id: string }
};

export type SelectedPlanBOType = {
    id: string;
    name: string;
    metaObjectId: string;
};

export type PlanDataType = {
    id: string;
    planBO: {
        id: string;
        name: string;
    }
    planData: {
        items: {}[]
        groups: {}[]
    };
    itemBOs: {
        id: string;
        name: string;
    }[]
};