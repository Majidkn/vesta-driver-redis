const vesta = require('@vesta/devmaid');

const config = {
    src: 'src',
    genIndex: true,
    targets: ['es6'],
    files: ['.npmignore', 'LICENSE', 'README.md'],
    transform: {
        package: (json, target) => {
            delete json.dependencies['@types/node'];
            delete json.dependencies['@types/redis'];
            delete json.scripts;
            delete json.devDependencies;
        }
    },
    publish: '--access=public'
};

const aid = new vesta.TypescriptTarget(config);
aid.createTasks();