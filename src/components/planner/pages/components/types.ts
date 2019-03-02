
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
