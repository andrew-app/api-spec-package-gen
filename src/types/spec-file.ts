export type SpecFile = {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
    }
    servers: {
        url: string;
    }[]
    paths: any;
    components: any;
};