import { readdir,readFile,writeFile,mkdir } from "node:fs/promises";
import { parse } from "yaml";
import type { SpecFile } from "@app-types/spec-file";
import type { PackageJson } from "@npm/types";
import { validatePlatform } from "@validations/platform";
import { getInput } from "@actions/core";
import { manifest } from "pacote";
import { publish } from "libnpmpublish";
//@ts-ignore
import pack from "libnpmpack";
import { existsSync } from "node:fs";
import { isExistingVersion } from "@validations/version";

async function main() {
    const platform = validatePlatform(getInput('platform',{ required: true }));
    let serviceName = getInput('service', { required: true });
    let packageAccess = getInput('access');
    if (packageAccess && packageAccess !== 'public' || packageAccess !== 'private') {
        packageAccess = 'private';
    }
    if (!serviceName) {
        throw new Error('Service name is required');
    }
    serviceName = serviceName.toLowerCase();
    const specDirectory = getInput('spec-directory', { required: true });
    const files = await readdir(specDirectory);
    const specDirectories = files.map((file: string) => {
        const dirName = file
        .split('-')
        .filter(val => {
            switch (val.toLowerCase()) {
                case serviceName:
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

    const getVersion = (specFile: string): string => {
        const parsedSpecYaml: SpecFile = parse(specFile);
        return parsedSpecYaml.info.version;
    }

    const generatePackage = (dir: string, version: string) => {
        const packageFile = `{
            "name": "@${platform}/${serviceName}-service-${dir}",
            "version": "${version}",
            "description": "OpenAPI spec for ${dir} in ${serviceName} service",
            "author": "${platform}",
            "license": "ISC"
    }`.trim();
        return packageFile;
    }

    specDirectories.forEach(async (dir: string) => {
        try {
            const specFile = await readFile(`${specDirectory}/${files.filter((file: string) => file.includes(dir))}`, 'utf-8');
            if (!existsSync(`./output/${dir}`)) {
                await mkdir(`./output/${dir}`, { recursive: true });
            }
            await writeFile(`./output/${dir}/spec.yml`, specFile);
            const version = getVersion(specFile);
            const packageFile = generatePackage(dir, version);
            await writeFile(`./output/${dir}/package.json`,  packageFile);
            const outputDir = `./output/${dir}`;
            const specPackage = await manifest(outputDir);
            console.log(outputDir);
            const tarData = await pack(outputDir);
            const isExisting = await isExistingVersion(`@${platform}/${serviceName}-service-${dir}`,version);
            if (isExisting) {
                return;
            }
            await publish(specPackage as PackageJson, tarData, {
                npmVersion: `@${platform}/${serviceName}-service-${dir}@${version}`,
                access: packageAccess,
                forceAuth: {
                    token: process.env.NPM_TOKEN
                }
            });
        } catch (e) {
            console.error(e);
        }
    });
}
main().catch(console.error);