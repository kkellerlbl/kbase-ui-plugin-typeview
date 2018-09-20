define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_common/html',
    '../table',
    '../moduleVersionLink'
], function (
    ko,
    reg,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    ModuleVersionLinkComponent
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleName = params.moduleName;

            this.moduleVersion = params.moduleInfo.ver;

            this.versionsTable = params.moduleVersions.vers.map((version) => {
                const current = version === this.moduleVersion;
                return {
                    version: version,
                    created: version,
                    name: this.moduleName,
                    current: current,
                    id: this.moduleName + '-' + String(version)
                };
            });

            this.tableDef = {
                style: {
                    maxHeight: '20em',
                    backgroundColor: '#FFF'
                },
                sort: {
                    column: ko.observable('created'),
                    direction: ko.observable('asc')
                },
                columns: [
                    {
                        name: 'version',
                        label: 'Module version',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                return (b - a);
                            }
                        },
                        component: {
                            name: ModuleVersionLinkComponent.name(),
                            params: {
                                version: 'version',
                                id: 'id',
                                current: 'current'
                            }
                        }
                    },
                    {
                        name: 'created',
                        label: 'Created',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                return (b - a);
                            }
                        },
                        // in typedText format
                        type: 'date',
                        format: 'MMM D, YYYY [at] h:MMa'
                    }
                ]
            };
            this.tableDef.columnMap = this.tableDef.columns.reduce((map, column) => {
                map[column.name] = column;
                return map;
            }, {});

            this.table = ko.observableArray(this.versionsTable);
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
                    'This table shows all versions of this module: ',
                    gen.text('moduleName'),
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