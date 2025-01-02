export const isExistingVersion = async (packageName: string,version: string): Promise<boolean> => {
    const url = `https://registry.npmjs.org/${packageName}/${version}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.NPM_TOKEN}`
        }
    })
    if (!response.ok) {
        if (response.status !== 404) {
            throw new Error(`Response status: ${response.status}`);
        }
        return false;
    }

    console.log(`Package ${packageName} with version ${version} already exists skipping...`);
    return true;
    
}
