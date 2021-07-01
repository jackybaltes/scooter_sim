import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const files = {
    URDFLoader: '../urdf/src/URDFLoader.js',
    URDFViewer: '../urdf/src/urdf-viewer-element.js',
    URDFManipulator: '../urdf/src/urdf-manipulator-element.js',
};

const isExternal = p => {

    return !!(/^three/.test(p) || Object.values(files).filter(f => p.indexOf(f) !== -1).length);

};

export default [
    // libraries
    ...Object.entries(files).map(([name, file]) => {

        const inputPath = path.join(__dirname, `./src/${ file }`);
        const outputPath = path.join(__dirname, `../urdf/umd/${ file }`);

        return {
            input: inputPath,
            treeshake: false,
            external: p => isExternal(p),

            output: {

                name,
                extend: true,
                format: 'umd',
                file: outputPath,
                sourcemap: true,

                globals: {
                    //path => /^three/.test(path) ? 'THREE' : null,
                    'URDFLoader' : 'URDFLoader',
                    'URDFViewer' : 'URDFViewer',
                    'three' : 'THREE',
                    'three/examples/jsm/loaders/STLLoader.js' : 'STLLoader_js',
                    'three/examples/jsm/loaders/ColladaLoader.js' : 'ColladaLoader_js',
                    'three/examples/jsm/controls/OrbitControls.js' : 'OrbitControls_js',

                },
            },

        };
    }),

    // examples
    {
        input: './src/main.js',
        plugins: [
            resolve(),
            typescript()
        ],
        output: {
            file: './bundle/index.js',
            format: 'iife',
            sourcemap: true,
        },
    },
];
