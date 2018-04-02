define([
    'knockout',
    'kb_ko/KO',
    'kb_ko/lib/viewModelBase',
    'kb_ko/lib/generators',
    'kb_common/html',
    '../table',
    '../typeLink'
], function (
    ko,
    KO,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    TypeLinkComponent
) {
    'use strict';

    let t = html.tag,
        div = t('div'),
        p = t('p');

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleName = params.moduleName;

            this.moduleInfo = params.moduleInfo;

            this.typesTable = Object.keys(params.moduleInfo.types).map((typeId) => {
                let [,typeName, typeVer] = typeId.match(/^(.+?)-(.+?)$/);
                return {
                    name: typeName,
                    version: typeVer,
                    id: typeId
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
                    empty: 'No types are specified in this module'
                },
                columns: [
                    {
                        name: 'name',
                        label: 'Type name',
                        width: 50,
                        component: {
                            name: TypeLinkComponent.name(),
                            // note params interpreted in the context
                            // of the row. So, name is property of the row...
                            params: '{name: name, id: id}'
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
                                return (parseFloat(b) - parseFloat(a));
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

            let direction = ko.pureComputed(() => {
                return (this.tableDef.sort.direction() === 'desc' ? -1 : 1);
            });

            this._table = ko.observableArray(this.typesTable);

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
                    'This table shows all types defined by this module: ',
                    gen.text('moduleName'),
                    ', version ',
                    gen.text('moduleInfo.ver'),
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