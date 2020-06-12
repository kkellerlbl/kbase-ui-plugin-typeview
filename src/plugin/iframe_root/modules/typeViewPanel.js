define([
    'bluebird',
    'knockout',
    'kb_lib/html',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/nanoBus',
    'lib/tabset',
    './components/typeView/overview',
    './components/typeView/spec',
    './components/typeView/typesUsing',
    './components/typeView/typesUsed',
    './components/typeView/versions',
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
    TypesUsingComponent,
    TypesUsedComponent,
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

        const tabs = [
            {
                id: 'overview',
                tab: {
                    label: 'Overview'
                },
                panel: {
                    component: {
                        name: OverviewComponent.name(),
                        params: {
                            typeInfo: 'typeInfo'
                        }
                    }
                }
            },
            {
                id: 'spec',
                tab: {
                    label: 'Type Spec'
                },
                panel: {
                    component: {
                        name: SpecComponent.name(),
                        params: {
                            typeInfo: 'typeInfo'
                        }
                    }
                }
            },
            {
                id: 'typesUsing',
                tab: {
                    label: 'Types Using'
                },
                panel: {
                    component: {
                        name: TypesUsingComponent.name(),
                        params: {
                            typeInfo: 'typeInfo'
                        }
                    }
                }
            },
            {
                id: 'typesUsed',
                tab: {
                    label: 'Types used'
                },
                panel: {
                    component: {
                        name: TypesUsedComponent.name(),
                        params: {
                            typeInfo: 'typeInfo'
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
                            typeInfo: 'typeInfo'
                        }
                    }
                }
            }
        ];

        const vm = {
            bus,
            tabContext: {
                typeInfo: ko.observable()
            },
            tabs
        };

        function loadData(typeId) {
            const workspace = new GenericClient({
                module: 'Workspace',
                url: runtime.config('services.workspace.url'),
                token: runtime.service('session').getAuthToken()
            });

            return workspace.callFunc('get_type_info', [typeId]).spread((data) => {
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
            container.setAttribute('data-k-b-testhook-plugin', 'typeview');
        }

        function start(params) {
            return loadData(params.typeid).then((typeInfo) => {
                const title = [
                    'Type Specification for',
                    span({ style: { textDecoration: 'underline' } }, params.typeid)
                ].join(' ');

                runtime.send('ui', 'setTitle', title);

                vm.tabContext.typeInfo(typeInfo);

                container.innerHTML = gen
                    .component({
                        name: TabsetComponent.name(),
                        params: {
                            tabContext: 'tabContext',
                            bus: 'bus',
                            tabs: 'tabs'
                        }
                    })
                    .join('');

                ko.applyBindings(vm, container);

                if (params.tab) {
                    vm.bus.send('select-tab', params.tab);
                }
            });
        }

        function run(params) {
            return loadData(params.typeid).then((typeInfo) => {
                const title = [
                    'Type Specification for',
                    span({ style: { textDecoration: 'underline' } }, params.typeid)
                ].join(' ');
                runtime.send('ui', 'setTitle', title);

                if (params.tab) {
                    vm.bus.send('select-tab', params.tab);
                }

                vm.typeInfo(typeInfo);
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
            attach,
            start,
            run,
            stop,
            detach
        };
    }

    return {
        make: factory
    };
});
