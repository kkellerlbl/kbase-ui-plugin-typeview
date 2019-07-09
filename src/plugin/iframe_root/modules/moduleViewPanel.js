define([
    'bluebird',
    'knockout',
    'kb_lib/html',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/nanoBus',
    'kb_knockout/components/tabset',
    './components/moduleView/overview',
    './components/moduleView/spec',
    './components/moduleView/types',
    './components/moduleView/modulesIncluded',
    './components/moduleView/versions',
    'kb_lib/jsonRpc/genericClient'
], function (
    Promise,
    ko,
    html,
    gen,
    NanoBus,
    TabsetComponent,
    OverviewComponent,
    SpecComponent,
    TypesComponent,
    ModulesIncludedComponent,
    VersionsComponent,
    GenericClient
) {
    'use strict';

    const t = html.tag,
        span = t('span');

    function factory(config) {
        const runtime = config.runtime;
        let hostNode, container;
        const bus = new NanoBus();

        function loadData(moduleId) {
            return Promise.try(() => {
                const [name, version] = moduleId.split('-');

                const moduleParam = {
                    mod: name
                };
                if (typeof version === 'string') {
                    if (!/^[\d]+$/.test(version)) {
                        throw new Error('Module version, if provided, must be a non-negative integer');
                    }
                    moduleParam.ver = parseInt(version, 10);
                }

                const workspace = new GenericClient({
                    module: 'Workspace',
                    url: runtime.config('services.workspace.url'),
                    token: runtime.service('session').getAuthToken()
                });

                return Promise.all([
                    workspace.callFunc('get_module_info', [moduleParam]).spread((x) => {
                        return x;
                    }),
                    workspace.callFunc('list_module_versions', [{ mod: name }]).spread((x) => {
                        return x;
                    })
                ]).spread((moduleInfo, moduleVersions) => {
                    return [name, moduleInfo, moduleVersions];
                });
            });
        }

        // API

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.style.display = 'flex';
            container.style['flex-direction'] = 'column';
            container.style.flex = '1 1 0px';
            container.style.margin = '0 10px';
            container.setAttribute('data-k-b-testhook-plugin', 'typeview');
        }

        function start(params) {
            return (
                loadData(params.moduleid)
                    // NOTE: Annoying but true, the module info does not contain the module name.
                    .spread((moduleName, moduleInfo, moduleVersions) => {
                        const title = [
                            'Module Specification for',
                            span({ style: { textDecoration: 'underline' } }, params.moduleid)
                        ].join(' ');

                        runtime.send('ui', 'setTitle', title);

                        const tabs = [
                            {
                                id: 'overview',
                                tab: {
                                    label: 'Overview'
                                },
                                panel: {
                                    component: {
                                        name: OverviewComponent.name(),
                                        // NB these params are bound here, not in the tabset.
                                        // TODO: this should be named viewModel since that is what it is...
                                        params: {
                                            // view: params.view,
                                            moduleName: 'moduleName',
                                            moduleInfo: 'moduleInfo'
                                        }
                                    }
                                }
                            },
                            {
                                id: 'spec',
                                tab: {
                                    label: 'Spec'
                                },
                                panel: {
                                    component: {
                                        name: SpecComponent.name(),
                                        params: {
                                            moduleName: 'moduleName',
                                            moduleInfo: 'moduleInfo'
                                        }
                                    }
                                }
                            },
                            {
                                id: 'typesUsing',
                                tab: {
                                    label: 'Types'
                                },
                                panel: {
                                    component: {
                                        name: TypesComponent.name(),
                                        params: {
                                            moduleName: 'moduleName',
                                            moduleInfo: 'moduleInfo'
                                        }
                                    }
                                }
                            },
                            {
                                id: 'includedModules',
                                tab: {
                                    label: 'Included modules'
                                },
                                panel: {
                                    component: {
                                        name: ModulesIncludedComponent.name(),
                                        params: {
                                            moduleName: 'moduleName',
                                            moduleInfo: 'moduleInfo'
                                        }
                                    }
                                }
                            },
                            {
                                id: 'versions',
                                tab: {
                                    label: 'Versions'
                                },
                                panel: {
                                    component: {
                                        name: VersionsComponent.name(),
                                        params: {
                                            moduleName: 'moduleName',
                                            moduleInfo: 'moduleInfo',
                                            moduleVersions: 'moduleVersions'
                                        }
                                    }
                                }
                            }
                        ];

                        const vm = {
                            bus: bus,
                            tabContext: {
                                moduleName: moduleName,
                                moduleInfo: moduleInfo,
                                moduleVersions: moduleVersions
                            },
                            tabs: tabs
                        };

                        container.innerHTML = gen
                            .component({
                                name: TabsetComponent.name(),
                                params: {
                                    tabContext: '$root.tabContext',
                                    bus: 'bus',
                                    tabs: 'tabs'
                                }
                            })
                            .join('');

                        ko.applyBindings(vm, container);
                    })
            );
        }

        function stop() {
            bus.stop();
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach,
            start,
            stop,
            detach
        };
    }

    return {
        make: factory
    };
});
