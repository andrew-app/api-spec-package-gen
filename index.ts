import type { BunFile } from "bun";
import { readdir, mkdir } from "node:fs/promises";
import {parse} from "yaml";
let domain = 'User';
domain = domain.toLowerCase();
const files = await readdir('./input');
const specDirectories = files.map(file => {
    const dirName = file
    .split('-')
    .filter(val => {
        switch (val.toLowerCase()) {
            case domain:
                return false;
            case 'spec.yml':
                return false;
            case 'spec.yaml':
                return false;
            case 'service':
                return false;
            default:
                return true;
        }
    })
    return dirName;
}).flat();

specDirectories.forEach(async dir => {
    try {
        await mkdir(`./output/${dir}`, { recursive: true });
        const specFile = Bun.file(`./input/${files.filter(file => file.includes(dir))}`);
        await Bun.write(`./output/${dir}/spec.yml`, specFile);
        console.log(`Directory ./output/${dir} created`);
        const version = await getVersion(specFile);
        const packageFile = generatePackage(dir, version);
        await Bun.write(`./output/${dir}/package.json`, packageFile);
    } catch (e) {
        console.error(e);
    }
});

const getVersion = async (specFile: BunFile): Promise<string> => {
    const yaml: string = await specFile.text();
    const parsedSpecYaml: SpecFile = parse(yaml);
    return parsedSpecYaml.info.version;
}

const generatePackage = (dir: string, version: string) => {
    const packageFile = `{
        "name": "@${domain}-service/${dir}",
        "version": "${version}",
        "description": "",
        "author": "",
        "license": "ISC"
}`.trim();
    return packageFile;
}


type SpecFile = {
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
}