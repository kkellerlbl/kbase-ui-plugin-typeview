define([
    'knockout',
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_ko/lib/generators',
    'kb_common/html',
    '../table',
    '../moduleVersionLink'
], function (
    ko,
    KO,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    ModuleVersionLinkComponent
) {
    'use strict';

    let t = html.tag,
        p = t('p'),
        div = t('div');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleName = params.moduleName;

            this.moduleVersion = params.moduleInfo.ver;

            this.versionsTable = params.moduleVersions.vers.map((version) => {
                let current = version === this.moduleVersion;
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
                                // okay, the version is major.minor, which looks enough like
                                // a float that we can just sort like that :)
                                return (b - a);
                            }
                        },
                        component: {
                            name: ModuleVersionLinkComponent.name(),
                            params: '{version: version, id: id, current: current}'
                        }                 
                    },
                    {
                        name: 'created',
                        label: 'Created',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                // okay, the version is major.minor, which looks enough like
                                // a float that we can just sort like that :)
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

            let direction = ko.pureComputed(() => {
                return (this.tableDef.sort.direction() === 'desc' ? -1 : 1);
            });

            this._table = ko.observableArray(this.versionsTable);

            this.table = ko.pureComputed(() => {
                return this._table.sorted((a, b) => {
                    let c = this.tableDef.sort.column();
                    let x = direction() * this.tableDef.columnMap[c].sort.comparator(a[c], b[c]);
                    return x;
                });
            });

        }
    }

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
                            tableDef: 'tableDef',
                            table: 'table'
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

    return KO.registerComponent(component);
});