define([
    'bluebird',
    'knockout',
    'kb_common/html',
    'kb_ko/KO',
    'kb_ko/lib/nanoBus',
    'kb_ko/components/tabset',
    './components/typeView/overview',
    './components/typeView/spec',
    './components/typeView/typesUsing',
    './components/typeView/typesUsed',
    './components/typeView/versions',
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
    TypesUsingComponent,
    TypesUsedComponent,
    VersionsComponent,
    GenericClient
) {
    'use strict';

    let t = html.tag,
        span = t('span');

    function factory(config) {
        let hostNode, container, runtime = config.runtime;
        let bus = new NanoBus();


        function loadData(typeId) {
            let workspace = new GenericClient({
                module: 'Workspace',
                url: runtime.config('services.workspace.url'),
                token: runtime.service('session').getAuthToken()
            });

            return workspace.callFunc('get_type_info', [typeId])
                .spread(function(data) {
                    return data;
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
            return loadData(params.typeid)
                .then((typeInfo) => {
                    let title = [
                        'Type Specification for',
                        span({ style: { textDecoration: 'underline' } }, params.typeid)
                    ].join(' ');
                    runtime.send('ui', 'setTitle', title);

                    let vm = {
                        bus: bus,
                        typeInfo: typeInfo
                    };
                    bus.on('ready', function () {
                        bus.send('add-tab', {
                            tab: {
                                id: 'overview',
                                tab: {                        
                                    label: 'Overview',
                                    // component: {
                                    //     name: NarrativeTabComponent.name(),
                                    //     params: {
                                    //         count: params.narrativesTotal
                                    //     }
                                    // }
                                },
                                panel: {
                                    component: {
                                        name: OverviewComponent.name(),
                                        // NB these params are bound here, not in the tabset.
                                        // TODO: this should be named viewModel since that is what it is...
                                        params: {
                                            // view: params.view,
                                            typeInfo: typeInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'spec',
                                tab: {                        
                                    label: 'Type Spec',
                                },
                                panel: {
                                    component: {
                                        name: SpecComponent.name(),
                                        params: {
                                            typeInfo: typeInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'typesUsing',
                                tab: {                        
                                    label: 'Types Using',
                                },
                                panel: {
                                    component: {
                                        name: TypesUsingComponent.name(),
                                        params: {
                                            typeInfo: typeInfo
                                        }
                                    }
                                }
                            }
                        }, false);

                        bus.send('add-tab', {
                            tab: {
                                id: 'typesUsed',
                                tab: {                        
                                    label: 'Types used',
                                },
                                panel: {
                                    component: {
                                        name: TypesUsedComponent.name(),
                                        params: {
                                            typeInfo: typeInfo
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
                                            typeInfo: typeInfo
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