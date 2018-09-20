define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_common/html',
    '../table',
    '../typeLink'
], function (
    ko,
    reg,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    TypeLinkComponent
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleName = params.moduleName;
            this.moduleVersion = params.moduleInfo.ver;

            this.includeModulesTable = Object.keys(params.moduleInfo.included_spec_version).map((moduleName) => {
                const version = params.moduleInfo.included_spec_version[moduleName];
                return {
                    name: moduleName,
                    version: version,
                    id: moduleName + '-' + version
                };
            });

            this.tableDef = {
                style: {
                    maxHeight: '20em',
                    backgroundColor: '#FFF'
                },
                sort: {
                    column: ko.observable('name'),
                    direction: ko.observable('desc')
                },
                messages: {
                    empty: 'No other modules are included'
                },
                columns: [
                    {
                        name: 'name',
                        label: 'Type name',
                        width: 50,
                        component: {
                            name: TypeLinkComponent.name(),
                            params: {
                                name: 'name',
                                id: 'id'
                            }
                        },
                        sort: {
                            comparator: (a, b) => {
                                if (a < b) {
                                    return -1;
                                } else if (a > b) {
                                    return 1;
                                }
                                return 0;
                            }
                        }
                    },
                    {
                        name: 'version',
                        label: 'Type version',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                // okay, the version is major.minor, which looks enough like
                                // a float that we can just sort like that :)
                                return (b - a);
                            }
                        },
                        style: {
                            fontFamily: 'monospace'
                        }
                    }
                ]
            };
            this.tableDef.columnMap = this.tableDef.columns.reduce((map, column) => {
                map[column.name] = column;
                return map;
            }, {});

            this.table = ko.observableArray(this.includeModulesTable);
        }
    }

    const t = html.tag,
        p = t('p'),
        div = t('div');

    function template() {
        return div({
            style: {
                marginTop: '10px',
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        },[
            div([
                p([
                    'This table shows all all other modules included in this module: ' ,
                    gen.text('moduleName'),
                    ', version ',
                    gen.text('moduleVersion'),
                    '.'
                ])
            ]),
            div({
                style: {
                    marginTop: '10px',
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                },
                dataBind: {
                    component: {
                        name: TableComponent.quotedName(),
                        params: {
                            table: 'tableDef',
                            rows: 'table'
                        }
                    }
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});