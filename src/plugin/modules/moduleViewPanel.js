define([
    'bluebird',
    'knockout',
    'kb_common/html',
    'kb_ko/KO',
    'kb_ko/lib/nanoBus',
    'kb_ko/components/tabset',
    './components/moduleView/overview',
    './components/moduleView/spec',
    './components/moduleView/types',
    './components/moduleView/modulesIncluded',
    './components/moduleView/versions',
    'kb_common/jsonRpc/genericClient'
], function(
    Promise, 
    ko,
    html,
    KO,
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

    let t = html.tag,
        span = t('span');

    function factory(config) {
        let hostNode, container, runtime = config.runtime;
        let bus = new NanoBus();


        function loadData(moduleId) {
            let [, name, version] = /^(.+?)(?:-(.+?))?$/.exec(moduleId);

            let workspace = new GenericClient({
                module: 'Workspace',
                url: runtime.config('services.workspace.url'),
                token: runtime.service('session').getAuthToken()
            });
        
            let moduleParam = {
                mod: name
            };
            if (version) {
                moduleParam.ver = parseInt(version, 10);
            }

            return Promise.all([
                workspace.callFunc('get_module_info', [moduleParam]).spread((x) => {return x;}),
                workspace.callFunc('list_module_versions', [{mod: name}]).spread((x) => {return x;})
            ])
                .spread((moduleInfo, moduleVersions) => {
                    return [name, moduleInfo, moduleVersions];
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
        }

        function start(params) {
            return loadData(params.moduleid)
                // NOTE: Annoying but true, the module info does not contain the module name.
                .spread((moduleName, moduleInfo, moduleVersions) => {
                    let title = [
                        'Module Specification for',
                        span({ style: { textDecoration: 'underline' } }, params.moduleid)
                    ].join(' ');
                    runtime.send('ui', 'setTitle', title);

                    let vm = {
                        bus: bus,
                        moduleName: moduleName,
                        moduleInfo: moduleInfo
                    };
                    bus.on('ready', function () {
                        bus.send('add-tab', {
                            tab: {
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
                                            moduleName: moduleName,
                                            moduleInfo: moduleInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'spec',
                                tab: {                        
                                    label: 'Spec',
                                },
                                panel: {
                                    component: {
                                        name: SpecComponent.name(),
                                        params: {
                                            moduleName: moduleName,
                                            moduleInfo: moduleInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'typesUsing',
                                tab: {                        
                                    label: 'Types',
                                },
                                panel: {
                                    component: {
                                        name: TypesComponent.name(),
                                        params: {
                                            moduleName: moduleName,
                                            moduleInfo: moduleInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'includedModules',
                                tab: {                        
                                    label: 'Included modules',
                                },
                                panel: {
                                    component: {
                                        name: ModulesIncludedComponent.name(),
                                        params: {
                                            moduleName: moduleName,
                                            moduleInfo: moduleInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'versions',
                                tab: {                        
                                    label: 'Versions',
                                },
                                panel: {
                                    component: {
                                        name: VersionsComponent.name(),
                                        params: {
                                            moduleName: moduleName,
                                            moduleInfo: moduleInfo,
                                            moduleVersions: moduleVersions
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('select-tab', 0);
                    });

                    container.innerHTML = KO.komponent({
                        name: TabsetComponent.name(),
                        params: {
                            bus: 'bus',
                            
                        }
                    });

                    ko.applyBindings(vm, container);
                });
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
            attach, start, stop, detach
        };
    }

    return {
        make: factory
    };
});