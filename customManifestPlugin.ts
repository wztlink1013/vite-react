import { Plugin } from 'vite';

function customManifestPlugin(): Plugin {
  return {
    name: 'custom-manifest-plugin',
    generateBundle(_options, bundle) {
      const manifestFile = Object.values(bundle).find(file => file.fileName === 'manifest.json');
      if (manifestFile) {
        // @ts-ignore
        const manifestContent = JSON.parse(manifestFile.source as string);
        const staticFiles = Object.values(bundle).reduce((acc, file) => {
          if (file.fileName && file.fileName!== 'manifest.json') {
            // @ts-ignore
            acc.push(file.fileName);
          }
          return acc;
        }, []);
        manifestContent.files = staticFiles;
        // @ts-ignore
        manifestFile.source = JSON.stringify(manifestContent, null, 2);
      }
    },
  };
}

export default customManifestPlugin;